import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { enviarEmailRedefinicaoSenha } from '@/lib/emailService';

interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { logAction } = useAuditLog();

  const resetPassword = async (
    userId: string, 
    newPassword: string,
    userEmail?: string,
    userName?: string
  ): Promise<ResetPasswordResult> => {
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

      // Log the action
      try {
        await logAction({
          action: 'password_reset',
          targetUserId: userId,
          details: { method: 'admin_reset' },
        });
      } catch (e) {
        console.error('Failed to log audit action:', e);
      }

      // Send notification email if we have user info
      if (userEmail && userName) {
        try {
          await enviarEmailRedefinicaoSenha(userEmail, userName);
          console.log('Password reset notification email sent to:', userEmail);
        } catch (e) {
          console.error('Failed to send password reset email:', e);
          // Don't fail the operation if email fails
        }
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
