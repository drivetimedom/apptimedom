import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'instructor' | 'user' | 'team_member' | 'student';
}

interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createUser = async (params: CreateUserParams): Promise<CreateUserResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: params.email,
          password: params.password,
          name: params.name,
          role: params.role || 'user',
        },
      });

      if (error) {
        console.error('Error calling create-admin-user:', error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      // Invalidate all user-related queries so lists update automatically
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });

      return { 
        success: true, 
        userId: data.userId 
      };
    } catch (err: any) {
      console.error('Error creating user:', err);
      return { success: false, error: err.message || 'Erro ao criar usuário' };
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading };
}
