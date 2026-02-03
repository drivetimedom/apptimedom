import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export type TemplateCategory = 'setup' | 'trafego' | 'vendas' | 'operacional' | 'financeiro' | 'geral';

export interface ActivationPlanTemplate {
  id: string;
  name: string;
  description: string | null;
  tasks: {
    id?: string;
    text: string;
    category?: TemplateCategory;
  }[];
  created_at: string;
  updated_at: string;
}

export interface ActivationPlanTemplateInput {
  name: string;
  description?: string;
  tasks: string[];
  category?: TemplateCategory;
}

// Fetch all templates
export function useActivationPlanTemplates() {
  return useQuery({
    queryKey: ['activation-plan-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activation_plan_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ActivationPlanTemplate[];
    },
  });
}

// Create template
export function useCreateActivationPlanTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: ActivationPlanTemplateInput) => {
      // Convert string[] tasks to object format for JSONB
      const tasksData = input.tasks.map((text, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        text,
        category: input.category || 'geral',
      }));

      const { data, error } = await supabase
        .from('activation_plan_templates')
        .insert({
          name: input.name,
          description: input.description || null,
          tasks: tasksData as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ActivationPlanTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-plan-templates'] });
      toast({ title: 'Template criado!' });
    },
    onError: (error: any) => {
      console.error('[useCreateActivationPlanTemplate] error', error);
      toast({ title: 'Erro ao criar template', description: error.message, variant: 'destructive' });
    },
  });
}

// Update template
export function useUpdateActivationPlanTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: ActivationPlanTemplateInput & { id: string }) => {
      const tasksData = input.tasks.map((text, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        text,
        category: input.category || 'geral',
      }));

      const { data, error } = await supabase
        .from('activation_plan_templates')
        .update({
          name: input.name,
          description: input.description || null,
          tasks: tasksData as any,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ActivationPlanTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-plan-templates'] });
      toast({ title: 'Template atualizado!' });
    },
    onError: (error: any) => {
      console.error('[useUpdateActivationPlanTemplate] error', error);
      toast({ title: 'Erro ao atualizar template', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete template
export function useDeleteActivationPlanTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activation_plan_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-plan-templates'] });
      toast({ title: 'Template excluído' });
    },
    onError: (error: any) => {
      console.error('[useDeleteActivationPlanTemplate] error', error);
      toast({ title: 'Erro ao excluir template', description: error.message, variant: 'destructive' });
    },
  });
}
