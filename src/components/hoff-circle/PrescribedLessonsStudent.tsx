import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnershipIds } from '@/hooks/usePartnerships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Play, Clock, X } from 'lucide-react';

const PrescribedLessonsStudent: React.FC = () => {
  const { user } = useAuth();
  const { data: partnerIds } = usePartnershipIds(user?.id);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['my-prescribed-lessons', user?.id, partnerIds],
    queryFn: async () => {
      if (!user?.id || !partnerIds) return [];
      const { data, error } = await supabase
        .from('lesson_prescriptions')
        .select('id, lesson_id')
        .in('user_id', partnerIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const lessonIds = data.map(d => d.lesson_id);
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, duration, vimeo_id, course_id')
        .in('id', lessonIds);

      const courseIds = [...new Set((lessons || []).map(l => l.course_id).filter(Boolean))];
      const { data: courses } = courseIds.length > 0
        ? await supabase.from('courses').select('id, title').in('id', courseIds)
        : { data: [] };

      return data.map(p => {
        const lesson = lessons?.find(l => l.id === p.lesson_id);
        const course = courses?.find(c => c.id === lesson?.course_id);
        return { ...p, lesson, courseName: course?.title || 'Curso' };
      }).filter(p => p.lesson);
    },
    enabled: !!user?.id && !!partnerIds,
  });

  if (isLoading || prescriptions.length === 0) return null;

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Star className="w-5 h-5 text-accent" />
            </div>
            Aulas Extras
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aulas recomendadas especialmente para você
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {prescriptions.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedLesson(p.lesson)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.lesson.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {p.courseName}
                  {p.lesson.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.lesson.duration}
                    </span>
                  )}
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                <Play className="w-3 h-3" />
                Assistir
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vimeo Player Modal */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="bg-card border-border max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-foreground">{selectedLesson?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-b-lg overflow-hidden">
            {selectedLesson?.vimeo_id && (
              <iframe
                src={`https://player.vimeo.com/video/${selectedLesson.vimeo_id}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescribedLessonsStudent;
