import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useModuleMaterial(courseId: string | undefined, moduleId: string | undefined) {
  return useQuery({
    queryKey: ['module-material', courseId, moduleId],
    queryFn: async () => {
      if (!courseId || !moduleId) return null;
      const { data, error } = await supabase
        .from('module_materials')
        .select('*')
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!moduleId,
  });
}

export function useSaveModuleMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, moduleId, content }: { courseId: string; moduleId: string; content: any }) => {
      const { data, error } = await supabase
        .from('module_materials')
        .upsert(
          {
            course_id: courseId,
            module_id: moduleId,
            content,
            created_by: user?.id,
          },
          { onConflict: 'course_id,module_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['module-material', vars.courseId, vars.moduleId] });
      toast({ title: 'Material salvo com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao salvar material', description: error.message, variant: 'destructive' });
    },
  });
}
