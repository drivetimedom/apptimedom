import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, setToStorage, STORAGE_KEYS, Course, Lesson, User, Progress, Comment, generateId } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  BookOpen,
  PlayCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  CheckCircle,
  XCircle,
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
  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const lessons = useMemo(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []), []);
  const progress = useMemo(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []), []);

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

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie usuários, cursos e conteúdos</p>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-accent">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-accent">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-accent">
              Cursos
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
                <p className="text-xs text-success mt-4">
                  {activeUsers} ativos
                </p>
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
                    <p className="text-sm text-muted-foreground">Total de Aulas</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalLessons}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Em {totalCourses} cursos
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aulas Assistidas</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {progress.reduce((acc, p) => acc + p.completedLessons.length, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Por todos os usuários
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
