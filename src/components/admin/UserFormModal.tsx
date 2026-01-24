import React, { useState, useEffect } from 'react';
import { User, Course, getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { password?: string; confirmPassword?: string }) => void;
  user?: User | null;
  existingEmails: string[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  existingEmails,
}) => {
  const { toast } = useToast();
  const [courses] = useState(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []));
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
  });

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
      });
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
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

            {/* Course Access (only for user type) */}
            {formData.type === 'user' && (
              <div className="space-y-3 border-t border-border pt-4">
                <Label className="text-base font-semibold">🎓 Cursos Liberados</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allCourses"
                    checked={formData.allCoursesAccess}
                    onCheckedChange={(checked) => setFormData({ ...formData, allCoursesAccess: !!checked })}
                  />
                  <label htmlFor="allCourses" className="text-sm text-foreground">
                    Acesso a todos os cursos
                  </label>
                </div>

                {!formData.allCoursesAccess && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAllCourses}>
                        Selecionar todos
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={deselectAllCourses}>
                        Desmarcar todos
                      </Button>
                    </div>
                    
                    <div className="bg-background/50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {courses.map(course => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={formData.unlockedCourses.includes(course.id)}
                            onCheckedChange={() => toggleCourseAccess(course.id)}
                          />
                          <label htmlFor={`course-${course.id}`} className="text-sm text-foreground">
                            {course.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

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
