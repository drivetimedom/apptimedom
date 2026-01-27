import React, { useState, useEffect } from 'react';
import { User, Course, getFromStorage, STORAGE_KEYS, UserStatus, PrescribedMap, ActivationTask, generateId } from '@/lib/storage';
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
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Target, BookOpen, Settings } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { password?: string; confirmPassword?: string }) => void;
  user?: User | null;
  existingEmails: string[];
}

const statusOptions: { value: UserStatus; label: string; icon: string }[] = [
  { value: 'iniciante', label: 'Iniciante (0-R$5k/mês)', icon: '🌱' },
  { value: 'primeiras-vendas', label: 'Primeiras Vendas (R$5k-R$10k/mês)', icon: '🔥' },
  { value: 'intermediario', label: 'Intermediário (R$10k-R$30k/mês)', icon: '📈' },
  { value: 'avancado', label: 'Avançado (R$30k-R$50k/mês)', icon: '🚀' },
  { value: 'elite', label: 'Elite (R$50k+/mês)', icon: '🏆' },
];

const mapOptions: { value: PrescribedMap | 'none'; label: string }[] = [
  { value: 'none', label: 'Nenhum mapa prescrito' },
  { value: 'mapa-10k', label: '🗺️ MAPA 10K' },
  { value: 'mapa-30k', label: '🗺️ MAPA 30K' },
  { value: 'mapa-50k', label: '🗺️ MAPA 50K' },
  { value: 'mapa-100k', label: '🗺️ MAPA 100K' },
];

const defaultChallenges = [
  { id: 'desafio-1', title: 'Desafio 1 - Primeiros 30 Leads' },
  { id: 'desafio-2', title: 'Desafio 2 - Setup Business Manager' },
  { id: 'desafio-3', title: 'Desafio 3 - Estruturar Kanban' },
  { id: 'desafio-4', title: 'Desafio 4 - Primeira Campanha' },
  { id: 'desafio-5', title: 'Desafio 5 - Escala R$ 1.000/dia' },
  { id: 'desafio-6', title: 'Desafio 6 - Meta 10K' },
];

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  existingEmails,
}) => {
  const { toast } = useToast();
  const [courses] = useState(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []));
  const [activeTab, setActiveTab] = useState('basic');
  
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
    prescribedMap: 'none' as PrescribedMap | 'none',
    visibleChallenges: [] as string[],
    activationPlan: [] as ActivationTask[],
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
      });
    }
    setActiveTab('basic');
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

    const userData: Partial<User> & { password?: string } = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      type: formData.type,
      avatar: formData.avatar || undefined,
      active: formData.active,
      unlockedCourses: formData.allCoursesAccess ? [] : formData.unlockedCourses,
      // Prescription fields
      status: formData.status,
      prescribedMap: formData.prescribedMap === 'none' ? '' : formData.prescribedMap as PrescribedMap,
      visibleChallenges: formData.visibleChallenges,
      activationPlan: formData.activationPlan,
    };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mb-4">
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

          <ScrollArea className="flex-1 pr-4">
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
                  <Label>Mapa Prescrito</Label>
                  <Select
                    value={formData.prescribedMap}
                    onValueChange={(value) => setFormData({ ...formData, prescribedMap: value as PrescribedMap | 'none' })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Selecione um mapa" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {mapOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Visible Challenges */}
                <div className="space-y-3">
                  <div>
                    <Label>Desafios Visíveis no Plano de Ação</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecione quais desafios aparecerão no "Plano de Ação" do aluno
                    </p>
                  </div>
                  <div className="space-y-2">
                    {defaultChallenges.map(challenge => (
                      <label 
                        key={challenge.id} 
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={formData.visibleChallenges.includes(challenge.id)}
                          onCheckedChange={() => toggleVisibleChallenge(challenge.id)}
                        />
                        <span className="text-foreground">{challenge.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Activation Plan */}
                <div className="space-y-3">
                  <div>
                    <Label>Plano de Ativação (Checklist)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adicione tarefas personalizadas para este aluno
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.activationPlan.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                        <Input
                          value={task.text}
                          onChange={(e) => updateActivationTask(index, e.target.value)}
                          className="flex-1 bg-background border-border"
                          placeholder="Ex: Criar conta Business Manager"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeActivationTask(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addActivationTask}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Tarefa
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {user ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
