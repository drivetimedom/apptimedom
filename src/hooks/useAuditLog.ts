import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id: string | null;
  target_resource_type: string | null;
  target_resource_id: string | null;
  details: Json | null;
  ip_address: string | null;
  created_at: string;
  // Joined fields
  admin_name?: string;
  target_user_name?: string;
}

export type AuditAction =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_blocked'
  | 'user_unblocked'
  | 'user_role_changed'
  | 'password_reset'
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'banner_created'
  | 'banner_updated'
  | 'banner_deleted'
  | 'email_sent'
  | 'bulk_import'
  | 'bulk_export';

export function useAuditLog() {
  const queryClient = useQueryClient();

  const logAction = useMutation({
    mutationFn: async ({
      action,
      targetUserId,
      targetResourceType,
      targetResourceId,
      details,
    }: {
      action: AuditAction;
      targetUserId?: string | null;
      targetResourceType?: string | null;
      targetResourceId?: string | null;
      details?: Record<string, any> | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert({
          admin_user_id: user.id,
          action,
          target_user_id: targetUserId || null,
          target_resource_type: targetResourceType || null,
          target_resource_id: targetResourceId || null,
          details: details || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  return { logAction: logAction.mutateAsync };
}

export function useAuditLogs(options?: { limit?: number; action?: string }) {
  return useQuery({
    queryKey: ['audit-logs', options],
    queryFn: async () => {
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.action) {
        query = query.eq('action', options.action);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch admin and target user names
      const adminIds = [...new Set((data || []).map(log => log.admin_user_id))];
      const targetUserIds = [...new Set((data || []).filter(log => log.target_user_id).map(log => log.target_user_id))];
      const allUserIds = [...new Set([...adminIds, ...targetUserIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', allUserIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.name]));

      const enrichedLogs: AuditLogEntry[] = (data || []).map(log => ({
        ...log,
        admin_name: profileMap.get(log.admin_user_id) || 'Desconhecido',
        target_user_name: log.target_user_id ? profileMap.get(log.target_user_id) || 'Desconhecido' : undefined,
      }));

      return enrichedLogs;
    },
  });
}

// Helper to get human-readable action names
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    user_created: 'Usuário criado',
    user_updated: 'Usuário atualizado',
    user_deleted: 'Usuário excluído',
    user_blocked: 'Usuário bloqueado',
    user_unblocked: 'Usuário desbloqueado',
    user_role_changed: 'Permissão alterada',
    password_reset: 'Senha redefinida',
    course_created: 'Curso criado',
    course_updated: 'Curso atualizado',
    course_deleted: 'Curso excluído',
    category_created: 'Categoria criada',
    category_updated: 'Categoria atualizada',
    category_deleted: 'Categoria excluída',
    banner_created: 'Banner criado',
    banner_updated: 'Banner atualizado',
    banner_deleted: 'Banner excluído',
    email_sent: 'Email enviado',
    bulk_import: 'Importação em massa',
    bulk_export: 'Exportação em massa',
  };
  return labels[action] || action;
}
