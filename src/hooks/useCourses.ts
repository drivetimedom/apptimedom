import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ModuleType = 'aulas' | 'material';

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
  type?: ModuleType;
}

export interface SequenceConfig {
  isSequential: boolean;
  position: number;
  isPillar: boolean;
  requiresPrevious: boolean;
  prerequisiteCourseId: string | null;
  unlocksAfter: string | null;
}

export interface RoadmapConfig {
  showInRoadmap: boolean;
  roadmapPosition: { x: number; y: number } | null;
  roadmapIcon: string;
  roadmapLabel: string;
}

export type CourseType = 'trilha' | 'desafio' | 'material';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  category: string;
  categoryIds?: string[];
  subcategoryId?: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: 'draft' | 'published' | 'private';
  locked: boolean;
  totalDuration: string;
  createdAt: string;
  modules: Module[];
  isNew?: boolean;
  sequenceConfig?: SequenceConfig;
  roadmapConfig?: RoadmapConfig;
  courseType?: CourseType;
}

// Transform database row to Course interface
const transformCourse = (row: any): Course => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle || '',
  description: row.description || '',
  thumbnail: row.thumbnail,
  instructorId: row.instructor_id || '',
  category: row.category || '',
  categoryIds: row.category_ids || [],
  subcategoryId: row.subcategory_id,
  level: row.level || 'Iniciante',
  status: row.status || 'draft',
  locked: row.locked || false,
  totalDuration: row.total_duration || '',
  createdAt: row.created_at,
  modules: row.modules || [],
  isNew: row.is_new || false,
  sequenceConfig: row.sequence_config,
  roadmapConfig: row.roadmap_config,
  courseType: row.course_type,
});

// Transform Course to database row
const transformToRow = (course: Partial<Course>) => ({
  title: course.title,
  subtitle: course.subtitle,
  description: course.description,
  thumbnail: course.thumbnail,
  instructor_id: course.instructorId,
  category: course.category,
  category_ids: course.categoryIds,
  subcategory_id: course.subcategoryId,
  level: course.level,
  status: course.status,
  locked: course.locked,
  total_duration: course.totalDuration,
  modules: JSON.parse(JSON.stringify(course.modules || [])),
  is_new: course.isNew,
  sequence_config: course.sequenceConfig ? JSON.parse(JSON.stringify(course.sequenceConfig)) : null,
  roadmap_config: course.roadmapConfig ? JSON.parse(JSON.stringify(course.roadmapConfig)) : null,
  course_type: course.courseType,
});

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformCourse);
    },
  });
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data ? transformCourse(data) : null;
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (course: Omit<Course, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(transformToRow(course))
        .select()
        .single();

      if (error) throw error;
      return transformCourse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar curso', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...course }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(transformToRow(course))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformCourse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar curso', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Curso excluído com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir curso', description: error.message, variant: 'destructive' });
    },
  });
}
