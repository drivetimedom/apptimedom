import React, { useState, useMemo } from 'react';
import { useAdminStudents, useStudentCoursesAdmin, useAddStudentCourse, useRemoveStudentCourse } from '@/hooks/useStudentAccess';
import { useCourses } from '@/hooks/useCourses';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useDeleteAdminUser } from '@/hooks/useAdminUsers';
import { enviarEmailBoasVindas } from '@/lib/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, BookOpen, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const AdminStudentsManager: React.FC = () => {
  const { data: students = [], isLoading, refetch } = useAdminStudents();
  const { data: courses = [] } = useCourses();
  const { createUser, isLoading: isCreating } = useCreateUser();
  const deleteUserMutation = useDeleteAdminUser();
  const addCourseMutation = useAddStudentCourse();
  const removeCourseMutation = useRemoveStudentCourse();

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageCoursesModalOpen, setManageCoursesModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [addCourseId, setAddCourseId] = useState('');

  // Create student form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    generatePassword: true,
    initialCourseId: '',
  });

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const publishedCourses = useMemo(() =>
    courses.filter(c => c.status === 'published'),
    [courses]
  );

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
    let password = 'Hof';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    password += '@';
    return password;
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.initialCourseId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const password = formData.generatePassword ? generateRandomPassword() : formData.password;
    if (!password || password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    // 1. Create user with student role
    const result = await createUser({
      email: formData.email,
      password,
      name: formData.name,
      role: 'student',
    });

    if (!result.success) {
      toast.error(result.error || 'Erro ao criar student');
      return;
    }

    // 2. Add initial course access
    if (result.userId) {
      await addCourseMutation.mutateAsync({
        studentId: result.userId,
        courseId: formData.initialCourseId,
      });
    }

    // 3. Send welcome email
    try {
      const courseName = publishedCourses.find(c => c.id === formData.initialCourseId)?.title || 'Curso';
      await enviarEmailBoasVindas(formData.email, formData.name, password);
    } catch (e) {
      console.error('Failed to send welcome email:', e);
    }

    toast.success(`Student criado! Email: ${formData.email} / Senha: ${password}`);
    setCreateModalOpen(false);
    setFormData({ name: '', email: '', password: '', generatePassword: true, initialCourseId: '' });
    refetch();
  };

  const handleDeleteStudent = async (student: any) => {
    if (!confirm(`Excluir permanentemente o student ${student.name}?`)) return;
    try {
      await deleteUserMutation.mutateAsync({ userId: student.user_id });
      refetch();
    } catch (e) {
      console.error('Error deleting student:', e);
    }
  };

  const openManageCourses = (student: any) => {
    setSelectedStudent(student);
    setManageCoursesModalOpen(true);
    setAddCourseId('');
  };

  // Get courses the selected student already has
  const studentCourseIds = selectedStudent?.courseAccess?.map((a: any) => a.courseId) || [];
  const availableCourses = publishedCourses.filter(c => !studentCourseIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Students (Cursos Avulsos)</h2>
          <p className="text-sm text-muted-foreground">Gerencie students com acesso a cursos individuais</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum student cadastrado</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {student.courseAccess?.length || 0} curso(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(student.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openManageCourses(student)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Cursos
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteStudent(student)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Student Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Student (Curso Avulso)</DialogTitle>
            <DialogDescription>
              Student terá acesso APENAS aos cursos que você liberar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.generatePassword}
                    onChange={() => setFormData({ ...formData, generatePassword: true })}
                  />
                  Gerar automática
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.generatePassword}
                    onChange={() => setFormData({ ...formData, generatePassword: false })}
                  />
                  Manual
                </label>
              </div>
              {!formData.generatePassword && (
                <Input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Curso inicial *</Label>
              <Select
                value={formData.initialCourseId}
                onValueChange={(val) => setFormData({ ...formData, initialCourseId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {publishedCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Courses Modal */}
      <Dialog open={manageCoursesModalOpen} onOpenChange={setManageCoursesModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Cursos</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} ({selectedStudent?.email})
            </DialogDescription>
          </DialogHeader>

          {/* Add course */}
          <div className="flex items-center gap-2">
            <Select value={addCourseId} onValueChange={setAddCourseId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Adicionar curso..." />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!addCourseId || addCourseMutation.isPending}
              onClick={() => {
                if (addCourseId && selectedStudent) {
                  addCourseMutation.mutate(
                    { studentId: selectedStudent.user_id, courseId: addCourseId },
                    {
                      onSuccess: () => {
                        setAddCourseId('');
                        refetch();
                      },
                    }
                  );
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Current courses */}
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium text-foreground">Cursos com acesso:</p>
            {selectedStudent?.courseAccess?.length > 0 ? (
              selectedStudent.courseAccess.map((access: any) => {
                const course = courses.find(c => c.id === access.courseId);
                return (
                  <div key={access.courseId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{course?.title || 'Curso removido'}</p>
                      <p className="text-xs text-muted-foreground">
                        Liberado em: {new Date(access.grantedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (!confirm(`Remover acesso ao curso "${course?.title}"?`)) return;
                        // Need to get the access ID
                        const { data } = await (await import('@/integrations/supabase/client')).supabase
                          .from('student_course_access')
                          .select('id')
                          .eq('student_id', selectedStudent.user_id)
                          .eq('course_id', access.courseId)
                          .is('removed_at', null)
                          .single();
                        
                        if (data) {
                          removeCourseMutation.mutate(
                            { accessId: data.id },
                            { onSuccess: () => refetch() }
                          );
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum curso liberado</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudentsManager;
