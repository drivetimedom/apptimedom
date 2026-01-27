import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Progress, STORAGE_KEYS, getFromStorage, Course, Lesson } from '@/lib/storage';
import { 
  MapPin, 
  Lock, 
  CheckCircle, 
  Circle,
  Target,
  Flag,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  requiredProgress?: number;
  order: number;
  courseId?: string; // Link to actual course/challenge
}

const allChallenges: Challenge[] = [
  { id: 'desafio-1', title: 'Primeiros 30 Leads', description: 'Gere seus primeiros 30 leads qualificados', order: 1 },
  { id: 'desafio-2', title: 'Setup Business Manager', description: 'Configure seu gerenciador de anúncios', order: 2 },
  { id: 'desafio-3', title: 'Estruturar Kanban', description: 'Organize seu funil de vendas', order: 3, requiredProgress: 50 },
  { id: 'desafio-4', title: 'Primeira Campanha', description: 'Lance sua primeira campanha de tráfego', order: 4, requiredProgress: 100 },
  { id: 'desafio-5', title: 'Escala R$ 1.000/dia', description: 'Alcance investimento diário de R$ 1.000', order: 5, requiredProgress: 100 },
  { id: 'desafio-6', title: 'Meta 10K', description: 'Atinja R$ 10.000 de faturamento mensal', order: 6, requiredProgress: 100 },
];

const mapLabels: Record<string, string> = {
  'mapa-10k': 'MAPA 10K',
  'mapa-30k': 'MAPA 30K',
  'mapa-50k': 'MAPA 50K',
  'mapa-100k': 'MAPA 100K',
};

const ActionPlan: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get full user data from storage
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  const fullUser = users.find(u => u.id === user?.id);
  const courses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  
  // Get visible challenges from user prescription
  const visibleChallengeIds = fullUser?.visibleChallenges || [];
  const prescribedMap = fullUser?.prescribedMap || '';
  
  // Filter challenges based on what admin prescribed
  const visibleChallenges = visibleChallengeIds.length > 0 
    ? allChallenges.filter(c => visibleChallengeIds.includes(c.id))
    : allChallenges.slice(0, 2); // Default: show first 2 challenges
  
  // Get user's challenge progress from storage
  const getChallengeProgress = (challengeId: string): number => {
    if (!user) return 0;
    const key = `challenge-progress-${user.id}`;
    const progress = getFromStorage<Record<string, number>>(key as any, {});
    return progress[challengeId] || 0;
  };

  const isChallengeLocked = (challenge: Challenge, index: number): boolean => {
    if (index === 0) return false; // First always visible
    
    const prevChallenge = visibleChallenges[index - 1];
    if (!prevChallenge) return false;
    
    const prevProgress = getChallengeProgress(prevChallenge.id);
    const requiredProgress = challenge.requiredProgress || 100;
    
    return prevProgress < requiredProgress;
  };

  const getChallengeStatus = (challenge: Challenge, index: number): 'completed' | 'current' | 'locked' | 'available' => {
    const progress = getChallengeProgress(challenge.id);
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'current';
    
    if (isChallengeLocked(challenge, index)) return 'locked';
    
    return 'available';
  };

  // Handle clicking on a challenge - go directly to first lesson if it's a "desafio" type course
  const handleChallengeClick = (challenge: Challenge) => {
    // Find matching course
    const matchingCourse = courses.find(c => 
      c.courseType === 'desafio' && 
      (c.title.toLowerCase().includes(challenge.title.toLowerCase()) || 
       c.id === challenge.courseId)
    );

    if (matchingCourse) {
      // Get first lesson
      const firstModule = matchingCourse.modules[0];
      if (firstModule && firstModule.lessonIds.length > 0) {
        const lessons = getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
        const firstLessonId = firstModule.lessonIds[0];
        const firstLesson = lessons.find(l => l.id === firstLessonId);
        
        if (firstLesson) {
          navigate(`/course/${matchingCourse.id}/lesson/${firstLesson.id}`);
          return;
        }
      }
      // Fallback to course page
      navigate(`/course/${matchingCourse.id}`);
    }
  };

  if (visibleChallenges.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Target className="w-5 h-5 text-accent" />
          </div>
          Plano de Ação
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          🗺️ {prescribedMap ? mapLabels[prescribedMap] : 'MAPA 10K'} - Sua jornada para o sucesso
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleChallenges.map((challenge, index) => {
            const status = getChallengeStatus(challenge, index);
            const isLocked = status === 'locked';
            const progress = getChallengeProgress(challenge.id);
            const isClickable = !isLocked && status !== 'completed';

            return (
              <div
                key={challenge.id}
                onClick={() => isClickable && handleChallengeClick(challenge)}
                className={cn(
                  "relative flex items-start gap-3 p-3 rounded-lg border transition-all",
                  status === 'completed' && "bg-accent/10 border-accent/30",
                  status === 'current' && "bg-primary/10 border-primary/30",
                  status === 'available' && "bg-card border-border hover:border-muted-foreground cursor-pointer",
                  status === 'locked' && "bg-muted/30 border-muted opacity-60",
                  isClickable && "cursor-pointer hover:scale-[1.01]"
                )}
              >
                {/* Connection line */}
                {index < visibleChallenges.length - 1 && (
                  <div className={cn(
                    "absolute left-[22px] top-12 w-0.5 h-6",
                    status === 'completed' ? "bg-accent" : "bg-border"
                  )} />
                )}

                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  status === 'completed' && "bg-accent text-accent-foreground",
                  status === 'current' && "bg-primary text-primary-foreground",
                  status === 'available' && "bg-muted text-muted-foreground",
                  status === 'locked' && "bg-muted text-muted-foreground"
                )}>
                  {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {status === 'current' && <Flag className="w-4 h-4" />}
                  {status === 'available' && <Play className="w-4 h-4" />}
                  {status === 'locked' && <Lock className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Desafio {challenge.order}
                    </span>
                    {isLocked && (
                      <span className="text-xs text-muted-foreground">(bloqueado)</span>
                    )}
                  </div>
                  <p className={cn(
                    "font-medium",
                    isLocked ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {isLocked ? '???' : challenge.title}
                  </p>
                  {!isLocked && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {challenge.description}
                    </p>
                  )}
                  
                  {/* Progress bar for current challenge */}
                  {status === 'current' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionPlan;
