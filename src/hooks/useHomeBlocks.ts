import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export type BlockType = 'banner' | 'courses' | 'text' | 'button' | 'video' | 'divider';

export interface BannerBlockData {
  imageUrl: string;
  link: string;
  height: string;
  openInNewTab: boolean;
}

export interface CoursesBlockData {
  title: string;
  filterType: 'all' | 'category' | 'single';
  categoryId: string | null;
  courseId: string | null;
  layout: 'grid' | 'carousel';
  itemsPerRow: number;
  limit: number | null;
}

export interface TextBlockData {
  title: string;
  subtitle: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ButtonBlockData {
  text: string;
  link: string;
  color: string;
  size: 'small' | 'medium' | 'large';
}

export interface VideoBlockData {
  url: string;
  height: string;
}

export interface DividerBlockData {
  spacing: string;
}

export type BlockData = BannerBlockData | CoursesBlockData | TextBlockData | ButtonBlockData | VideoBlockData | DividerBlockData;

export interface HomeBlock {
  id: string;
  type: BlockType;
  order_index: number;
  data: BlockData;
  created_at: string;
  updated_at: string;
}

// Transform database row to HomeBlock
const transformBlock = (row: {
  id: string;
  type: string;
  order_index: number;
  data: Json;
  created_at: string;
  updated_at: string;
}): HomeBlock => ({
  id: row.id,
  type: row.type as BlockType,
  order_index: row.order_index,
  data: row.data as unknown as BlockData,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const getDefaultBlockData = (type: BlockType): BlockData => {
  switch (type) {
    case 'banner':
      return {
        imageUrl: '',
        link: '',
        height: '400px',
        openInNewTab: false
      };
    case 'courses':
      return {
        title: 'Cursos',
        filterType: 'all',
        categoryId: null,
        courseId: null,
        layout: 'grid',
        itemsPerRow: 3,
        limit: null
      };
    case 'text':
      return {
        title: 'Título',
        subtitle: '',
        alignment: 'center'
      };
    case 'button':
      return {
        text: 'Clique aqui',
        link: '',
        color: '#4ade80',
        size: 'medium'
      };
    case 'video':
      return {
        url: '',
        height: '400px'
      };
    case 'divider':
      return {
        spacing: '40px'
      };
    default:
      return {} as BlockData;
  }
};

export function useHomeBlocks() {
  return useQuery({
    queryKey: ['home-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_blocks')
        .select('*')
        .order('order_index');

      if (error) throw error;
      return (data || []).map(transformBlock);
    },
  });
}

export function useCreateHomeBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, orderIndex }: { type: BlockType; orderIndex: number }) => {
      const defaultData = getDefaultBlockData(type);

      const { data, error } = await supabase
        .from('home_blocks')
        .insert({
          type,
          order_index: orderIndex,
          data: defaultData as unknown as Json
        })
        .select()
        .single();

      if (error) throw error;
      return transformBlock(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-blocks'] });
      toast({ title: 'Bloco adicionado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar bloco', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateHomeBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlockData }) => {
      const { error } = await supabase
        .from('home_blocks')
        .update({ data: data as unknown as Json })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-blocks'] });
      toast({ title: 'Bloco atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar bloco', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBlocksOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blocks: HomeBlock[]) => {
      const updates = blocks.map((block, index) =>
        supabase
          .from('home_blocks')
          .update({ order_index: index })
          .eq('id', block.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-blocks'] });
    },
  });
}

export function useDuplicateHomeBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (block: HomeBlock) => {
      // Get current max order
      const { data: blocks } = await supabase
        .from('home_blocks')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = blocks && blocks.length > 0 ? blocks[0].order_index : 0;

      const { data, error } = await supabase
        .from('home_blocks')
        .insert({
          type: block.type,
          order_index: maxOrder + 1,
          data: block.data as unknown as Json
        })
        .select()
        .single();

      if (error) throw error;
      return transformBlock(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-blocks'] });
      toast({ title: 'Bloco duplicado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao duplicar bloco', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteHomeBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('home_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-blocks'] });
      toast({ title: 'Bloco removido!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover bloco', description: error.message, variant: 'destructive' });
    },
  });
}
