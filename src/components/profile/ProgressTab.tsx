import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const ProgressTab: React.FC = () => {
  const { user } = useAuth();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, courses(id, title, thumbnail, total_duration)')
        .eq('user_id', user!.id)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: completions, isLoading: loadingCompletions } = useQuery({
    queryKey: ['my-completions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_completions')
        .select('*, courses(id, title, thumbnail)')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = loadingEnrollments || loadingCompletions;
  const completedIds = new Set((completions || []).map((c: any) => c.course_id));
  const inProgress = (enrollments || []).filter((e: any) => !completedIds.has(e.course_id));
  const totalEnrolled = enrollments?.length || 0;
  const totalCompleted = completions?.length || 0;
  const avgProgress = totalEnrolled > 0
    ? Math.round((enrollments || []).reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) / totalEnrolled)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="Matriculados" value={totalEnrolled} />
        <StatCard icon={<CheckCircle className="w-4 h-4 text-success" />} label="Concluídos" value={totalCompleted} />
        <StatCard icon={<TrendingUp className="w-4 h-4 text-info" />} label="Progresso Médio" value={`${avgProgress}%`} />
        <StatCard icon={<Clock className="w-4 h-4 text-warning" />} label="Em Andamento" value={inProgress.length} />
      </div>

      {/* In Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">📖 Em Andamento ({inProgress.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {inProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum curso em andamento</p>
          ) : (
            <div className="space-y-3">
              {inProgress.map((e: any) => (
                <CourseProgressItem key={e.id} enrollment={e} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      {totalCompleted > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">🏆 Concluídos ({totalCompleted})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(completions || []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  {c.courses?.thumbnail && (
                    <img src={c.courses.thumbnail} alt="" className="w-14 h-9 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.courses?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Concluído em {new Date(c.completed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30 text-[10px]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Concluído
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function CourseProgressItem({ enrollment }: { enrollment: any }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
      {enrollment.courses?.thumbnail && (
        <img src={enrollment.courses.thumbnail} alt="" className="w-14 h-9 rounded object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{enrollment.courses?.title || 'Curso'}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={enrollment.progress_percentage || 0} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground">{enrollment.progress_percentage || 0}%</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Último acesso: {enrollment.last_accessed_at ? new Date(enrollment.last_accessed_at).toLocaleDateString('pt-BR') : '—'}
        </p>
      </div>
    </div>
  );
}

export default ProgressTab;
