import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface PrescribedLessonsSectionProps {
  userId: string;
}

const PrescribedLessonsSection: React.FC<PrescribedLessonsSectionProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch prescribed lessons
  const { data: prescribedLessons = [], isLoading: loadingPrescribed } = useQuery({
    queryKey: ['prescribed-lessons', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_prescriptions')
        .select('id, created_at, lesson_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch lesson details separately
      if (!data || data.length === 0) return [];
      
      const lessonIds = data.map(d => d.lesson_id);
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, duration, vimeo_id, course_id')
        .in('id', lessonIds);

      // Fetch course titles
      const courseIds = [...new Set((lessons || []).map(l => l.course_id).filter(Boolean))];
      const { data: courses } = courseIds.length > 0
        ? await supabase.from('courses').select('id, title').in('id', courseIds)
        : { data: [] };

      return data.map(prescription => {
        const lesson = lessons?.find(l => l.id === prescription.lesson_id);
        const course = courses?.find(c => c.id === lesson?.course_id);
        return {
          ...prescription,
          lesson,
          courseName: course?.title || 'Curso',
        };
      });
    },
    enabled: !!userId,
  });

  // Search available lessons
  const { data: availableLessons = [], isLoading: loadingSearch } = useQuery({
    queryKey: ['available-lessons-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, duration, vimeo_id, course_id')
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      
      // Fetch course titles
      const courseIds = [...new Set((data || []).map(l => l.course_id).filter(Boolean))];
      const { data: courses } = courseIds.length > 0
        ? await supabase.from('courses').select('id, title').in('id', courseIds)
        : { data: [] };

      return (data || []).map(lesson => ({
        ...lesson,
        courseName: courses?.find(c => c.id === lesson.course_id)?.title || 'Curso',
      }));
    },
    enabled: searchQuery.length >= 2,
  });

  // Add prescription
  const addLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Check if already prescribed
      const { data: existing } = await supabase
        .from('lesson_prescriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) throw new Error('Esta aula já foi prescrita');

      const { error } = await supabase
        .from('lesson_prescriptions')
        .insert({ user_id: userId, lesson_id: lessonId, prescribed_by: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescribed-lessons', userId] });
      toast({ title: 'Aula adicionada com sucesso!' });
      setShowSearch(false);
      setSearchQuery('');
    },
    onError: (error: any) => {
      toast({ title: error.message || 'Erro ao adicionar aula', variant: 'destructive' });
    },
  });

  // Remove prescription
  const removeLesson = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const { error } = await supabase
        .from('lesson_prescriptions')
        .delete()
        .eq('id', prescriptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescribed-lessons', userId] });
      toast({ title: 'Aula removida' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover aula', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">⭐ Aulas Extras</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Adicionar Aula
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Prescreva aulas específicas para este aluno
      </p>

      {/* Search */}
      {showSearch && (
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aula por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {searchQuery.length >= 2 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {loadingSearch ? (
                <p className="text-sm text-muted-foreground p-2">Buscando...</p>
              ) : availableLessons.length > 0 ? (
                availableLessons.map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.courseName} {lesson.duration && `• ${lesson.duration}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addLesson.mutate(lesson.id)}
                      disabled={addLesson.isPending}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">Nenhuma aula encontrada</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Prescribed lessons list */}
      <div className="space-y-2">
        {loadingPrescribed ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : prescribedLessons.length > 0 ? (
          prescribedLessons.map((prescription: any) => (
            <div key={prescription.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {prescription.lesson?.title || 'Aula não encontrada'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {prescription.courseName} {prescription.lesson?.duration && `• ${prescription.lesson.duration}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Prescrito em: {new Date(prescription.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLesson.mutate(prescription.id)}
                disabled={removeLesson.isPending}
                className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg text-center">
            Nenhuma aula prescrita ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default PrescribedLessonsSection;
