import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AiTool {
  id: string;
  name: string;
  description: string;
  link: string;
  tag: string | null;
  icon: string;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type AiToolInput = Omit<AiTool, 'id' | 'created_at' | 'updated_at'>;

export const useAiTools = (includeInactive = false) => {
  return useQuery({
    queryKey: ['ai_tools', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('ai_tools')
        .select('*')
        .order('order_index', { ascending: true });

      if (!includeInactive) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AiTool[];
    },
  });
};

export const useUpsertAiTool = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<AiTool> & AiToolInput) => {
      if (id) {
        const { error } = await supabase.from('ai_tools').update(input).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ai_tools').insert(input);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_tools'] });
      toast({ title: 'Ferramenta salva com sucesso' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    },
  });
};

export const useDeleteAiTool = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_tools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai_tools'] });
      toast({ title: 'Ferramenta excluída' });
    },
    onError: (e: any) => {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
    },
  });
};
