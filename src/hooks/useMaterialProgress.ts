import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useCallback } from 'react';

export function useMaterialProgress(courseId: string | undefined, moduleId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['material-progress', user?.id, courseId, moduleId],
    queryFn: async () => {
      if (!user?.id || !courseId || !moduleId) return null;
      const { data, error } = await supabase
        .from('module_material_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!courseId && !!moduleId,
  });
}

export function useSaveMaterialProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const mutation = useMutation({
    mutationFn: async ({ courseId, moduleId, progressData }: { courseId: string; moduleId: string; progressData: Record<string, any> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('module_material_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            module_id: moduleId,
            progress_data: progressData,
          },
          { onConflict: 'user_id,course_id,module_id' }
        );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['material-progress', user?.id, vars.courseId, vars.moduleId] });
    },
  });

  const debouncedSave = useCallback(
    (params: { courseId: string; moduleId: string; progressData: Record<string, any> }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        mutation.mutate(params);
      }, 1000);
    },
    [mutation]
  );

  return { save: debouncedSave, isSaving: mutation.isPending };
}
