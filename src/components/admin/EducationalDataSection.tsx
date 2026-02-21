import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Award, Activity, Loader2, Target, Map } from 'lucide-react';

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

  const challengeProgress = useQuery({
    queryKey: ['challenge-progress-admin', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*, hof_challenges(id, name, icon, videos, total_duration)')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const maps = useQuery({
    queryKey: ['hof-maps-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hof_maps').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const mapProgress = useQuery({
    queryKey: ['map-progress-admin', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('map_progress')
        .select('*, hof_maps(id, name, icon, videos, total_duration)')
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
    challengeProgress: challengeProgress.data || [],
    maps: maps.data || [],
    mapProgress: mapProgress.data || [],
    lastActivity: lastActivity.data,
    isLoading: enrollments.isLoading || completions.isLoading || certificates.isLoading || lastActivity.isLoading || watchProgress.isLoading || challengeProgress.isLoading || mapProgress.isLoading,
  };
}

const EducationalDataSection: React.FC<EducationalDataSectionProps> = ({ userId, studentName }) => {
  const { enrollments, completions, certificates, watchProgress, challengeProgress, maps, mapProgress, lastActivity, isLoading } = useEducationalData(userId);

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

      {/* Detailed Watched Lessons */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            📖 Aulas Assistidas ({watchProgress.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {watchProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma aula assistida ainda
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {[...watchProgress]
                .sort((a: any, b: any) => new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime())
                .map((wp: any) => {
                  const lesson = wp.lessons;
                  const course = lesson?.courses;
                  const watchedSec = wp.watched_seconds || 0;
                  const totalSec = wp.total_duration || 0;
                  const pct = totalSec > 0 ? Math.min(Math.round((watchedSec / totalSec) * 100), 100) : 0;
                  const completed = wp.completed || false;

                  const fmt = (s: number) => {
                    const h = Math.floor(s / 3600);
                    const m = Math.floor((s % 3600) / 60);
                    return h > 0 ? `${h}h ${m}min` : `${m}min`;
                  };

                  return (
                    <div key={wp.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex-shrink-0 mt-0.5">
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lesson?.title || 'Sem título'}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {course?.title || 'Curso não especificado'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                completed ? 'bg-success' : pct > 50 ? 'bg-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span>⏱️ {fmt(watchedSec)}{totalSec > 0 ? ` / ${fmt(totalSec)}` : ''}</span>
                          {wp.last_watched_at && (
                            <span>
                              🕐 {new Date(wp.last_watched_at).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(wp.last_watched_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Protocols (Challenges) Progress */}
      {challengeProgress.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              🎯 Protocolos ({challengeProgress.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challengeProgress.map((cp: any) => {
                const challenge = cp.hof_challenges;
                if (!challenge) return null;
                const videos = Array.isArray(challenge.videos) ? challenge.videos : [];
                const watchedCount = Array.isArray(cp.watched_videos) ? cp.watched_videos.length : 0;
                const totalCount = videos.length;
                const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : cp.progress || 0;

                return (
                  <div key={cp.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                    <span className="text-lg flex-shrink-0">{challenge.icon || '🎯'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{challenge.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {watchedCount}/{totalCount} vídeos assistidos
                      </p>
                    </div>
                    {pct === 100 && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-success text-success-foreground flex-shrink-0">
                        <CheckCircle className="w-3 h-3 mr-0.5" /> Concluído
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maps Progress */}
      {maps.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Map className="w-4 h-4 text-primary" />
              🗺️ Mapas ({maps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maps.map((m: any) => {
                const videos = Array.isArray(m.videos) ? m.videos : [];
                const userProgress = mapProgress.find((mp: any) => mp.map_id === m.id);
                const watchedCount = userProgress ? (Array.isArray(userProgress.watched_videos) ? userProgress.watched_videos.length : 0) : 0;
                const totalCount = videos.length;
                const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

                return (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                    <span className="text-lg flex-shrink-0">{m.icon || '🗺️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      {m.description && (
                        <p className="text-[11px] text-muted-foreground truncate">{m.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {watchedCount}/{totalCount} vídeos assistidos
                        {m.total_duration > 0 && ` • ${Math.floor(m.total_duration / 60)}min`}
                      </p>
                    </div>
                    {pct === 100 && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-success text-success-foreground flex-shrink-0">
                        <CheckCircle className="w-3 h-3 mr-0.5" /> Concluído
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
