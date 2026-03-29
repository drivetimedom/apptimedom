import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnershipIds } from '@/hooks/usePartnerships';

// Types
export interface TrafficTrackingWeek {
  id: string;
  user_id: string;
  week_start: string; // DATE format YYYY-MM-DD
  investment: number;
  leads_generated: number;
  appointments: number;
  attendance: number;
  deals: number;
  average_ticket: number;
  revenue: number;
  created_at: string;
  updated_at: string;
}

export interface TrafficTrackingInput {
  week_start: string;
  investment: number;
  leads_generated: number;
  appointments: number;
  attendance: number;
  deals: number;
  average_ticket: number;
  revenue: number;
}

// Fetch user's traffic tracking data
export function useTrafficTracking() {
  const { user } = useAuth();
  const { data: partnerIds } = usePartnershipIds(user?.id);

  return useQuery({
    queryKey: ['traffic-tracking', user?.id, partnerIds],
    queryFn: async () => {
      if (!user?.id || !partnerIds) return [];

      const { data, error } = await supabase
        .from('traffic_tracking')
        .select('*')
        .in('user_id', partnerIds)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as TrafficTrackingWeek[];
    },
    enabled: !!user?.id && !!partnerIds,
  });
}

// Fetch all traffic tracking data (admin only)
export function useAllTrafficTracking() {
  return useQuery({
    queryKey: ['traffic-tracking-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_tracking')
        .select('*')
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as TrafficTrackingWeek[];
    },
  });
}

// Fetch traffic tracking data for a specific user (admin)
export function useUserTrafficTracking(userId: string | null) {
  return useQuery({
    queryKey: ['traffic-tracking', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('traffic_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return (data || []) as TrafficTrackingWeek[];
    },
    enabled: !!userId,
  });
}

// Create traffic tracking week
export function useCreateTrafficTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: TrafficTrackingInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('traffic_tracking')
        .insert({
          user_id: user.id,
          week_start: input.week_start,
          investment: input.investment,
          leads_generated: input.leads_generated,
          appointments: input.appointments,
          attendance: input.attendance,
          deals: input.deals,
          average_ticket: input.average_ticket,
          revenue: input.revenue,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TrafficTrackingWeek;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['traffic-tracking-all'] });
      toast({ title: 'Período adicionado!' });
    },
    onError: (error: any) => {
      console.error('[useCreateTrafficTracking] error', error);
      toast({ title: 'Erro ao adicionar período', description: error.message, variant: 'destructive' });
    },
  });
}

// Update traffic tracking week
export function useUpdateTrafficTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<TrafficTrackingInput> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (input.week_start !== undefined) updateData.week_start = input.week_start;
      if (input.investment !== undefined) updateData.investment = input.investment;
      if (input.leads_generated !== undefined) updateData.leads_generated = input.leads_generated;
      if (input.appointments !== undefined) updateData.appointments = input.appointments;
      if (input.attendance !== undefined) updateData.attendance = input.attendance;
      if (input.deals !== undefined) updateData.deals = input.deals;
      if (input.average_ticket !== undefined) updateData.average_ticket = input.average_ticket;
      if (input.revenue !== undefined) updateData.revenue = input.revenue;

      const { data, error } = await supabase
        .from('traffic_tracking')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TrafficTrackingWeek;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-tracking'] });
    },
    onError: (error: any) => {
      console.error('[useUpdateTrafficTracking] error', error);
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete traffic tracking week
export function useDeleteTrafficTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('traffic_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-tracking'] });
      toast({ title: 'Período excluído!' });
    },
    onError: (error: any) => {
      console.error('[useDeleteTrafficTracking] error', error);
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
