import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  // Joined from user_roles
  role: 'admin' | 'instructor' | 'user';
  active: boolean; // We'll consider all Supabase users as active
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
      const roleMap = new Map<string, 'admin' | 'instructor' | 'user'>();
      (roles || []).forEach(r => {
        roleMap.set(r.user_id, r.role);
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
        role: roleMap.get(profile.user_id) || 'user',
        active: true, // All Supabase users are considered active
      }));

      return users;
    },
  });
}

// Update user profile
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

      return { profileId, userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuário atualizado!' });
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

  return useMutation({
    mutationFn: async ({ 
      userId, 
      role 
    }: { 
      userId: string; 
      role: 'admin' | 'instructor' | 'user';
    }) => {
      // First, check if role exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

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

      return { userId, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Permissão atualizada!' });
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

// Delete user (note: this only deletes from profiles, auth deletion needs admin API)
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // Delete user role first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Note: We cannot delete from auth.users directly without admin privileges
      // The profile will remain but we could mark it as inactive if needed
      // For now, we'll just notify the admin

      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ 
        title: 'Permissões do usuário removidas',
        description: 'Para excluir completamente, acesse o painel do Supabase.'
      });
    },
    onError: (error: any) => {
      console.error('[useDeleteAdminUser] error:', error);
      toast({ 
        title: 'Erro ao remover usuário', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}
