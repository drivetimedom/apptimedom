import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook to get all IDs in a partnership (including the user themselves)
export const usePartnershipIds = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['partnership-ids', userId],
    queryFn: async () => {
      if (!userId) return [userId].filter(Boolean) as string[];

      const { data, error } = await supabase.rpc('get_partnership_ids', {
        user_uuid: userId,
      });

      if (error) {
        console.error('Error fetching partnership IDs:', error);
        return [userId];
      }

      return (data as string[]) || [userId];
    },
    enabled: !!userId,
  });
};

// Hook to get partner profile details
export const usePartnerDetails = (userId: string | undefined) => {
  const { data: partnerIds } = usePartnershipIds(userId);

  return useQuery({
    queryKey: ['partner-details', userId, partnerIds],
    queryFn: async () => {
      if (!partnerIds || partnerIds.length <= 1) return [];

      const otherPartnerIds = partnerIds.filter(id => id !== userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', otherPartnerIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!partnerIds && partnerIds.length > 1,
  });
};

// Hook to get all partnerships (admin)
export const useAllPartnerships = () => {
  return useQuery({
    queryKey: ['all-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Add partnership (admin)
export const useAddPartnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ primaryUserId, partnerUserId }: { primaryUserId: string; partnerUserId: string }) => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('partnerships')
        .insert({
          primary_user_id: primaryUserId,
          partner_user_id: partnerUserId,
          created_by: authData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-ids'] });
      queryClient.invalidateQueries({ queryKey: ['partner-details'] });
      queryClient.invalidateQueries({ queryKey: ['all-partnerships'] });
    },
  });
};

// Remove partnership (admin)
export const useRemovePartnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, partnerId }: { userId: string; partnerId: string }) => {
      // Delete in both directions
      await supabase
        .from('partnerships')
        .delete()
        .eq('primary_user_id', userId)
        .eq('partner_user_id', partnerId);

      await supabase
        .from('partnerships')
        .delete()
        .eq('primary_user_id', partnerId)
        .eq('partner_user_id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-ids'] });
      queryClient.invalidateQueries({ queryKey: ['partner-details'] });
      queryClient.invalidateQueries({ queryKey: ['all-partnerships'] });
    },
  });
};
