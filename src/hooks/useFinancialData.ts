import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnershipIds } from '@/hooks/usePartnerships';
import type { DespesasFixas, HoraClinica, Procedimento, Parametros, DadosPE, MCProcedimento, PlanoMetas } from '@/stores/financialStore';

// Types for the financial data stored in JSONB
export interface FinancialDataPayload {
  despesasFixas?: DespesasFixas;
  horaClinica?: HoraClinica;
  procedimentos?: Procedimento[];
  parametros?: Parametros;
  dadosPE?: DadosPE;
  mcProcedimentos?: MCProcedimento[];
  planoMetas?: PlanoMetas;
}

export interface FinancialDataRow {
  id: string;
  user_id: string;
  data: FinancialDataPayload;
  created_at: string;
  updated_at: string;
}

// Fetch user's financial data
export function useFinancialData() {
  const { user } = useAuth();
  const { data: partnerIds } = usePartnershipIds(user?.id);

  return useQuery({
    queryKey: ['financial-data', user?.id, partnerIds],
    queryFn: async () => {
      if (!user?.id || !partnerIds) return null;

      // Get financial data for all partners
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .in('user_id', partnerIds)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FinancialDataRow | null;
    },
    enabled: !!user?.id && !!partnerIds,
  });
}

// Upsert financial data (create or update)
export function useSaveFinancialData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: FinancialDataPayload) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // First check if record exists
      const { data: existing } = await supabase
        .from('financial_data')
        .select('id, data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Merge with existing data
        const mergedData = { ...(existing.data as FinancialDataPayload || {}), ...payload };
        
        const { data, error } = await supabase
          .from('financial_data')
          .update({ data: mergedData as any })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as FinancialDataRow;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('financial_data')
          .insert({
            user_id: user.id,
            data: payload as any,
          })
          .select()
          .single();

        if (error) throw error;
        return data as FinancialDataRow;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-data'] });
    },
    onError: (error: any) => {
      console.error('[useSaveFinancialData] error', error);
      toast({ title: 'Erro ao salvar dados', description: error.message, variant: 'destructive' });
    },
  });
}
