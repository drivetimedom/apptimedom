import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface SwipeFileType {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface SwipeFileCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface SwipeFileMaterial {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  type_id: string | null;
  category_id: string | null;
  tags: string[];
  content: string | null;
  links: { label: string; url: string }[];
  pdfs: { label: string; url: string }[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  parent_folder_ids: string[];
  featured_folder_ids: string[];
  related_process_ids: string[];
  featured_process_ids: string[];
  // Joined data
  type?: SwipeFileType | null;
  category?: SwipeFileCategory | null;
}

export interface SwipeFileFavorite {
  id: string;
  user_id: string;
  material_id: string;
  created_at: string;
}

// ============= TYPES HOOKS =============

export function useSwipeFileTypes() {
  return useQuery({
    queryKey: ['swipe-file-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swipe_file_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SwipeFileType[];
    },
  });
}

export function useCreateSwipeFileType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newType: Omit<SwipeFileType, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('swipe_file_types')
        .insert(newType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-types'] });
      toast({ title: 'Tipo criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar tipo', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSwipeFileType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SwipeFileType> & { id: string }) => {
      const { data, error } = await supabase
        .from('swipe_file_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-types'] });
      toast({ title: 'Tipo atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar tipo', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSwipeFileType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('swipe_file_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-types'] });
      toast({ title: 'Tipo excluído!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir tipo', description: error.message, variant: 'destructive' });
    },
  });
}

// ============= CATEGORIES HOOKS =============

export function useSwipeFileCategories() {
  return useQuery({
    queryKey: ['swipe-file-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swipe_file_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SwipeFileCategory[];
    },
  });
}

export function useCreateSwipeFileCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newCategory: Omit<SwipeFileCategory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('swipe_file_categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-categories'] });
      toast({ title: 'Categoria criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar categoria', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSwipeFileCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SwipeFileCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('swipe_file_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-categories'] });
      toast({ title: 'Categoria atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar categoria', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSwipeFileCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('swipe_file_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-categories'] });
      toast({ title: 'Categoria excluída!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir categoria', description: error.message, variant: 'destructive' });
    },
  });
}

// ============= MATERIALS HOOKS =============

export function useSwipeFileMaterials() {
  return useQuery({
    queryKey: ['swipe-file-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swipe_file_materials')
        .select(`
          *,
          type:swipe_file_types(*),
          category:swipe_file_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse JSONB fields
      return (data || []).map(item => ({
        ...item,
        links: Array.isArray(item.links) ? item.links : [],
        pdfs: Array.isArray(item.pdfs) ? item.pdfs : [],
        tags: item.tags || [],
        parent_folder_ids: item.parent_folder_ids || [],
        featured_folder_ids: item.featured_folder_ids || [],
        related_process_ids: item.related_process_ids || [],
        featured_process_ids: item.featured_process_ids || [],
      })) as unknown as SwipeFileMaterial[];
    },
  });
}

export function useCreateSwipeFileMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newMaterial: Omit<SwipeFileMaterial, 'id' | 'created_at' | 'updated_at' | 'type' | 'category'>) => {
      const { data, error } = await supabase
        .from('swipe_file_materials')
        .insert({
          ...newMaterial,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-materials'] });
      toast({ title: 'Material criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar material', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSwipeFileMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SwipeFileMaterial> & { id: string }) => {
      // Remove joined fields before update
      const { type, category, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('swipe_file_materials')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-materials'] });
      toast({ title: 'Material atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar material', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSwipeFileMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('swipe_file_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-materials'] });
      toast({ title: 'Material excluído!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir material', description: error.message, variant: 'destructive' });
    },
  });
}

// ============= FAVORITES HOOKS =============

export function useSwipeFileFavorites() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['swipe-file-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('swipe_file_favorites')
        .select('material_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(f => f.material_id);
    },
    enabled: !!user?.id,
  });
}

export function useToggleSwipeFileFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ materialId, isFavorite }: { materialId: string; isFavorite: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('swipe_file_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('material_id', materialId);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('swipe_file_favorites')
          .insert({ user_id: user.id, material_id: materialId });

        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['swipe-file-favorites'] });
      toast({ 
        title: data.action === 'added' ? 'Adicionado aos favoritos' : 'Removido dos favoritos' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar favoritos', description: error.message, variant: 'destructive' });
    },
  });
}
