import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  showRoadmap: boolean;
}

export interface PageConfig {
  bannerTitle: string;
  bannerSubtitle?: string;
  bannerImageUrl?: string;
  bannerCtaText?: string;
  aboutText?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  slug: string;
  order: number;
  active: boolean;
  hasDedicatedPage?: boolean;
  showInMainMenu?: boolean;
  pageConfig?: PageConfig;
  subcategories?: Subcategory[];
}

// Transform database row to Category interface
const transformCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon || '📚',
  description: row.description,
  slug: row.slug,
  order: row.order || 0,
  active: row.active ?? true,
  hasDedicatedPage: row.has_dedicated_page || false,
  showInMainMenu: row.show_in_main_menu ?? true,
  pageConfig: row.page_config,
  subcategories: row.subcategories || [],
});

// Transform Category to database row
const transformToRow = (category: Partial<Category>) => ({
  name: category.name,
  icon: category.icon,
  description: category.description,
  slug: category.slug,
  order: category.order,
  active: category.active,
  has_dedicated_page: category.hasDedicatedPage,
  show_in_main_menu: category.showInMainMenu,
  page_config: category.pageConfig ? JSON.parse(JSON.stringify(category.pageConfig)) : null,
  subcategories: JSON.parse(JSON.stringify(category.subcategories || [])),
});

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformCategory);
    },
  });
}

export function useCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .maybeSingle();

      if (error) throw error;
      return data ? transformCategory(data) : null;
    },
    enabled: !!categoryId,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? transformCategory(data) : null;
    },
    enabled: !!slug,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(transformToRow(category))
        .select()
        .single();

      if (error) throw error;
      return transformCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Categoria criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar categoria', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(transformToRow(category))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Categoria atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar categoria', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Categoria excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir categoria', description: error.message, variant: 'destructive' });
    },
  });
}
