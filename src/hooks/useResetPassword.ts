import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (userId: string, newPassword: string): Promise<ResetPasswordResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId,
          newPassword,
        },
      });

      if (error) {
        console.error('Error calling reset-user-password:', error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error resetting password:', err);
      return { success: false, error: err.message || 'Erro ao redefinir senha' };
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading };
}
