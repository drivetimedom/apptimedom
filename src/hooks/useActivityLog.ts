import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ActivityAction =
  | 'login'
  | 'lesson_watched'
  | 'lesson_completed'
  | 'course_enrolled'
  | 'course_completed'
  | 'certificate_issued'
  | 'profile_updated'
  | 'password_changed'
  | 'comment_added'
  | 'activation_task_completed';

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async (action: ActivityAction, details?: Record<string, any>) => {
      if (!user) return;

      try {
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          action,
          details: details ?? null,
        });
      } catch (error) {
        console.error('[ActivityLog] Error logging activity:', error);
      }
    },
    [user]
  );

  return { logActivity };
}
