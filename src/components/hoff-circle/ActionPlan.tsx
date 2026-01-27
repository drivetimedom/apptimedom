import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, STORAGE_KEYS, getFromStorage } from '@/lib/storage';
import { 
  MapPin, 
  Lock, 
  CheckCircle, 
  Circle,
  Target,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  requiredProgress?: number; // % of previous challenge needed to unlock
  order: number;
}

const defaultChallenges: Challenge[] = [
  { id: 'challenge-1', title: 'Primeiros 30 Leads', description: 'Gere seus primeiros 30 leads qualificados', order: 1 },
  { id: 'challenge-2', title: 'Setup Business Manager', description: 'Configure seu gerenciador de anúncios', order: 2 },
  { id: 'challenge-3', title: 'Primeira Campanha', description: 'Lance sua primeira campanha de tráfego', order: 3, requiredProgress: 50 },
  { id: 'challenge-4', title: 'Escala R$ 1.000/dia', description: 'Alcance investimento diário de R$ 1.000', order: 4, requiredProgress: 100 },
  { id: 'challenge-5', title: 'Time de Vendas', description: 'Monte sua equipe comercial', order: 5, requiredProgress: 100 },
  { id: 'challenge-6', title: 'Meta 10K', description: 'Atinja R$ 10.000 de faturamento mensal', order: 6, requiredProgress: 100 },
];

const ActionPlan: React.FC = () => {
  const { user } = useAuth();
  
  // Get user's challenge progress from storage
  const getChallengeProgress = (challengeId: string): number => {
    if (!user) return 0;
    const key = `challenge-progress-${user.id}`;
    const progress = getFromStorage<Record<string, number>>(key as any, {});
    return progress[challengeId] || 0;
  };

  const isChallengeLocked = (challenge: Challenge, index: number): boolean => {
    if (index === 0 || index === 1) return false; // First two always visible
    
    const prevChallenge = defaultChallenges[index - 1];
    const prevProgress = getChallengeProgress(prevChallenge.id);
    const requiredProgress = challenge.requiredProgress || 100;
    
    return prevProgress < requiredProgress;
  };

  const getChallengeStatus = (challenge: Challenge): 'completed' | 'current' | 'locked' | 'available' => {
    const progress = getChallengeProgress(challenge.id);
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'current';
    
    const index = defaultChallenges.findIndex(c => c.id === challenge.id);
    if (isChallengeLocked(challenge, index)) return 'locked';
    
    return 'available';
  };

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
          🗺️ MAPA 10K - Sua jornada para o sucesso
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {defaultChallenges.map((challenge, index) => {
            const status = getChallengeStatus(challenge);
            const isLocked = status === 'locked';
            const progress = getChallengeProgress(challenge.id);

            return (
              <div
                key={challenge.id}
                className={cn(
                  "relative flex items-start gap-3 p-3 rounded-lg border transition-all",
                  status === 'completed' && "bg-accent/10 border-accent/30",
                  status === 'current' && "bg-primary/10 border-primary/30",
                  status === 'available' && "bg-card border-border hover:border-muted-foreground",
                  status === 'locked' && "bg-muted/30 border-muted opacity-60"
                )}
              >
                {/* Connection line */}
                {index < defaultChallenges.length - 1 && (
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
                  {status === 'available' && <MapPin className="w-4 h-4" />}
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
