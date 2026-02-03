import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customization, defaultCustomization, applyCustomization } from '@/lib/customization';

// Fetch customization settings (singleton row)
export function useCustomizationSettings() {
  return useQuery({
    queryKey: ['customization-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customization_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        // If no row exists, return defaults
        if (error.code === 'PGRST116') {
          return { id: null, settings: defaultCustomization };
        }
        throw error;
      }

      // Merge with defaults to ensure all keys exist
      const settings = { ...defaultCustomization, ...(data.settings as Partial<Customization>) };
      return { id: data.id, settings };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Update customization settings
export function useUpdateCustomizationSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Customization) => {
      // First try to get existing row
      const { data: existing } = await supabase
        .from('customization_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('customization_settings')
          .update({ settings: settings as any })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new (shouldn't happen normally as we seed one row)
        const { data, error } = await supabase
          .from('customization_settings')
          .insert({ settings: settings as any })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, settings) => {
      queryClient.invalidateQueries({ queryKey: ['customization-settings'] });
      // Apply customization immediately
      applyCustomization(settings);
      toast({ title: 'Personalizações salvas!' });
    },
    onError: (error: any) => {
      console.error('[useUpdateCustomizationSettings] error', error);
      toast({ title: 'Erro ao salvar personalizações', description: error.message, variant: 'destructive' });
    },
  });
}

// Reset to defaults
export function useResetCustomizationSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from('customization_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing?.id) {
        const { error } = await supabase
          .from('customization_settings')
          .update({ settings: defaultCustomization as any })
          .eq('id', existing.id);

        if (error) throw error;
      }
      return defaultCustomization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-settings'] });
      applyCustomization(defaultCustomization);
      toast({ title: 'Personalização resetada!' });
    },
    onError: (error: any) => {
      console.error('[useResetCustomizationSettings] error', error);
      toast({ title: 'Erro ao resetar personalizações', description: error.message, variant: 'destructive' });
    },
  });
}
