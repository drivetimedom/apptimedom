import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

// Types matching the database schema
export interface AdminUser {
  id: string; // profile id
  user_id: string; // auth user id
  name: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  instagram: string | null;
  status: 'iniciante' | 'primeiras-vendas' | 'intermediario' | 'avancado' | 'elite';
  prescribed_map: string | null;
  visible_challenges: string[];
  activation_plan: any[];
  unlocked_courses: string[];
  created_at: string;
  updated_at: string;
  blocked: boolean;
  // Joined from user_roles
  role: 'admin' | 'instructor' | 'user' | 'team_member' | 'student';
  active: boolean;
}

// Fetch all users (profiles with roles)
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id -> role
      const roleMap = new Map<string, AdminUser['role']>();
      (roles || []).forEach(r => {
        roleMap.set(r.user_id, r.role as AdminUser['role']);
      });

      // Transform data to AdminUser format
      const users: AdminUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        instagram: profile.instagram,
        status: (profile.status as AdminUser['status']) || 'iniciante',
        prescribed_map: profile.prescribed_map,
        visible_challenges: profile.visible_challenges || [],
        activation_plan: Array.isArray(profile.activation_plan) ? profile.activation_plan : [],
        unlocked_courses: profile.unlocked_courses || [],
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        blocked: (profile as any).blocked || false,
        role: roleMap.get(profile.user_id) || 'user',
        active: !(profile as any).blocked,
      }));

      return users;
    },
  });
}

// Update user profile
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: async ({ 
      profileId, 
      userId,
      data 
    }: { 
      profileId: string; 
      userId: string;
      data: Partial<{
        name: string;
        email: string;
        avatar: string | null;
        bio: string | null;
        instagram: string | null;
        status: AdminUser['status'];
        prescribed_map: string | null;
        visible_challenges: string[];
        activation_plan: any[];
        unlocked_courses: string[];
      }>;
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          bio: data.bio,
          instagram: data.instagram,
          status: data.status,
          prescribed_map: data.prescribed_map,
          visible_challenges: data.visible_challenges,
          activation_plan: data.activation_plan as any,
          unlocked_courses: data.unlocked_courses,
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      return { profileId, userId, data };
    },
    onSuccess: async ({ userId, data }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuário atualizado!' });
      
      // Log the action
      try {
        await logAction({
          action: 'user_updated',
          targetUserId: userId,
          details: { updatedFields: Object.keys(data) },
        });
      } catch (e) {
        console.error('Failed to log audit action:', e);
      }
    },
    onError: (error: any) => {
      console.error('[useUpdateAdminUser] error:', error);
      toast({ 
        title: 'Erro ao atualizar usuário', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      userId,
      role
    }: { 
      userId: string;
      role: 'admin' | 'instructor' | 'user' | 'team_member' | 'student';
    }) => {
      // First, check if role exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const oldRole = existingRole?.role || 'user';

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      return { userId, role, oldRole };
    },
    onSuccess: async ({ userId, role, oldRole }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Permissão atualizada!' });
      
      // Log the action
      try {
        await logAction({
          action: 'user_role_changed',
          targetUserId: userId,
          details: { oldRole, newRole: role },
        });
      } catch (e) {
        console.error('Failed to log audit action:', e);
      }
    },
    onError: (error: any) => {
      console.error('[useUpdateUserRole] error:', error);
      toast({ 
        title: 'Erro ao atualizar permissão', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

// Toggle user blocked status
export function useToggleUserBlocked() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: async ({ profileId, userId, blocked }: { profileId: string; userId: string; blocked: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked } as any)
        .eq('id', profileId);

      if (error) throw error;
      return { userId, blocked };
    },
    onSuccess: async ({ userId, blocked }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: blocked ? 'Usuário bloqueado' : 'Usuário desbloqueado' });
      
      try {
        await logAction({
          action: blocked ? 'user_blocked' : 'user_unblocked',
          targetUserId: userId,
        });
      } catch (e) {
        console.error('Failed to log audit action:', e);
      }
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao alterar status', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete user completely (auth + all data)
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      return { userId };
    },
    onSuccess: async ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuário excluído permanentemente' });

      try {
        await logAction({
          action: 'user_deleted',
          targetUserId: userId,
        });
      } catch (e) {
        console.error('Failed to log audit action:', e);
      }
    },
    onError: (error: any) => {
      console.error('[useDeleteAdminUser] error:', error);
      toast({ 
        title: 'Erro ao excluir usuário', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}
