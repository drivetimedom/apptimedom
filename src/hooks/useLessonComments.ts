import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LessonComment {
  id: string;
  lessonId: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: number;
}

const transformComment = (row: any): LessonComment => ({
  id: row.id,
  lessonId: row.lesson_id,
  userId: row.user_id,
  text: row.text,
  createdAt: row.created_at,
  likes: row.likes || 0,
});

export function useLessonComments(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(transformComment);
    },
    enabled: !!lessonId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, text }: { lessonId: string; text: string }) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('comments')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          text,
        })
        .select()
        .single();
      if (error) throw error;
      return transformComment(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', variables.lessonId] });
    },
  });
}
