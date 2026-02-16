import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface ChallengeVideo {
  id: string;
  title: string;
  vimeoId: string;
  duration: number;
  order: number;
}

export interface HofChallenge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  videos: ChallengeVideo[];
  total_duration: number;
  support_material_url: string | null;
  support_material_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface HofChallengeInput {
  name: string;
  description?: string;
  icon: string;
  videos: ChallengeVideo[];
  total_duration: number;
  support_material_url?: string;
  support_material_title?: string;
}

// Fetch all challenges
export function useHofChallenges() {
  return useQuery({
    queryKey: ['hof-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hof_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as HofChallenge[];
    },
  });
}

// Create challenge
export function useCreateHofChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: HofChallengeInput) => {
      const { data, error } = await supabase
        .from('hof_challenges')
        .insert({
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          videos: input.videos as any,
          total_duration: input.total_duration,
          support_material_url: input.support_material_url || null,
          support_material_title: input.support_material_title || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HofChallenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-challenges'] });
      toast({ title: 'Protocolo criado!' });
    },
    onError: (error: any) => {
      console.error('[useCreateHofChallenge] error', error);
      toast({ title: 'Erro ao criar protocolo', description: error.message, variant: 'destructive' });
    },
  });
}

// Update challenge
export function useUpdateHofChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: HofChallengeInput & { id: string }) => {
      const { data, error } = await supabase
        .from('hof_challenges')
        .update({
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          videos: input.videos as any,
          total_duration: input.total_duration,
          support_material_url: input.support_material_url || null,
          support_material_title: input.support_material_title || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HofChallenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-challenges'] });
      toast({ title: 'Protocolo atualizado!' });
    },
    onError: (error: any) => {
      console.error('[useUpdateHofChallenge] error', error);
      toast({ title: 'Erro ao atualizar protocolo', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete challenge
export function useDeleteHofChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hof_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-challenges'] });
      toast({ title: 'Protocolo excluído' });
    },
    onError: (error: any) => {
      console.error('[useDeleteHofChallenge] error', error);
      toast({ title: 'Erro ao excluir protocolo', description: error.message, variant: 'destructive' });
    },
  });
}
