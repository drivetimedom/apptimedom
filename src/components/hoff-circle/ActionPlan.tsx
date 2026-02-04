import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHofMaps } from '@/hooks/useHofMaps';
import { useHofChallenges } from '@/hooks/useHofChallenges';
import { getFromStorage } from '@/lib/storage';
import { 
  Target,
  Lock,
  CheckCircle,
  Play,
  Trophy,
  Clock,
  Video,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PlaylistPlayerModal from './PlaylistPlayerModal';

// Types for Videos
interface MapVideo {
  id: string;
  title: string;
  vimeoId: string;
  duration: number;
  order: number;
}

const ActionPlan: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: allMaps = [], isLoading: mapsLoading } = useHofMaps();
  const { data: allChallenges = [], isLoading: challengesLoading } = useHofChallenges();
  
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerData, setPlayerData] = useState<{
    title: string;
    icon: string;
    videos: MapVideo[];
    type: 'map' | 'challenge';
  } | null>(null);
  
  // Get prescribed map ID and visible challenge IDs from profile (Supabase)
  const prescribedMapId = profile?.prescribed_map || '';
  const visibleChallengeIds = profile?.visible_challenges || [];
  
  // Find the prescribed map
  const prescribedMap = allMaps.find(m => m.id === prescribedMapId);
  
  // Filter challenges based on what admin prescribed
  const visibleChallenges = visibleChallengeIds.length > 0
    ? allChallenges.filter(c => visibleChallengeIds.includes(c.id))
    : [];
  
  // Get user's progress for challenges from localStorage (can be migrated later)
  const getChallengeProgress = (challengeId: string): number => {
    if (!user) return 0;
    const key = `challenge-progress-${user.id}`;
    const progress = getFromStorage<Record<string, number>>(key as any, {});
    return progress[challengeId] || 0;
  };

  const getChallengeStatus = (challengeId: string, index: number): 'completed' | 'current' | 'locked' | 'available' => {
    const progress = getChallengeProgress(challengeId);
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'current';
    
    // First challenge is always available
    if (index === 0) return 'available';
    
    // Check if previous challenge is completed
    const prevChallenge = visibleChallenges[index - 1];
    if (prevChallenge) {
      const prevProgress = getChallengeProgress(prevChallenge.id);
      if (prevProgress < 100) return 'locked';
    }
    
    return 'available';
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const openMapPlayer = () => {
    if (prescribedMap) {
      setPlayerData({
        title: prescribedMap.name,
        icon: prescribedMap.icon,
        videos: prescribedMap.videos as MapVideo[],
        type: 'map',
      });
      setPlayerOpen(true);
    }
  };

  const openChallengePlayer = (challenge: typeof allChallenges[0]) => {
    setPlayerData({
      title: challenge.name,
      icon: challenge.icon,
      videos: challenge.videos as MapVideo[],
      type: 'challenge',
    });
    setPlayerOpen(true);
  };

  const isLoading = mapsLoading || challengesLoading;

  // Show loading state
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            Plano de Ação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no map or challenges prescribed
  if (!prescribedMap && visibleChallenges.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            Plano de Ação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum mapa ou desafio prescrito ainda.<br />
            Entre em contato com o administrador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            Plano de Ação
          </CardTitle>
          {prescribedMap && (
            <p className="text-sm text-muted-foreground mt-1">
              {prescribedMap.icon} {prescribedMap.name} - Sua jornada para o sucesso
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prescribed Map */}
          {prescribedMap && (
            <div className="space-y-3">
              <div 
                className="bg-primary/10 border border-primary/30 rounded-lg p-4 cursor-pointer hover:bg-primary/20 transition-all hover:scale-[1.01]"
                onClick={openMapPlayer}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                    {prescribedMap.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {prescribedMap.name}
                    </h4>
                    {prescribedMap.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {prescribedMap.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {(prescribedMap.videos as MapVideo[]).length} vídeos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(prescribedMap.total_duration)}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Assistir
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Challenges */}
          {visibleChallenges.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning" />
                Desafios
              </h4>

              <div className="space-y-2">
                {visibleChallenges.map((challenge, index) => {
                  const status = getChallengeStatus(challenge.id, index);
                  const isLocked = status === 'locked';
                  const progress = getChallengeProgress(challenge.id);
                  const isClickable = !isLocked;
                  const videos = challenge.videos as MapVideo[];

                  return (
                    <div
                      key={challenge.id}
                      onClick={() => isClickable && openChallengePlayer(challenge)}
                      className={cn(
                        "relative flex items-start gap-3 p-3 rounded-lg border transition-all",
                        status === 'completed' && "bg-accent/10 border-accent/30",
                        status === 'current' && "bg-warning/10 border-warning/30",
                        status === 'available' && "bg-card border-border hover:border-warning/50 cursor-pointer",
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
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                        status === 'completed' && "bg-accent text-accent-foreground",
                        status === 'current' && "bg-warning text-warning-foreground",
                        status === 'available' && "bg-muted text-muted-foreground",
                        status === 'locked' && "bg-muted text-muted-foreground"
                      )}>
                        {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        {status === 'current' && challenge.icon}
                        {status === 'available' && <Play className="w-4 h-4" />}
                        {status === 'locked' && <Lock className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Desafio {index + 1}
                          </span>
                          {isLocked && (
                            <span className="text-xs text-muted-foreground">(bloqueado)</span>
                          )}
                        </div>
                        <p className={cn(
                          "font-medium",
                          isLocked ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {isLocked ? '???' : challenge.name}
                        </p>
                        {!isLocked && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {videos.length} vídeos
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(challenge.total_duration)}
                            </span>
                          </div>
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
                                className="h-full bg-warning rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isClickable && status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant={status === 'current' ? 'default' : 'outline'}
                          className="gap-1 text-xs"
                        >
                          <Play className="w-3 h-3" />
                          {status === 'current' ? 'Continuar' : 'Iniciar'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playlist Player Modal */}
      {playerData && (
        <PlaylistPlayerModal
          isOpen={playerOpen}
          onClose={() => setPlayerOpen(false)}
          title={playerData.title}
          icon={playerData.icon}
          videos={playerData.videos}
          type={playerData.type}
        />
      )}
    </>
  );
};

export default ActionPlan;
