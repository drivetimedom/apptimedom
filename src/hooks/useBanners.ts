import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'course' | 'external' | 'page';
  linkTo: string;
  ctaText?: string;
  active: boolean;
  order: number;
}

// Transform database row to Banner interface
const transformBanner = (row: any): Banner => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  imageUrl: row.image_url || '',
  linkType: row.link_type || 'course',
  linkTo: row.link_to || '',
  ctaText: row.cta_text,
  active: row.active ?? true,
  order: row.order || 0,
});

// Transform Banner to database row
const transformToRow = (banner: Partial<Banner>) => ({
  title: banner.title,
  subtitle: banner.subtitle,
  image_url: banner.imageUrl,
  link_type: banner.linkType,
  link_to: banner.linkTo,
  cta_text: banner.ctaText,
  active: banner.active,
  order: banner.order,
});

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformBanner);
    },
  });
}

export function useActiveBanners() {
  return useQuery({
    queryKey: ['banners', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformBanner);
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (banner: Omit<Banner, 'id'>) => {
      const { data, error } = await supabase
        .from('banners')
        .insert(transformToRow(banner))
        .select()
        .single();

      if (error) throw error;
      return transformBanner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar banner', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...banner }: Partial<Banner> & { id: string }) => {
      const { data, error } = await supabase
        .from('banners')
        .update(transformToRow(banner))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformBanner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar banner', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bannerId: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner excluído com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir banner', description: error.message, variant: 'destructive' });
    },
  });
}
