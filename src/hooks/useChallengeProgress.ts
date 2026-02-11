import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  watched_videos: string[];
  created_at: string;
  updated_at: string;
}

export function useChallengeProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenge-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as ChallengeProgress[];
    },
    enabled: !!user,
  });
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      challengeId,
      progress,
      watchedVideos,
    }: {
      challengeId: string;
      progress: number;
      watchedVideos: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenge_progress')
        .upsert(
          {
            user_id: user.id,
            challenge_id: challengeId,
            progress,
            watched_videos: watchedVideos,
          },
          { onConflict: 'user_id,challenge_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as ChallengeProgress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-progress', user?.id] });
    },
  });
}
