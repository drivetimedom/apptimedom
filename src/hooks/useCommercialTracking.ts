import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnershipIds } from '@/hooks/usePartnerships';

// Types
export interface CommercialTrackingWeek {
  id: string;
  user_id: string;
  week_start: string; // DATE format YYYY-MM-DD
  appointments: number;
  attendance: number;
  deals: number;
  revenue: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommercialTrackingInput {
  week_start: string;
  appointments: number;
  attendance: number;
  deals: number;
  revenue: number;
  observations?: string;
}

// Fetch user's tracking data
export function useCommercialTracking() {
  const { user } = useAuth();
  const { data: partnerIds } = usePartnershipIds(user?.id);

  return useQuery({
    queryKey: ['commercial-tracking', user?.id, partnerIds],
    queryFn: async () => {
      if (!user?.id || !partnerIds) return [];

      const { data, error } = await supabase
        .from('commercial_tracking')
        .select('*')
        .in('user_id', partnerIds)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as CommercialTrackingWeek[];
    },
    enabled: !!user?.id && !!partnerIds,
  });
}

// Fetch all tracking data (admin only)
export function useAllCommercialTracking() {
  return useQuery({
    queryKey: ['commercial-tracking-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commercial_tracking')
        .select('*')
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as CommercialTrackingWeek[];
    },
  });
}

// Fetch tracking data for a specific user (admin)
export function useUserCommercialTracking(userId: string | null) {
  return useQuery({
    queryKey: ['commercial-tracking', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('commercial_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as CommercialTrackingWeek[];
    },
    enabled: !!userId,
  });
}

// Create tracking week
export function useCreateCommercialTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CommercialTrackingInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('commercial_tracking')
        .insert({
          user_id: user.id,
          week_start: input.week_start,
          appointments: input.appointments,
          attendance: input.attendance,
          deals: input.deals,
          revenue: input.revenue,
          observations: input.observations || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CommercialTrackingWeek;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tracking'] });
      toast({ title: 'Semana adicionada!' });
    },
    onError: (error: any) => {
      console.error('[useCreateCommercialTracking] error', error);
      toast({ title: 'Erro ao adicionar semana', description: error.message, variant: 'destructive' });
    },
  });
}

// Update tracking week
export function useUpdateCommercialTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CommercialTrackingInput> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (input.week_start !== undefined) updateData.week_start = input.week_start;
      if (input.appointments !== undefined) updateData.appointments = input.appointments;
      if (input.attendance !== undefined) updateData.attendance = input.attendance;
      if (input.deals !== undefined) updateData.deals = input.deals;
      if (input.revenue !== undefined) updateData.revenue = input.revenue;
      if (input.observations !== undefined) updateData.observations = input.observations || null;

      const { data, error } = await supabase
        .from('commercial_tracking')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CommercialTrackingWeek;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tracking'] });
    },
    onError: (error: any) => {
      console.error('[useUpdateCommercialTracking] error', error);
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete tracking week
export function useDeleteCommercialTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('commercial_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tracking'] });
      toast({ title: 'Semana excluída!' });
    },
    onError: (error: any) => {
      console.error('[useDeleteCommercialTracking] error', error);
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
