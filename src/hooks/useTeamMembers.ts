import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  member_id: string;
  owner_id: string;
  status: string;
  created_by: string;
  created_at: string;
  suspended_by: string | null;
  suspended_at: string | null;
  reactivated_by: string | null;
  reactivated_at: string | null;
  // Joined data
  member_name?: string;
  member_email?: string;
  owner_name?: string;
  owner_email?: string;
}

export interface TeamMemberGlobalSettings {
  id: string;
  allowed_course_ids: string[];
  swipefile_access: boolean;
  calculators_access: boolean;
  hof_circle_access: boolean;
  updated_at: string;
  updated_by: string | null;
}

// Admin: fetch all team members with profile data
export function useAdminTeamMembers() {
  return useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for members and owners
      const memberIds = [...new Set([
        ...(teamMembers || []).map(t => t.member_id),
        ...(teamMembers || []).map(t => t.owner_id),
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', memberIds);

      const profileMap = new Map<string, { name: string; email: string | null }>();
      (profiles || []).forEach(p => profileMap.set(p.user_id, { name: p.name, email: p.email }));

      return (teamMembers || []).map(tm => ({
        ...tm,
        member_name: profileMap.get(tm.member_id)?.name || 'Sem nome',
        member_email: profileMap.get(tm.member_id)?.email || '',
        owner_name: profileMap.get(tm.owner_id)?.name || 'Sem nome',
        owner_email: profileMap.get(tm.owner_id)?.email || '',
      })) as TeamMember[];
    },
  });
}

// Doctor: fetch own team members
export function useMyTeamMembers(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-team-members', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const memberIds = (teamMembers || []).map(t => t.member_id);
      if (memberIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', memberIds);

      const profileMap = new Map<string, { name: string; email: string | null }>();
      (profiles || []).forEach(p => profileMap.set(p.user_id, { name: p.name, email: p.email }));

      return (teamMembers || []).map(tm => ({
        ...tm,
        member_name: profileMap.get(tm.member_id)?.name || 'Sem nome',
        member_email: profileMap.get(tm.member_id)?.email || '',
      })) as TeamMember[];
    },
    enabled: !!userId,
  });
}

// Count active team members for an owner
export function useTeamMemberCount(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['team-member-count', ownerId],
    queryFn: async () => {
      if (!ownerId) return 0;
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('status', 'active');

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!ownerId,
  });
}

// Toggle team member status (suspend/reactivate)
export function useToggleTeamMemberStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teamMemberId, newStatus, userId }: { teamMemberId: string; newStatus: string; userId: string }) => {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'suspended') {
        updates.suspended_by = userId;
        updates.suspended_at = new Date().toISOString();
      } else {
        updates.reactivated_by = userId;
        updates.reactivated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ title: variables.newStatus === 'suspended' ? 'Acesso suspenso' : 'Acesso reativado' });
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-member-count'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete team member record
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teamMemberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Membro excluído' });
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-member-count'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao excluir membro', description: error.message, variant: 'destructive' });
    },
  });
}

// Fetch global settings
export function useTeamMemberGlobalSettings() {
  return useQuery({
    queryKey: ['team-member-global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_member_global_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as TeamMemberGlobalSettings;
    },
  });
}

// Update global settings
export function useUpdateTeamMemberGlobalSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<TeamMemberGlobalSettings> & { id: string }) => {
      const { error } = await supabase
        .from('team_member_global_settings')
        .update({
          allowed_course_ids: settings.allowed_course_ids,
          swipefile_access: settings.swipefile_access,
          calculators_access: settings.calculators_access,
          hof_circle_access: settings.hof_circle_access,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Configurações salvas!' });
      queryClient.invalidateQueries({ queryKey: ['team-member-global-settings'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao salvar configurações', description: error.message, variant: 'destructive' });
    },
  });
}

// Check if current user is a team_member
export function useIsTeamMember() {
  return useQuery({
    queryKey: ['is-team-member'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      return roleData?.role === 'team_member';
    },
  });
}

// Check if team_member is suspended
export function useIsTeamMemberSuspended() {
  return useQuery({
    queryKey: ['is-team-member-suspended'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: tm } = await supabase
        .from('team_members')
        .select('status')
        .eq('member_id', user.id)
        .maybeSingle();

      return tm?.status === 'suspended';
    },
  });
}
