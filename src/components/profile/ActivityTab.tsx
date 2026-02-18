import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 15;

function formatActivity(action: string, details: any) {
  const d = typeof details === 'string' ? (() => { try { return JSON.parse(details); } catch { return {}; } })() : (details || {});

  switch (action) {
    case 'login':
      return { icon: '🔑', title: 'Fez login', description: '' };
    case 'lesson_watched':
      return { icon: '▶️', title: 'Assistiu aula', description: [d.lessonTitle, d.courseTitle].filter(Boolean).join(' — ') };
    case 'lesson_completed':
      return { icon: '✅', title: 'Concluiu aula', description: [d.lessonTitle, d.courseTitle].filter(Boolean).join(' — ') };
    case 'course_enrolled':
      return { icon: '📚', title: 'Matriculou-se em curso', description: d.courseTitle || '' };
    case 'course_completed':
      return { icon: '🏆', title: 'Concluiu curso', description: d.courseTitle || '' };
    case 'certificate_issued':
      return { icon: '🎓', title: 'Certificado emitido', description: d.courseTitle || '' };
    case 'profile_updated':
      return { icon: '✏️', title: 'Atualizou perfil', description: '' };
    case 'password_changed':
      return { icon: '🔒', title: 'Alterou senha', description: '' };
    case 'comment_added':
      return { icon: '💬', title: 'Comentou', description: d.lessonTitle || '' };
    case 'activation_task_completed':
      return { icon: '🚀', title: 'Concluiu tarefa de implementação', description: d.taskText || '' };
    default:
      return { icon: '📌', title: action.replace(/_/g, ' '), description: '' };
  }
}

const ActivityTab: React.FC = () => {
  const { user } = useAuth();
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['my-activities', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // fetch one extra to know if there's more
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const hasMore = (activities?.length || 0) > limit;
  const displayedActivities = (activities || []).slice(0, limit);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  if (!displayedActivities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Activity className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Sem atividades</h3>
        <p className="text-sm text-muted-foreground">Suas atividades aparecerão aqui conforme você usar a plataforma.</p>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-0">
            {displayedActivities.map((activity: any) => {
              const formatted = formatActivity(activity.action, activity.details);
              const date = new Date(activity.created_at);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div key={activity.id} className="relative flex items-start gap-4 py-3 pl-1">
                  <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-card border border-border text-sm">
                    {formatted.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{formatted.title}</p>
                    {formatted.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {formatted.description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {isToday ? 'Hoje' : date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="sm" onClick={() => setLimit(l => l + PAGE_SIZE)}>
              <ChevronDown className="w-4 h-4 mr-2" />
              Carregar mais
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
