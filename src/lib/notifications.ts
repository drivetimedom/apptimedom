import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  userIds: string[] | 'all';
  type: 'new_course' | 'new_lesson' | 'prescribed_lesson' | 'progress_reminder' | string;
  title: string;
  message?: string;
  link?: string;
}

export async function sendNotification(params: SendNotificationParams) {
  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: {
      user_ids: params.userIds,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });

  if (error) {
    console.error('[sendNotification] Error:', error);
    throw error;
  }

  return data;
}
