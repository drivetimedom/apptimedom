import React, { useState, useEffect } from 'react';
import { User, UserStatus, ActivationTask, generateId } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Target, BookOpen, Settings, FileDown, Loader2, Key } from 'lucide-react';
import { useResetPassword } from '@/hooks/useResetPassword';

// Cloud hooks
import { useCourses, Course } from '@/hooks/useCourses';
import { useHofMaps, HofMap } from '@/hooks/useHofMaps';
import { useHofChallenges, HofChallenge } from '@/hooks/useHofChallenges';
import { useActivationPlanTemplates, ActivationPlanTemplate } from '@/hooks/useActivationPlanTemplates';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { password?: string; confirmPassword?: string }) => void;
  user?: User | null;
  existingEmails: string[];
  isLoading?: boolean;
  userId?: string; // auth user id for password reset
}

const statusOptions: { value: UserStatus; label: string; icon: string }[] = [
  { value: 'iniciante', label: 'Iniciante (0-R$5k/mês)', icon: '🌱' },
  { value: 'primeiras-vendas', label: 'Primeiras Vendas (R$5k-R$10k/mês)', icon: '🔥' },
  { value: 'intermediario', label: 'Intermediário (R$10k-R$30k/mês)', icon: '📈' },
  { value: 'avancado', label: 'Avançado (R$30k-R$50k/mês)', icon: '🚀' },
  { value: 'elite', label: 'Elite (R$50k+/mês)', icon: '🏆' },
];

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  existingEmails,
  isLoading = false,
  userId,
}) => {
  const { toast } = useToast();
  const { resetPassword, isLoading: isResetting } = useResetPassword();
  
  // Cloud data hooks - always fresh from database
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: hofMaps = [], isLoading: mapsLoading } = useHofMaps();
  const { data: hofChallenges = [], isLoading: challengesLoading } = useHofChallenges();
  const { data: templates = [], isLoading: templatesLoading } = useActivationPlanTemplates();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'user' as 'admin' | 'instructor' | 'user',
    avatar: '',
    active: true,
    unlockedCourses: [] as string[],
    allCoursesAccess: false,
    // Prescription fields
    status: 'iniciante' as UserStatus,
    prescribedMap: 'none' as string, // Now stores map ID or 'none'
    visibleChallenges: [] as string[],
    activationPlan: [] as ActivationTask[],
    assignedTemplateId: '' as string, // New: assigned activation plan template
  });

  // Separate courses by type
  const trilhas = courses.filter(c => c.courseType === 'trilha' || (!c.courseType && c.subcategoryId?.includes('trilha')));
  const desafios = courses.filter(c => c.courseType === 'desafio' || c.subcategoryId?.includes('desafio'));
  const materiais = courses.filter(c => c.courseType === 'material' || c.subcategoryId?.includes('material'));
  const otherCourses = courses.filter(c => !trilhas.includes(c) && !desafios.includes(c) && !materiais.includes(c));

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        type: user.type,
        avatar: user.avatar || '',
        active: user.active,
        unlockedCourses: user.unlockedCourses || [],
        allCoursesAccess: !user.unlockedCourses || user.unlockedCourses.length === 0,
        status: user.status || 'iniciante',
        prescribedMap: user.prescribedMap || 'none',
        visibleChallenges: user.visibleChallenges || [],
        activationPlan: user.activationPlan || [],
        assignedTemplateId: (user as any).assignedTemplateId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'user',
        avatar: '',
        active: true,
        unlockedCourses: [],
        allCoursesAccess: false,
        status: 'iniciante',
        prescribedMap: 'none',
        visibleChallenges: [],
        activationPlan: [],
        assignedTemplateId: '',
      });
    }
    setActiveTab('basic');
    setSelectedTemplateId('none');
    setCustomTaskInput('');
  }, [user, isOpen]);

  const handleSubmit = () => {
    // Validations
    if (!formData.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (!formData.email.trim()) {
      toast({ title: 'Email é obrigatório', variant: 'destructive' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Email inválido', variant: 'destructive' });
      return;
    }

    // Check unique email (only for new users or if email changed)
    if (!user || user.email !== formData.email) {
      if (existingEmails.includes(formData.email.toLowerCase())) {
        toast({ title: 'Email já cadastrado', variant: 'destructive' });
        return;
      }
    }

    // Password validation for new users
    if (!user) {
      if (!formData.password || formData.password.length < 6) {
        toast({ title: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Senhas não conferem', variant: 'destructive' });
        return;
      }
    }

    const userData: Partial<User> & { password?: string; assignedTemplateId?: string } = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      type: formData.type,
      avatar: formData.avatar || undefined,
      active: formData.active,
      unlockedCourses: formData.allCoursesAccess ? [] : formData.unlockedCourses,
      // Prescription fields
      status: formData.status,
      // Store map ID directly (or empty string if 'none')
      prescribedMap: formData.prescribedMap === 'none' ? '' : formData.prescribedMap as any,
      visibleChallenges: formData.visibleChallenges,
      activationPlan: formData.activationPlan,
      assignedTemplateId: formData.assignedTemplateId || undefined,
    } as any;

    // Include password only for new users or if changed
    if (!user && formData.password) {
      userData.password = formData.password;
    } else if (user && formData.password && formData.password.length >= 6) {
      if (formData.password === formData.confirmPassword) {
        userData.password = formData.password;
      }
    }

    onSave(userData);
  };

  const toggleCourseAccess = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      unlockedCourses: prev.unlockedCourses.includes(courseId)
        ? prev.unlockedCourses.filter(id => id !== courseId)
        : [...prev.unlockedCourses, courseId],
    }));
  };

  const toggleVisibleChallenge = (challengeId: string) => {
    setFormData(prev => ({
      ...prev,
      visibleChallenges: prev.visibleChallenges.includes(challengeId)
        ? prev.visibleChallenges.filter(id => id !== challengeId)
        : [...prev.visibleChallenges, challengeId],
    }));
  };

  const selectAllCourses = () => {
    setFormData(prev => ({
      ...prev,
      unlockedCourses: courses.map(c => c.id),
    }));
  };

  const deselectAllCourses = () => {
    setFormData(prev => ({
      ...prev,
      unlockedCourses: [],
    }));
  };

  const addActivationTask = () => {
    setFormData(prev => ({
      ...prev,
      activationPlan: [
        ...prev.activationPlan,
        { id: generateId(), text: '', done: false }
      ],
    }));
  };

  const updateActivationTask = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      activationPlan: prev.activationPlan.map((task, i) => 
        i === index ? { ...task, text } : task
      ),
    }));
  };

  const removeActivationTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activationPlan: prev.activationPlan.filter((_, i) => i !== index),
    }));
  };

  const applyTemplate = () => {
    if (selectedTemplateId === 'none') {
      toast({ title: 'Selecione um template', variant: 'destructive' });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const newTasks: ActivationTask[] = template.tasks.map((task, index) => ({
      id: generateId(),
      text: typeof task === 'string' ? task : task.text,
      done: false,
      fromTemplate: template.name,
      order: formData.activationPlan.length + index,
    }));

    setFormData(prev => ({
      ...prev,
      activationPlan: [...prev.activationPlan, ...newTasks],
    }));

    setSelectedTemplateId('none');
    toast({ title: `Template "${template.name}" aplicado! (${newTasks.length} tarefas)` });
  };

  const addCustomTask = () => {
    if (!customTaskInput.trim()) {
      toast({ title: 'Digite o texto da tarefa', variant: 'destructive' });
      return;
    }

    const newTask: ActivationTask = {
      id: generateId(),
      text: customTaskInput.trim(),
      done: false,
      fromTemplate: null,
      order: formData.activationPlan.length,
    };

    setFormData(prev => ({
      ...prev,
      activationPlan: [...prev.activationPlan, newTask],
    }));

    setCustomTaskInput('');
    toast({ title: 'Tarefa adicionada!' });
  };

  const clearAllTasks = () => {
    setFormData(prev => ({
      ...prev,
      activationPlan: [],
    }));
    setClearConfirmOpen(false);
    toast({ title: 'Plano de Ativação limpo' });
  };

  const handleResetPassword = async () => {
    if (!userId) {
      toast({ title: 'ID do usuário não encontrado', variant: 'destructive' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Senhas não conferem', variant: 'destructive' });
      return;
    }

    // Pass user email and name for notification email
    const result = await resetPassword(
      userId, 
      newPassword,
      formData.email,
      formData.name
    );

    if (result.success) {
      toast({ title: 'Senha redefinida com sucesso!' });
      setResetPasswordOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      toast({ title: 'Erro ao redefinir senha', description: result.error, variant: 'destructive' });
    }
  };

  const renderCourseCheckboxes = (courseList: Course[], title: string, icon: string) => {
    if (courseList.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          {icon} {title}
        </h4>
        <div className="space-y-2">
          {courseList.map(course => (
            <label 
              key={course.id} 
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={formData.unlockedCourses.includes(course.id)}
                onCheckedChange={() => toggleCourseAccess(course.id)}
              />
              <div className="flex-1">
                <p className="text-foreground font-medium">{course.title}</p>
                {course.subtitle && (
                  <p className="text-xs text-muted-foreground">{course.subtitle}</p>
                )}
              </div>
              <span className="text-sm text-accent">
                {course.modules.length} módulos
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Cursos e Trilhas
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Prescrição
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            {/* TAB 1: Basic Info */}
            <TabsContent value="basic" className="space-y-6 mt-0">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do usuário"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{user ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{user ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <Label>URL do Avatar (opcional)</Label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="bg-input border-border"
                />
                {formData.avatar && (
                  <img 
                    src={formData.avatar} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover mt-2"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
              </div>

              {/* Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Usuário *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="admin">Administrador (acesso total)</SelectItem>
                      <SelectItem value="user">Usuário (acesso a cursos liberados)</SelectItem>
                      <SelectItem value="instructor">Instrutor (gerencia seus cursos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                    />
                    <label htmlFor="active" className="text-sm text-foreground">
                      Conta ativa
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Reset Button - Only for existing users */}
              {user && userId && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Redefinir Senha</Label>
                      <p className="text-sm text-muted-foreground">
                        Defina uma nova senha para este usuário
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResetPasswordOpen(true)}
                      className="gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Redefinir Senha
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Courses */}
            <TabsContent value="courses" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">📚 Cursos e Trilhas Liberadas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione quais cursos este aluno pode acessar
                  </p>
                </div>

                {/* All Courses Toggle */}
                <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <Checkbox
                    id="allCourses"
                    checked={formData.allCoursesAccess}
                    onCheckedChange={(checked) => setFormData({ ...formData, allCoursesAccess: !!checked })}
                  />
                  <label htmlFor="allCourses" className="text-sm text-foreground font-medium">
                    ✅ Acesso a todos os cursos
                  </label>
                </div>

                {!formData.allCoursesAccess && (
                  <>
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAllCourses}>
                        ✓ Selecionar todos
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={deselectAllCourses}>
                        ✕ Desmarcar todos
                      </Button>
                    </div>

                    {/* Course Lists by Type */}
                    <div className="bg-background/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      {renderCourseCheckboxes(trilhas, 'Trilhas de Implementação', '🎯')}
                      {renderCourseCheckboxes(desafios, 'Desafios', '🏆')}
                      {renderCourseCheckboxes(materiais, 'Material Extra', '💾')}
                      {renderCourseCheckboxes(otherCourses, 'Outros Cursos', '📖')}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Prescription */}
            <TabsContent value="prescription" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">🎯 Prescrição e Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o status e plano de ação do aluno
                  </p>
                </div>

                {/* Status Manual */}
                <div className="space-y-2">
                  <Label>Status do Aluno</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prescribed Map */}
                <div className="space-y-2">
                  <Label>🗺️ Mapa Prescrito</Label>
                  <Select
                    value={formData.prescribedMap}
                    onValueChange={(value) => setFormData({ ...formData, prescribedMap: value as string })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Selecione um mapa" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="none">Nenhum mapa prescrito</SelectItem>
                      {hofMaps.map(map => (
                        <SelectItem key={map.id} value={map.id}>
                          {map.icon} {map.name} ({map.videos.length} vídeos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hofMaps.length === 0 && !mapsLoading && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum mapa cadastrado. Crie mapas na aba "Mapas" do painel admin.
                    </p>
                  )}
                </div>

                {/* Visible Challenges */}
                <div className="space-y-3">
                  <div>
                    <Label>🏆 Desafios Visíveis no Plano de Ação</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecione quais desafios aparecerão no "Plano de Ação" do aluno
                    </p>
                  </div>
                  {hofChallenges.length === 0 && !challengesLoading ? (
                    <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg text-center">
                      Nenhum desafio cadastrado. Crie desafios na aba "Desafios" do painel admin.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {hofChallenges.map(challenge => (
                        <label 
                          key={challenge.id} 
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={formData.visibleChallenges.includes(challenge.id)}
                            onCheckedChange={() => toggleVisibleChallenge(challenge.id)}
                          />
                          <span className="text-foreground flex items-center gap-2">
                            {challenge.icon} {challenge.name}
                            <span className="text-xs text-muted-foreground">
                              ({challenge.videos.length} vídeos)
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activation Plan Section */}
                <div className="space-y-4 border-t border-border pt-6">
                  <div>
                    <Label className="text-base font-semibold">📋 Plano de Ativação</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecione o plano principal ou adicione tarefas individuais
                    </p>
                  </div>

                  {/* Assigned Activation Plan Template */}
                  <div className="space-y-2">
                    <Label>Plano de Ativação Atribuído:</Label>
                    <Select 
                      value={formData.assignedTemplateId || 'none'} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, assignedTemplateId: value === 'none' ? '' : value });
                        // Auto-apply the template if selected
                        if (value !== 'none') {
                          const template = templates.find(t => t.id === value);
                          if (template) {
                            const newTasks: ActivationTask[] = template.tasks.map((task, index) => ({
                              id: generateId(),
                              text: typeof task === 'string' ? task : task.text,
                              done: false,
                              fromTemplate: template.name,
                              order: index,
                            }));
                            setFormData(prev => ({
                              ...prev,
                              assignedTemplateId: value,
                              activationPlan: newTasks, // Replace with template tasks
                            }));
                            toast({ title: `Plano "${template.name}" atribuído! (${newTasks.length} tarefas)` });
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecione um plano de ativação..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="none">Nenhum plano atribuído</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            📋 {template.name} ({template.tasks.length} tarefas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && !templatesLoading && (
                      <p className="text-xs text-muted-foreground">
                        Nenhum template cadastrado. Crie templates na aba "Planos de Ativação" do painel admin.
                      </p>
                    )}
                    {formData.assignedTemplateId && (
                      <p className="text-xs text-accent">
                        ✅ Plano atribuído: {templates.find(t => t.id === formData.assignedTemplateId)?.name}
                      </p>
                    )}
                  </div>

                  {/* Apply Additional Template */}
                  <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
                    <Label className="text-sm">Adicionar Tarefas de Outro Template:</Label>
                    <div className="flex gap-2">
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger className="flex-1 bg-input border-border">
                          <SelectValue placeholder="Selecione um template..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="none">Nenhum</SelectItem>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.tasks.length} tarefas)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={applyTemplate}
                        disabled={selectedTemplateId === 'none'}
                        className="gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Ao adicionar, as tarefas serão SOMADAS às tarefas existentes
                    </p>
                  </div>

                  {/* Current Tasks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Tarefas do Aluno ({formData.activationPlan.length})</Label>
                      {formData.activationPlan.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setClearConfirmOpen(true)}
                          className="text-destructive hover:text-destructive text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Limpar Todas
                        </Button>
                      )}
                    </div>
                    
                    {formData.activationPlan.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg text-center">
                        Nenhuma tarefa adicionada ainda
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {formData.activationPlan.map((task, index) => (
                          <div key={task.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg group">
                            <div className="flex-1">
                              <Input
                                value={task.text}
                                onChange={(e) => updateActivationTask(index, e.target.value)}
                                className="bg-background border-border"
                                placeholder="Descrição da tarefa"
                              />
                              {task.fromTemplate && (
                                <span className="text-xs text-accent mt-1 block">
                                  Do template: {task.fromTemplate}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeActivationTask(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Individual Task */}
                  <div className="space-y-2 p-4 bg-muted/10 rounded-lg border border-dashed border-border">
                    <Label className="text-sm">Adicionar Tarefa Individual:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customTaskInput}
                        onChange={(e) => setCustomTaskInput(e.target.value)}
                        placeholder="Digite a tarefa customizada..."
                        className="flex-1 bg-input border-border"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomTask();
                          }
                        }}
                      />
                      <Button type="button" onClick={addCustomTask} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              user ? 'Salvar Alterações' : 'Criar Usuário'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Clear All Tasks Confirmation */}
    <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar Plano de Ativação?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover TODAS as tarefas do Plano de Ativação? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={clearAllTasks}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Limpar Todas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Reset Password Confirmation */}
    <AlertDialog open={resetPasswordOpen} onOpenChange={(open) => {
      setResetPasswordOpen(open);
      if (!open) {
        setNewPassword('');
        setConfirmNewPassword('');
      }
    }}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Redefinir Senha
          </AlertDialogTitle>
          <AlertDialogDescription>
            Digite a nova senha para o usuário <strong>{user?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nova Senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar Nova Senha</Label>
            <Input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirme a senha"
              className="bg-input border-border"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleResetPassword}
            disabled={isResetting || !newPassword || !confirmNewPassword}
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default UserFormModal;
