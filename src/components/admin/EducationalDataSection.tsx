import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Award, Activity, Loader2 } from 'lucide-react';

interface EducationalDataSectionProps {
  userId: string;
  studentName: string;
}

function useEducationalData(userId: string) {
  const enrollments = useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, courses(id, title, thumbnail)')
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const completions = useQuery({
    queryKey: ['completions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_completions')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const certificates = useQuery({
    queryKey: ['certificates', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, courses(title)')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const watchProgress = useQuery({
    queryKey: ['watch-progress', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_watch_progress')
        .select('*, lessons(id, title, course_id, courses(id, title, thumbnail))')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const lastActivity = useQuery({
    queryKey: ['last-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    enrollments: enrollments.data || [],
    completions: completions.data || [],
    certificates: certificates.data || [],
    watchProgress: watchProgress.data || [],
    lastActivity: lastActivity.data,
    isLoading: enrollments.isLoading || completions.isLoading || certificates.isLoading || lastActivity.isLoading || watchProgress.isLoading,
  };
}

const EducationalDataSection: React.FC<EducationalDataSectionProps> = ({ userId, studentName }) => {
  const { enrollments, completions, certificates, watchProgress, lastActivity, isLoading } = useEducationalData(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando dados educacionais...</span>
      </div>
    );
  }

  // Calculate watch time stats
  const totalWatchedSeconds = watchProgress.reduce((sum: number, p: any) => sum + (p.watched_seconds || 0), 0);
  const totalHours = Math.floor(totalWatchedSeconds / 3600);
  const totalMinutes = Math.floor((totalWatchedSeconds % 3600) / 60);
  const completedLessonsCount = watchProgress.filter((p: any) => p.completed).length;

  // Group watch progress by course
  const courseProgressMap: Record<string, { course: any; totalLessons: number; completedLessons: number; watchedSeconds: number }> = {};
  watchProgress.forEach((wp: any) => {
    const course = wp.lessons?.courses;
    if (course) {
      if (!courseProgressMap[course.id]) {
        courseProgressMap[course.id] = { course, totalLessons: 0, completedLessons: 0, watchedSeconds: 0 };
      }
      courseProgressMap[course.id].totalLessons++;
      if (wp.completed) courseProgressMap[course.id].completedLessons++;
      courseProgressMap[course.id].watchedSeconds += (wp.watched_seconds || 0);
    }
  });
  const coursesWithProgress = Object.values(courseProgressMap);

  return (
    <div className="space-y-4 mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">📚 Dados Educacionais</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Aulas Assistidas</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{watchProgress.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Aulas Concluídas</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{completedLessonsCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-xs text-muted-foreground">Tempo Assistido</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalHours}h{totalMinutes > 0 ? ` ${totalMinutes}m` : ''}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Certificados</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity */}
      {lastActivity && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
          <Activity className="w-4 h-4 text-primary" />
          <span>Última atividade:</span>
          <span className="font-medium text-foreground">
            {new Date(lastActivity.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
          <span>•</span>
          <span>{lastActivity.action.replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* Courses with Watch Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Cursos com Progresso ({coursesWithProgress.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesWithProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum progresso registrado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {coursesWithProgress.map((cp) => {
                const progressPct = cp.totalLessons > 0 ? Math.round((cp.completedLessons / cp.totalLessons) * 100) : 0;
                const hours = Math.floor(cp.watchedSeconds / 3600);
                const mins = Math.floor((cp.watchedSeconds % 3600) / 60);

                return (
                  <div key={cp.course.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                    {cp.course.thumbnail && (
                      <img
                        src={cp.course.thumbnail}
                        alt={cp.course.title}
                        className="w-16 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {cp.course.title}
                        </span>
                        {progressPct === 100 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-success text-success-foreground">
                            <CheckCircle className="w-3 h-3 mr-0.5" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={progressPct} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span>{cp.completedLessons}/{cp.totalLessons} aulas concluídas</span>
                        <span>Tempo: {hours > 0 ? `${hours}h ` : ''}{mins}min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Certificados Emitidos ({certificates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {certificates.map((cert: any) => (
                <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{cert.courses?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Emitido em: {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Nº {cert.certificate_number}</p>
                  </div>
                  {cert.certificate_url && (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver Certificado →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EducationalDataSection;
