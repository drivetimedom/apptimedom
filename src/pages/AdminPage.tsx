import React, { useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFromStorage, 
  setToStorage, 
  STORAGE_KEYS, 
  Course, 
  Lesson, 
  User, 
  Progress, 
  Banner, 
  Category, 
  generateId 
} from '@/lib/storage';
import { resetData } from '@/lib/seedData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  BookOpen,
  PlayCircle,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Image,
  FolderOpen,
  Copy,
  RefreshCw,
  FileText,
  GripVertical,
  Key,
  Palette,
  Settings,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useCreateUser';
import UserFormModal from '@/components/admin/UserFormModal';
import CourseFormModal from '@/components/admin/CourseFormModal';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import ImportExportUsers from '@/components/admin/ImportExportUsers';
import CustomizationSettings from '@/components/admin/CustomizationSettings';
import AdminCommercialTracking from '@/components/admin/AdminCommercialTracking';
import ActivationPlanTemplates from '@/components/admin/ActivationPlanTemplates';
import AdminMapsManager from '@/components/admin/AdminMapsManager';
import AdminChallengesManager from '@/components/admin/AdminChallengesManager';
import AdminSwipeFileManager from '@/components/admin/AdminSwipeFileManager';
import { ClipboardList, Map, Trophy } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const { createUser, isLoading: isCreatingUser } = useCreateUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [users, setUsers] = useState(() => getFromStorage<User[]>(STORAGE_KEYS.USERS, []));
  const [courses, setCourses] = useState(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []));
  const [lessons, setLessons] = useState(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []));
  const [banners, setBanners] = useState(() => getFromStorage<Banner[]>(STORAGE_KEYS.BANNERS, []));
  const [categories, setCategories] = useState(() => getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []));
  const swipeProcesses = useMemo(() => getFromStorage<any[]>(STORAGE_KEYS.SWIPEFILE_PROCESSES, []), []);

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Banner form state
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkType: 'page' as 'course' | 'external' | 'page',
    linkTo: '',
    ctaText: '',
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // Filter states
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<string>('all');
  const [courseStatusFilter, setCourseStatusFilter] = useState<string>('all');

  // Filtered data - must be before early return
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = userTypeFilter === 'all' || u.type === userTypeFilter;
      const matchesStatus = userStatusFilter === 'all' || 
        (userStatusFilter === 'active' ? u.active : !u.active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [users, searchQuery, userTypeFilter, userStatusFilter]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = courseCategoryFilter === 'all' || 
        c.categoryIds?.includes(courseCategoryFilter) || c.category === courseCategoryFilter;
      const matchesStatus = courseStatusFilter === 'all' || c.status === courseStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, courseCategoryFilter, courseStatusFilter]);

  const existingEmails = useMemo(() => users.map(u => u.email.toLowerCase()), [users]);
  const existingSlugs = useMemo(() => categories.map(c => c.slug), [categories]);

  // Stats
  const totalUsers = users.length;
  const totalCourses = courses.length;
  const totalLessons = lessons.length;
  const activeUsers = users.filter(u => u.active).length;
  const publishedCourses = courses.filter(c => c.status === 'published').length;
  const activeBanners = banners.filter(b => b.active).length;
  const activeCategories = categories.filter(c => c.active).length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Acesso não autorizado</p>
      </div>
    );
  }

  // ====================
  // USER FUNCTIONS
  // ====================
  const openUserModal = (user?: User) => {
    setEditingUser(user || null);
    setUserModalOpen(true);
  };

  const saveUser = async (userData: Partial<User> & { password?: string }) => {
    if (editingUser) {
      // Update existing user (still uses localStorage for now)
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userData, password: userData.password || u.password }
          : u
      );
      setUsers(updatedUsers);
      setToStorage(STORAGE_KEYS.USERS, updatedUsers);
      toast({ title: 'Usuário atualizado!' });
      setUserModalOpen(false);
      setEditingUser(null);
    } else {
      // Create new user via Edge Function (real auth)
      if (!userData.password) {
        toast({ title: 'Senha é obrigatória', variant: 'destructive' });
        return;
      }

      const result = await createUser({
        email: userData.email || '',
        password: userData.password,
        name: userData.name || '',
        role: userData.type || 'user',
      });

      if (!result.success) {
        toast({ 
          title: 'Erro ao criar usuário', 
          description: result.error,
          variant: 'destructive' 
        });
        return;
      }

      // Also save to localStorage for local display
      const newUser: User = {
        id: result.userId || generateId(),
        name: userData.name || '',
        email: userData.email || '',
        password: '', // Don't store password locally
        type: userData.type || 'user',
        avatar: userData.avatar,
        active: userData.active ?? true,
        unlockedCourses: userData.unlockedCourses || [],
        createdAt: new Date().toISOString(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setToStorage(STORAGE_KEYS.USERS, updatedUsers);
      
      toast({ title: 'Usuário criado com sucesso!' });
      setUserModalOpen(false);
      setEditingUser(null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    );
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    toast({ title: 'Status do usuário atualizado' });
  };

  const changeUserType = (userId: string, newType: 'admin' | 'instructor' | 'user') => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, type: newType } : u
    );
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    toast({ title: 'Tipo de usuário atualizado' });
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({ title: 'Você não pode excluir sua própria conta', variant: 'destructive' });
      return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    toast({ title: 'Usuário excluído' });
    setDeleteConfirm(null);
  };

  // ====================
  // COURSE FUNCTIONS
  // ====================
  const openCourseModal = (course?: Course) => {
    setEditingCourse(course || null);
    setCourseModalOpen(true);
  };

  const saveCourse = (courseData: Course, courseLessons: Lesson[]) => {
    let updatedCourses: Course[];
    
    if (editingCourse) {
      updatedCourses = courses.map(c => c.id === editingCourse.id ? courseData : c);
      toast({ title: 'Curso atualizado!' });
    } else {
      updatedCourses = [...courses, courseData];
      toast({ title: 'Curso criado!' });
    }
    
    setCourses(updatedCourses);
    setToStorage(STORAGE_KEYS.COURSES, updatedCourses);

    // Update lessons
    const otherLessons = lessons.filter(l => l.courseId !== courseData.id);
    const updatedLessons = [...otherLessons, ...courseLessons];
    setLessons(updatedLessons);
    setToStorage(STORAGE_KEYS.LESSONS, updatedLessons);
    
    setCourseModalOpen(false);
    setEditingCourse(null);
  };

  const duplicateCourse = (course: Course) => {
    const duplicatedCourse: Course = {
      ...course,
      id: generateId(),
      title: `${course.title} (Cópia)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
    
    // Duplicate modules with new IDs
    const moduleIdMap: Record<string, string> = {};
    duplicatedCourse.modules = course.modules.map(m => {
      const newModuleId = generateId();
      moduleIdMap[m.id] = newModuleId;
      return { ...m, id: newModuleId, lessonIds: [] };
    });

    // Duplicate lessons
    const courseLessons = lessons.filter(l => l.courseId === course.id);
    const duplicatedLessons: Lesson[] = courseLessons.map(l => {
      const newLessonId = generateId();
      const newModuleId = moduleIdMap[l.moduleId] || l.moduleId;
      
      // Add lesson ID to module
      const moduleIndex = duplicatedCourse.modules.findIndex(m => m.id === newModuleId);
      if (moduleIndex !== -1) {
        duplicatedCourse.modules[moduleIndex].lessonIds.push(newLessonId);
      }
      
      return {
        ...l,
        id: newLessonId,
        courseId: duplicatedCourse.id,
        moduleId: newModuleId,
      };
    });

    const updatedCourses = [...courses, duplicatedCourse];
    const updatedLessons = [...lessons, ...duplicatedLessons];
    
    setCourses(updatedCourses);
    setLessons(updatedLessons);
    setToStorage(STORAGE_KEYS.COURSES, updatedCourses);
    setToStorage(STORAGE_KEYS.LESSONS, updatedLessons);
    
    toast({ title: 'Curso duplicado!' });
  };

  const toggleCourseStatus = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const newStatus: 'draft' | 'published' = course.status === 'published' ? 'draft' : 'published';
    const updatedCourses = courses.map(c => 
      c.id === courseId ? { ...c, status: newStatus } : c
    );
    setCourses(updatedCourses as Course[]);
    setToStorage(STORAGE_KEYS.COURSES, updatedCourses);
    toast({ title: newStatus === 'published' ? 'Curso publicado!' : 'Curso despublicado' });
  };

  const deleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(c => c.id !== courseId);
    const updatedLessons = lessons.filter(l => l.courseId !== courseId);
    
    setCourses(updatedCourses);
    setLessons(updatedLessons);
    setToStorage(STORAGE_KEYS.COURSES, updatedCourses);
    setToStorage(STORAGE_KEYS.LESSONS, updatedLessons);
    
    toast({ title: 'Curso excluído' });
    setDeleteConfirm(null);
  };

  // ====================
  // CATEGORY FUNCTIONS
  // ====================
  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category || null);
    setCategoryModalOpen(true);
  };

  const saveCategory = (categoryData: Category) => {
    let updatedCategories: Category[];
    
    if (editingCategory) {
      updatedCategories = categories.map(c => c.id === editingCategory.id ? categoryData : c);
      toast({ title: 'Categoria atualizada!' });
    } else {
      updatedCategories = [...categories, categoryData];
      toast({ title: 'Categoria criada!' });
    }
    
    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const toggleCategoryStatus = (categoryId: string) => {
    const updatedCategories = categories.map(c => 
      c.id === categoryId ? { ...c, active: !c.active } : c
    );
    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    toast({ title: 'Status da categoria atualizado' });
  };

  const deleteCategory = (categoryId: string) => {
    // Check if courses are using this category
    const coursesUsingCategory = courses.filter(c => 
      c.categoryIds?.includes(categoryId) || c.category === categoryId
    );
    
    if (coursesUsingCategory.length > 0) {
      toast({ 
        title: `Não é possível excluir. ${coursesUsingCategory.length} curso(s) usando esta categoria.`, 
        variant: 'destructive' 
      });
      setDeleteConfirm(null);
      return;
    }
    
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    toast({ title: 'Categoria excluída' });
    setDeleteConfirm(null);
  };

  // ====================
  // BANNER FUNCTIONS
  // ====================
  const openBannerDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl,
        linkType: banner.linkType,
        linkTo: banner.linkTo,
        ctaText: banner.ctaText || '',
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkType: 'page',
        linkTo: '',
        ctaText: '',
      });
    }
    setBannerDialogOpen(true);
  };

  const saveBanner = () => {
    if (!bannerForm.title || !bannerForm.imageUrl) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    let updatedBanners: Banner[];
    if (editingBanner) {
      updatedBanners = banners.map(b => 
        b.id === editingBanner.id ? { ...b, ...bannerForm } : b
      );
    } else {
      const newBanner: Banner = {
        id: generateId(),
        ...bannerForm,
        active: true,
        order: banners.length + 1,
      };
      updatedBanners = [...banners, newBanner];
    }

    setBanners(updatedBanners);
    setToStorage(STORAGE_KEYS.BANNERS, updatedBanners);
    setBannerDialogOpen(false);
    toast({ title: editingBanner ? 'Banner atualizado' : 'Banner criado' });
  };

  const toggleBannerStatus = (bannerId: string) => {
    const updatedBanners = banners.map(b => 
      b.id === bannerId ? { ...b, active: !b.active } : b
    );
    setBanners(updatedBanners);
    setToStorage(STORAGE_KEYS.BANNERS, updatedBanners);
    toast({ title: 'Status do banner atualizado' });
  };

  const deleteBanner = (bannerId: string) => {
    const updatedBanners = banners.filter(b => b.id !== bannerId);
    setBanners(updatedBanners);
    setToStorage(STORAGE_KEYS.BANNERS, updatedBanners);
    toast({ title: 'Banner excluído' });
    setDeleteConfirm(null);
  };

  // Functions moved above - filtered data is now computed with useMemo before conditional return

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie usuários, cursos, banners e categorias</p>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-8 flex-wrap h-auto p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-accent">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-accent">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-accent">
              Cursos
            </TabsTrigger>
            <TabsTrigger value="banners" className="data-[state=active]:bg-accent">
              Banners
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-accent">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="maps" className="data-[state=active]:bg-accent gap-2">
              <Map className="w-4 h-4" />
              Mapas
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-accent gap-2">
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="swipefile" className="data-[state=active]:bg-accent gap-2">
              <FileText className="w-4 h-4" />
              Swipe File
            </TabsTrigger>
            <TabsTrigger value="activation-templates" className="data-[state=active]:bg-accent gap-2">
              <ClipboardList className="w-4 h-4" />
              Planos de Ativação
            </TabsTrigger>
            <TabsTrigger value="customization" className="data-[state=active]:bg-accent gap-2">
              <Palette className="w-4 h-4" />
              Personalização
            </TabsTrigger>
            <TabsTrigger value="commercial" className="data-[state=active]:bg-accent gap-2">
              <TrendingUp className="w-4 h-4" />
              Acompanhamento
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Usuários</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                </div>
                <p className="text-xs text-success mt-4">{activeUsers} ativos</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cursos</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{publishedCourses} publicados</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Aulas</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalLessons}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{activeBanners} banners ativos</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Swipe File</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{swipeProcesses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{activeCategories} categorias ativas</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => openCourseModal()} className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Curso
                </Button>
                <Button onClick={() => openUserModal()} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Usuário
                </Button>
                <Button onClick={() => openCategoryModal()} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Nova Categoria
                </Button>
                <Button onClick={() => openBannerDialog()} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Banner
                </Button>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Manutenção</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetData();
                    window.location.reload();
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resetar Todos os Dados
                </Button>
                <p className="text-sm text-muted-foreground w-full mt-2">
                  ⚠️ Isso irá restaurar todos os dados para o estado inicial, incluindo HOF CIRCLE.
                </p>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Últimos Usuários</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.type === 'admin' ? 'bg-destructive/20 text-destructive' :
                        user.type === 'instructor' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {user.type === 'admin' ? 'Admin' : user.type === 'instructor' ? 'Instrutor' : 'Usuário'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-success' : 'bg-muted-foreground'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuários..."
                    className="pl-9 bg-input border-border"
                  />
                </div>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-36 bg-input border-border">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="instructor">Instrutor</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <ImportExportUsers users={users} onUsersChange={setUsers} />
                <Button onClick={() => openUserModal()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} usuário(s) encontrado(s)
            </p>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Usuário</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Cadastro</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.type} 
                          onValueChange={(v) => changeUserType(user.id, v as any)}
                        >
                          <SelectTrigger className={`w-28 h-7 text-xs border-0 ${
                            user.type === 'admin' ? 'bg-destructive/20 text-destructive' :
                            user.type === 'instructor' ? 'bg-warning/20 text-warning' :
                            'bg-info/20 text-info'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="instructor">Instrutor</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.active}
                          onCheckedChange={() => toggleUserStatus(user.id)}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => openUserModal(user)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openUserModal(user)} className="cursor-pointer">
                              <Key className="w-4 h-4 mr-2" />
                              Gerenciar Acessos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirm({ type: 'user', id: user.id, name: user.name })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cursos..."
                    className="pl-9 bg-input border-border"
                  />
                </div>
                <Select value={courseCategoryFilter} onValueChange={setCourseCategoryFilter}>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={courseStatusFilter} onValueChange={setCourseStatusFilter}>
                  <SelectTrigger className="w-32 bg-input border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => openCourseModal()} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Curso
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} curso(s) encontrado(s)
            </p>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Curso</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Aulas</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const courseLessons = lessons.filter(l => l.courseId === course.id);
                    const category = categories.find(c => c.id === course.category || course.categoryIds?.includes(c.id));
                    
                    return (
                      <TableRow key={course.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-12 h-8 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{course.title}</p>
                              <p className="text-xs text-muted-foreground">{course.subtitle}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-accent text-xs text-foreground">
                            {category?.name || course.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {courseLessons.length} aulas
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                            course.status === 'published' ? 'bg-success/20 text-success' :
                            course.status === 'draft' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`} onClick={() => toggleCourseStatus(course.id)}>
                            {course.status === 'published' ? 'Publicado' :
                             course.status === 'draft' ? 'Rascunho' : 'Privado'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => openCourseModal(course)} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateCourse(course)} className="cursor-pointer">
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleCourseStatus(course.id)} className="cursor-pointer">
                                {course.status === 'published' ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Despublicar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Publicar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirm({ type: 'course', id: course.id, name: course.title })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gerenciar Banners Hero</h2>
                <p className="text-sm text-muted-foreground">Gerencie os banners do carrossel da home</p>
              </div>
              <Button onClick={() => openBannerDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Banner
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                    <TableHead className="text-muted-foreground">Preview</TableHead>
                    <TableHead className="text-muted-foreground">Título</TableHead>
                    <TableHead className="text-muted-foreground">Link</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.sort((a, b) => a.order - b.order).map(banner => (
                    <TableRow key={banner.id} className="border-border">
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="w-24 h-12 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{banner.title}</p>
                          <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {banner.linkType === 'course' 
                          ? `Curso: ${courses.find(c => c.id === banner.linkTo)?.title || banner.linkTo}` 
                          : banner.linkType === 'external' ? 'Link externo' : banner.linkTo}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={banner.active}
                          onCheckedChange={() => toggleBannerStatus(banner.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => openBannerDialog(banner)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirm({ type: 'banner', id: banner.id, name: banner.title })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gerenciar Categorias</h2>
                <p className="text-sm text-muted-foreground">Organize os cursos por categorias e configure páginas dedicadas</p>
              </div>
              <Button onClick={() => openCategoryModal()} className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Categoria
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Slug</TableHead>
                    <TableHead className="text-muted-foreground">Cursos</TableHead>
                    <TableHead className="text-muted-foreground">Página</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.sort((a, b) => a.order - b.order).map(category => {
                    const courseCount = courses.filter(c => 
                      c.categoryIds?.includes(category.id) || c.category === category.id
                    ).length;
                    
                    return (
                      <TableRow key={category.id} className="border-border">
                        <TableCell>
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{category.name}</span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({category.subcategories.length} sub)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{category.slug}</TableCell>
                        <TableCell className="text-muted-foreground">{courseCount} cursos</TableCell>
                        <TableCell>
                          {category.hasDedicatedPage ? (
                            <span className="text-success text-sm">✓ Ativa</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={category.active}
                            onCheckedChange={() => toggleCategoryStatus(category.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => openCategoryModal(category)} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="space-y-6">
            <AdminMapsManager />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <AdminChallengesManager />
          </TabsContent>

          {/* Swipe File Tab */}
          <TabsContent value="swipefile" className="space-y-6">
            <AdminSwipeFileManager />
          </TabsContent>

          {/* Activation Plan Templates Tab */}
          <TabsContent value="activation-templates" className="space-y-6">
            <ActivationPlanTemplates />
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-6">
            <CustomizationSettings />
          </TabsContent>

          {/* Commercial Tracking Tab */}
          <TabsContent value="commercial" className="space-y-6">
            <AdminCommercialTracking />
          </TabsContent>
        </Tabs>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={userModalOpen}
        onClose={() => { setUserModalOpen(false); setEditingUser(null); }}
        onSave={saveUser}
        user={editingUser}
        existingEmails={existingEmails.filter(e => e !== editingUser?.email.toLowerCase())}
        isLoading={isCreatingUser}
      />

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={courseModalOpen}
        onClose={() => { setCourseModalOpen(false); setEditingCourse(null); }}
        onSave={saveCourse}
        course={editingCourse}
        existingLessons={lessons}
      />

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
        onSave={saveCategory}
        category={editingCategory}
        existingSlugs={existingSlugs.filter(s => s !== editingCategory?.slug)}
      />

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="Título do banner"
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                placeholder="Subtítulo (opcional)"
                className="mt-1 bg-input border-border"
              />
            </div>
            <div>
              <Label>URL da Imagem *</Label>
              <Input
                value={bannerForm.imageUrl}
                onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 bg-input border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">Recomendado: 1920x600px</p>
            </div>
            <div>
              <Label>Tipo de Link</Label>
              <Select
                value={bannerForm.linkType}
                onValueChange={(value) => setBannerForm({ ...bannerForm, linkType: value as any })}
              >
                <SelectTrigger className="mt-1 bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="course">Curso</SelectItem>
                  <SelectItem value="external">Link Externo</SelectItem>
                  <SelectItem value="page">Página Interna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {bannerForm.linkType === 'course' ? 'Selecione o Curso' : 
                 bannerForm.linkType === 'external' ? 'URL Externa' : 'Página/Âncora'}
              </Label>
              {bannerForm.linkType === 'course' ? (
                <Select
                  value={bannerForm.linkTo}
                  onValueChange={(value) => setBannerForm({ ...bannerForm, linkTo: value })}
                >
                  <SelectTrigger className="mt-1 bg-input border-border">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={bannerForm.linkTo}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkTo: e.target.value })}
                  placeholder={bannerForm.linkType === 'external' ? 'https://...' : '#courses'}
                  className="mt-1 bg-input border-border"
                />
              )}
            </div>
            <div>
              <Label>Texto do Botão</Label>
              <Input
                value={bannerForm.ctaText}
                onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                placeholder="Ex: Começar Agora"
                className="mt-1 bg-input border-border"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveBanner}>
                {editingBanner ? 'Salvar' : 'Criar Banner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>"{deleteConfirm?.name}"</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm?.type === 'user') deleteUser(deleteConfirm.id);
                else if (deleteConfirm?.type === 'course') deleteCourse(deleteConfirm.id);
                else if (deleteConfirm?.type === 'category') deleteCategory(deleteConfirm.id);
                else if (deleteConfirm?.type === 'banner') deleteBanner(deleteConfirm.id);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
