import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LessonResource {
  type: 'pdf' | 'link';
  name: string;
  url: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  vimeoId: string;
  duration: string;
  order: number;
  locked: boolean;
  resources: LessonResource[];
}

// Transform database row to Lesson interface
const transformLesson = (row: any): Lesson => ({
  id: row.id,
  courseId: row.course_id,
  moduleId: row.module_id,
  title: row.title,
  description: row.description || '',
  vimeoId: row.vimeo_id || '',
  duration: row.duration || '',
  order: row.order || 0,
  locked: row.locked || false,
  resources: row.resources || [],
});

// Transform Lesson to database row
const transformToRow = (lesson: Partial<Lesson>) => ({
  course_id: lesson.courseId,
  module_id: lesson.moduleId,
  title: lesson.title,
  description: lesson.description,
  vimeo_id: lesson.vimeoId,
  duration: lesson.duration,
  order: lesson.order,
  locked: lesson.locked,
  resources: JSON.parse(JSON.stringify(lesson.resources || [])),
});

export function useLessons(courseId?: string) {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('order', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(transformLesson);
    },
  });
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data ? transformLesson(data) : null;
    },
    enabled: !!lessonId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lesson: Omit<Lesson, 'id'>) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(transformToRow(lesson))
        .select()
        .single();

      if (error) throw error;
      return transformLesson(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
      toast({ title: 'Aula criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar aula', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...lesson }: Partial<Lesson> & { id: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(transformToRow(lesson))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformLesson(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({ title: 'Aula atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar aula', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({ title: 'Aula excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir aula', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkCreateLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessons: Omit<Lesson, 'id'>[]) => {
      const rows = lessons.map(transformToRow);
      const { data, error } = await supabase
        .from('lessons')
        .insert(rows)
        .select();

      if (error) throw error;
      return (data || []).map(transformLesson);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}
