import { useState } from 'react';
import { useAuditLogs, getActionLabel } from '@/hooks/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, User, Settings, FileText, ShieldCheck } from 'lucide-react';

const actionFilters = [
  { value: 'all', label: 'Todas as ações' },
  { value: 'user_created', label: 'Usuário criado' },
  { value: 'user_updated', label: 'Usuário atualizado' },
  { value: 'user_deleted', label: 'Usuário excluído' },
  { value: 'user_role_changed', label: 'Permissão alterada' },
  { value: 'password_reset', label: 'Senha redefinida' },
  { value: 'email_sent', label: 'Email enviado' },
  { value: 'bulk_import', label: 'Importação' },
  { value: 'bulk_export', label: 'Exportação' },
];

function getActionIcon(action: string) {
  if (action.startsWith('user_') || action === 'password_reset') {
    return <User className="h-4 w-4" />;
  }
  if (action.startsWith('course_') || action.startsWith('category_')) {
    return <FileText className="h-4 w-4" />;
  }
  if (action === 'email_sent') {
    return <Settings className="h-4 w-4" />;
  }
  if (action.startsWith('bulk_')) {
    return <FileText className="h-4 w-4" />;
  }
  return <ShieldCheck className="h-4 w-4" />;
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes('deleted')) return 'destructive';
  if (action.includes('created')) return 'default';
  if (action.includes('updated') || action.includes('changed') || action === 'password_reset') return 'secondary';
  return 'outline';
}

export function AuditLogViewer() {
  const [actionFilter, setActionFilter] = useState('all');
  
  const { data: logs, isLoading } = useAuditLogs({
    limit: 100,
    action: actionFilter === 'all' ? undefined : actionFilter,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              {actionFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum registro de auditoria encontrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Usuário Alvo</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)} className="gap-1">
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.admin_name}
                    </TableCell>
                    <TableCell>
                      {log.target_user_name || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
