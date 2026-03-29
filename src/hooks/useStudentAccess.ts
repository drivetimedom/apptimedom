import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Hook to get courses a student has access to
export function useStudentCourseAccess() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['student-course-access', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('student_course_access')
        .select('course_id')
        .eq('student_id', user.id)
        .is('removed_at', null);

      if (error) throw error;
      return data?.map(item => item.course_id) || [];
    },
    enabled: !!user && role === 'student',
  });
}

// Hook to check if student can access a specific course
export function useCanAccessCourse(courseId: string | undefined) {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['can-access-course', courseId, role],
    queryFn: async () => {
      if (!user || !courseId) return false;

      // Admin/user/instructor → full access
      if (role === 'admin' || role === 'user' || role === 'instructor') {
        return true;
      }

      // Student → check student_course_access
      if (role === 'student') {
        const { data } = await supabase
          .from('student_course_access')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .is('removed_at', null)
          .maybeSingle();

        return !!data;
      }

      // team_member → existing logic handles it
      return true;
    },
    enabled: !!courseId && !!user,
  });
}

// Admin: get all students with their course access
export function useAdminStudents() {
  return useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      // Get all users with student role
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;
      if (!studentRoles?.length) return [];

      const studentUserIds = studentRoles.map(r => r.user_id);

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentUserIds);

      if (profilesError) throw profilesError;

      // Get course access for all students
      const { data: accessData, error: accessError } = await supabase
        .from('student_course_access')
        .select('student_id, course_id, granted_at')
        .in('student_id', studentUserIds)
        .is('removed_at', null);

      if (accessError) throw accessError;

      // Merge
      return (profiles || []).map(profile => ({
        ...profile,
        courseAccess: (accessData || [])
          .filter(a => a.student_id === profile.user_id)
          .map(a => ({ courseId: a.course_id, grantedAt: a.granted_at })),
      }));
    },
  });
}

// Admin: get course access for a specific student
export function useStudentCoursesAdmin(studentUserId: string | null) {
  return useQuery({
    queryKey: ['student-courses-admin', studentUserId],
    queryFn: async () => {
      if (!studentUserId) return [];

      const { data, error } = await supabase
        .from('student_course_access')
        .select('id, course_id, granted_at')
        .eq('student_id', studentUserId)
        .is('removed_at', null)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!studentUserId,
  });
}

// Admin: add course access
export function useAddStudentCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('student_course_access')
        .insert({
          student_id: studentId,
          course_id: courseId,
          granted_by: user.id,
          purchase_info: { source: 'admin_manual', added_at: new Date().toISOString() },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Curso adicionado!');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses-admin'] });
      queryClient.invalidateQueries({ queryKey: ['student-course-access'] });
      queryClient.invalidateQueries({ queryKey: ['can-access-course'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar curso');
    },
  });
}

// Admin: remove course access
export function useRemoveStudentCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessId }: { accessId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('student_course_access')
        .update({
          removed_at: new Date().toISOString(),
          removed_by: user.id,
        })
        .eq('id', accessId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Curso removido');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses-admin'] });
    },
    onError: () => {
      toast.error('Erro ao remover curso');
    },
  });
}
