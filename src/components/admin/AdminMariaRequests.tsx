import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SwipeFileRequest {
  id: string;
  user_id: string;
  request_text: string;
  created_at: string;
  profile?: { name: string; email: string } | null;
}

const AdminMariaRequests: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['swipe-file-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swipe_file_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile names
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((r: any) => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      })) as SwipeFileRequest[];
    },
  });

  const filtered = (requests || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.request_text.toLowerCase().includes(q) ||
      r.profile?.name?.toLowerCase().includes(q) ||
      r.profile?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Pedidos da Maria
          </h3>
          <p className="text-sm text-muted-foreground">
            Materiais solicitados pelos alunos que ainda não existem no Swipe File
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por aluno ou conteúdo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Material Solicitado</TableHead>
              <TableHead className="w-[160px]">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length > 0 ? (
              filtered.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {req.profile?.name || 'Desconhecido'}
                    {req.profile?.email && (
                      <span className="block text-xs text-muted-foreground">{req.profile.email}</span>
                    )}
                  </TableCell>
                  <TableCell>{req.request_text}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminMariaRequests;
