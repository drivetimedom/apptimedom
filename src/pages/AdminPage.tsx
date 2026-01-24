import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, setToStorage, STORAGE_KEYS, Course, Lesson, User, Progress, Banner, Category, generateId } from '@/lib/storage';
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
  Megaphone,
  Target,
  Briefcase,
  GripVertical,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const AdminPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState(() => getFromStorage<User[]>(STORAGE_KEYS.USERS, []));
  const [banners, setBanners] = useState(() => getFromStorage<Banner[]>(STORAGE_KEYS.BANNERS, []));
  const [categories, setCategories] = useState(() => getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []));
  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const lessons = useMemo(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []), []);
  const progress = useMemo(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []), []);

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

  // Category form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'FolderOpen',
    description: '',
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Acesso não autorizado</p>
      </div>
    );
  }

  // Stats
  const totalUsers = users.length;
  const totalCourses = courses.length;
  const totalLessons = lessons.length;
  const activeUsers = users.filter(u => u.active).length;

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    );
    setUsers(updatedUsers);
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    toast({ title: 'Status do usuário atualizado' });
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
  };

  // Banner functions
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
        b.id === editingBanner.id 
          ? { ...b, ...bannerForm }
          : b
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
  };

  // Category functions
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        icon: category.icon,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: 'FolderOpen',
        description: '',
      });
    }
    setCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name) {
      toast({ title: 'Nome da categoria é obrigatório', variant: 'destructive' });
      return;
    }

    let updatedCategories: Category[];
    if (editingCategory) {
      updatedCategories = categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, ...categoryForm, slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-') }
          : c
      );
    } else {
      const newCategory: Category = {
        id: generateId(),
        ...categoryForm,
        slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
        active: true,
        order: categories.length + 1,
      };
      updatedCategories = [...categories, newCategory];
    }

    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    setCategoryDialogOpen(false);
    toast({ title: editingCategory ? 'Categoria atualizada' : 'Categoria criada' });
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
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    toast({ title: 'Categoria excluída' });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const iconOptions = [
    { value: 'FolderOpen', label: 'Pasta' },
    { value: 'Megaphone', label: 'Marketing' },
    { value: 'TrendingUp', label: 'Vendas' },
    { value: 'Target', label: 'Estratégias' },
    { value: 'Briefcase', label: 'Gestão' },
    { value: 'BookOpen', label: 'Educação' },
  ];

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
                <p className="text-xs text-muted-foreground mt-4">
                  {courses.filter(c => c.status === 'published').length} publicados
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Banners Ativos</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{banners.filter(b => b.active).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Image className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{banners.length} total</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categorias</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{categories.filter(c => c.active).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{categories.length} total</p>
              </div>
            </div>

            {/* Maintenance Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Manutenção</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetData();
                    window.location.reload();
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resetar Todos os Dados
                </Button>
                <p className="text-sm text-muted-foreground w-full mt-2">
                  ⚠️ Isso irá restaurar todos os dados para o estado inicial, incluindo HOF CIRCLE.
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Últimos Usuários</h3>
              <div className="space-y-4">
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
                        {user.type}
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
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuários..."
                  className="pl-9 bg-input border-border"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

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
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.type === 'admin' ? 'bg-destructive/20 text-destructive' :
                          user.type === 'instructor' ? 'bg-warning/20 text-warning' :
                          'bg-info/20 text-info'
                        }`}>
                          {user.type === 'admin' ? 'Admin' : 
                           user.type === 'instructor' ? 'Instrutor' : 'Usuário'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center space-x-1 ${user.active ? 'text-success' : 'text-muted-foreground'}`}>
                          {user.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{user.active ? 'Ativo' : 'Inativo'}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.active ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => deleteUser(user.id)}
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
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-9 bg-input border-border"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Curso</TableHead>
                    <TableHead className="text-muted-foreground">Instrutor</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Aulas</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const instructor = users.find(u => u.id === course.instructorId);
                    const courseLessons = lessons.filter(l => l.courseId === course.id);
                    
                    return (
                      <TableRow key={course.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-12 h-8 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">{course.title}</p>
                              <p className="text-xs text-muted-foreground">{course.subtitle}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {instructor?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-accent text-xs text-foreground">
                            {course.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {courseLessons.length} aulas
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === 'published' ? 'bg-success/20 text-success' :
                            course.status === 'draft' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
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
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Curso
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
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
                <p className="text-sm text-muted-foreground">Gerencie os banners do carrossel da home (máx. 3 recomendado)</p>
              </div>
              <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openBannerDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Banner
                  </Button>
                </DialogTrigger>
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
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Input
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                        placeholder="Subtítulo (opcional)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>URL da Imagem *</Label>
                      <Input
                        value={bannerForm.imageUrl}
                        onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recomendado: 1920x600px</p>
                    </div>
                    <div>
                      <Label>Tipo de Link</Label>
                      <Select
                        value={bannerForm.linkType}
                        onValueChange={(value) => setBannerForm({ ...bannerForm, linkType: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione um curso" />
                          </SelectTrigger>
                          <SelectContent>
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
                          className="mt-1"
                        />
                      )}
                    </div>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={bannerForm.ctaText}
                        onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                        placeholder="Ex: Começar Agora"
                        className="mt-1"
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
                        {banner.linkType === 'course' ? `Curso: ${courses.find(c => c.id === banner.linkTo)?.title || banner.linkTo}` :
                         banner.linkType === 'external' ? 'Link externo' : banner.linkTo}
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openBannerDialog(banner)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => deleteBanner(banner.id)}
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
                <p className="text-sm text-muted-foreground">Organize os cursos por categorias</p>
              </div>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openCategoryDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Nome da Categoria *</Label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Ex: Marketing Digital"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Ícone</Label>
                      <Select
                        value={categoryForm.icon}
                        onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Descrição opcional"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveCategory}>
                        {editingCategory ? 'Salvar' : 'Criar Categoria'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Slug</TableHead>
                    <TableHead className="text-muted-foreground">Cursos</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.sort((a, b) => a.order - b.order).map(category => {
                    const courseCount = courses.filter(c => c.categoryIds?.includes(category.id)).length;
                    
                    return (
                      <TableRow key={category.id} className="border-border">
                        <TableCell>
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {category.slug}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {courseCount} cursos
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
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openCategoryDialog(category)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => deleteCategory(category.id)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
