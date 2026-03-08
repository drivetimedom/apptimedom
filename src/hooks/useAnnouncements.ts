import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  created_by: string | null;
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    },
  });
}

export function useActiveAnnouncements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['announcements', 'active', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get active, non-expired announcements
      const { data: announcements, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter expired
      const now = new Date().toISOString();
      const valid = (announcements || []).filter(
        (a: any) => !a.expires_at || a.expires_at > now
      ) as Announcement[];

      if (valid.length === 0) return [];

      // Get user's dismissals
      const { data: dismissals } = await supabase
        .from('announcement_dismissals')
        .select('announcement_id')
        .eq('user_id', user!.id);

      const dismissedIds = new Set((dismissals || []).map((d: any) => d.announcement_id));
      return valid.filter(a => !dismissedIds.has(a.id));
    },
  });
}

export function useDismissAnnouncement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcement_dismissals')
        .insert({ user_id: user!.id, announcement_id: announcementId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { title: string; content?: string; image_url?: string; expires_at?: string }) => {
      const { error } = await supabase.from('announcements').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Aviso criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar aviso', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Announcement> & { id: string }) => {
      const { error } = await supabase.from('announcements').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Aviso atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar aviso', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Aviso excluído!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir aviso', description: error.message, variant: 'destructive' });
    },
  });
}
