import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  progress: number;
  liked: string[];
  disliked: string[];
  favorites: string[];
  categoryProgress?: Record<string, any>;
  startedAt: string;
  lastAccessAt: string;
}

// Transform database row to UserProgress interface
const transformProgress = (row: any): UserProgress => ({
  id: row.id,
  userId: row.user_id,
  courseId: row.course_id,
  completedLessons: row.completed_lessons || [],
  currentLesson: row.current_lesson || '',
  progress: row.progress || 0,
  liked: row.liked || [],
  disliked: row.disliked || [],
  favorites: row.favorites || [],
  categoryProgress: row.category_progress,
  startedAt: row.started_at,
  lastAccessAt: row.last_access_at,
});

// Transform UserProgress to database row
const transformToRow = (progress: Partial<UserProgress>) => ({
  user_id: progress.userId,
  course_id: progress.courseId,
  completed_lessons: progress.completedLessons,
  current_lesson: progress.currentLesson,
  progress: progress.progress,
  liked: progress.liked,
  disliked: progress.disliked,
  favorites: progress.favorites,
  category_progress: progress.categoryProgress,
  last_access_at: new Date().toISOString(),
});

export function useUserProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(transformProgress);
    },
    enabled: !!user,
  });
}

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user || !courseId) return null;
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data ? transformProgress(data) : null;
    },
    enabled: !!user && !!courseId,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (progress: Partial<UserProgress> & { courseId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', progress.courseId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            ...transformToRow(progress),
            user_id: user.id,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return transformProgress(data);
      } else {
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            ...transformToRow(progress),
            user_id: user.id,
            course_id: progress.courseId,
          })
          .select()
          .single();

        if (error) throw error;
        return transformProgress(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: string; lessonId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      const completedLessons = existing?.completed_lessons || [];
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      if (existing) {
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            completed_lessons: completedLessons,
            current_lesson: lessonId,
            last_access_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return transformProgress(data);
      } else {
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            completed_lessons: completedLessons,
            current_lesson: lessonId,
          })
          .select()
          .single();

        if (error) throw error;
        return transformProgress(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
}
