import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface VideoResource {
  title: string;
  url: string;
}

export interface MapVideo {
  id: string;
  title: string;
  vimeoId: string;
  duration: number;
  order: number;
  resources?: VideoResource[];
}

export interface HofMap {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  videos: MapVideo[];
  total_duration: number;
  support_material_url: string | null;
  support_material_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface HofMapInput {
  name: string;
  description?: string;
  icon: string;
  videos: MapVideo[];
  total_duration: number;
  support_material_url?: string;
  support_material_title?: string;
}

// Fetch all maps
export function useHofMaps() {
  return useQuery({
    queryKey: ['hof-maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hof_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as HofMap[];
    },
  });
}

// Create map
export function useCreateHofMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: HofMapInput) => {
      const { data, error } = await supabase
        .from('hof_maps')
        .insert({
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          videos: input.videos as any,
          total_duration: input.total_duration,
          support_material_url: input.support_material_url || null,
          support_material_title: input.support_material_title || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HofMap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-maps'] });
      toast({ title: 'Mapa criado!' });
    },
    onError: (error: any) => {
      console.error('[useCreateHofMap] error', error);
      toast({ title: 'Erro ao criar mapa', description: error.message, variant: 'destructive' });
    },
  });
}

// Update map
export function useUpdateHofMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: HofMapInput & { id: string }) => {
      const { data, error } = await supabase
        .from('hof_maps')
        .update({
          name: input.name,
          description: input.description || null,
          icon: input.icon,
          videos: input.videos as any,
          total_duration: input.total_duration,
          support_material_url: input.support_material_url || null,
          support_material_title: input.support_material_title || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HofMap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-maps'] });
      toast({ title: 'Mapa atualizado!' });
    },
    onError: (error: any) => {
      console.error('[useUpdateHofMap] error', error);
      toast({ title: 'Erro ao atualizar mapa', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete map
export function useDeleteHofMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hof_maps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hof-maps'] });
      toast({ title: 'Mapa excluído' });
    },
    onError: (error: any) => {
      console.error('[useDeleteHofMap] error', error);
      toast({ title: 'Erro ao excluir mapa', description: error.message, variant: 'destructive' });
    },
  });
}
