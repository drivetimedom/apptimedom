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
    lastActivity: lastActivity.data,
    isLoading: enrollments.isLoading || completions.isLoading || certificates.isLoading || lastActivity.isLoading,
  };
}

const EducationalDataSection: React.FC<EducationalDataSectionProps> = ({ userId, studentName }) => {
  const { enrollments, completions, certificates, lastActivity, isLoading } = useEducationalData(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando dados educacionais...</span>
      </div>
    );
  }

  const totalEnrollments = enrollments.length;
  const totalCompletions = completions.length;
  const averageProgress = totalEnrollments > 0
    ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) / totalEnrollments)
    : 0;
  const totalCertificates = certificates.length;

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
              <p className="text-xs text-muted-foreground">Matriculados</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalEnrollments}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCompletions}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-xs text-muted-foreground">Progresso Médio</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{averageProgress}%</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Certificados</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCertificates}</p>
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
          <span>{lastActivity.action}</span>
        </div>
      )}

      {/* Enrolled Courses List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Cursos Matriculados ({totalEnrollments})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum curso matriculado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment: any) => {
                const isCompleted = completions.some((c: any) => c.course_id === enrollment.course_id);

                return (
                  <div key={enrollment.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                    {enrollment.courses?.thumbnail && (
                      <img
                        src={enrollment.courses.thumbnail}
                        alt={enrollment.courses?.title}
                        className="w-16 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {enrollment.courses?.title || 'Curso'}
                        </span>
                        {isCompleted && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-success text-success-foreground">
                            <CheckCircle className="w-3 h-3 mr-0.5" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={enrollment.progress_percentage || 0} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {enrollment.progress_percentage || 0}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span>Matrícula: {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}</span>
                        {enrollment.last_accessed_at && (
                          <span>Último acesso: {new Date(enrollment.last_accessed_at).toLocaleDateString('pt-BR')}</span>
                        )}
                        {enrollment.completed_at && (
                          <span>Concluído: {new Date(enrollment.completed_at).toLocaleDateString('pt-BR')}</span>
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

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Certificados Emitidos ({totalCertificates})
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
