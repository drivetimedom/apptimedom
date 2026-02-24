import React, { useState, useEffect, useCallback } from 'react';
import { getLucideIcon } from '@/lib/iconMap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, X, Play, Check, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChallengeProgress, useUpdateChallengeProgress } from '@/hooks/useChallengeProgress';

interface VideoResource {
  title: string;
  url: string;
}

interface PlaylistVideo {
  id: string;
  title: string;
  vimeoId: string;
  duration: number;
  order: number;
  resources?: VideoResource[];
}

interface PlaylistPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  videos: PlaylistVideo[];
  type: 'map' | 'challenge';
  challengeId?: string;
}

const PlaylistPlayerModal: React.FC<PlaylistPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  videos,
  type,
  challengeId,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const { data: progressList = [] } = useChallengeProgress();
  const updateProgress = useUpdateChallengeProgress();

  // Load existing watched videos from Supabase for challenges
  useEffect(() => {
    if (type === 'challenge' && challengeId && isOpen) {
      const existing = progressList.find(p => p.challenge_id === challengeId);
      if (existing?.watched_videos?.length) {
        setWatchedVideos(new Set(existing.watched_videos));
      }
    }
  }, [type, challengeId, isOpen, progressList]);

  // Save progress to Supabase when watched videos change
  const saveProgress = useCallback((newWatched: Set<string>) => {
    if (type !== 'challenge' || !challengeId || newWatched.size === 0) return;
    const totalVideos = videos.length;
    const progress = Math.round((newWatched.size / totalVideos) * 100);
    updateProgress.mutate({
      challengeId,
      progress,
      watchedVideos: Array.from(newWatched),
    });
  }, [type, challengeId, videos.length, updateProgress]);

  const currentVideo = videos[currentVideoIndex];

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);

  const markAsWatched = (videoId: string) => {
    setWatchedVideos(prev => {
      const newSet = new Set([...prev, videoId]);
      saveProgress(newSet);
      return newSet;
    });
  };

  const goToNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      markAsWatched(currentVideo.id);
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const selectVideo = (index: number) => {
    if (currentVideo) {
      markAsWatched(currentVideo.id);
    }
    setCurrentVideoIndex(index);
  };

  if (!currentVideo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground flex items-center gap-3">
            {(() => {
              const IconComp = getLucideIcon(icon);
              return IconComp ? <IconComp className="w-6 h-6 text-primary" /> : <span className="text-2xl">{icon}</span>;
            })()}
            <div>
              <p className="text-lg font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground font-normal">
                {videos.length} vídeos • {formatDuration(totalDuration)}
              </p>
            </div>
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content - Video Player */}
          <div className="flex-1 flex flex-col">
            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${currentVideo.vimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={currentVideo.title}
              />
            </div>

            {/* Current Video Info */}
            <div className="p-4 border-b border-border bg-card">
              <h3 className="text-foreground font-semibold text-lg">
                {currentVideoIndex + 1}. {currentVideo.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentVideo.duration} minutos
              </p>
              {/* Per-video resources */}
              {currentVideo.resources && currentVideo.resources.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Materiais de Apoio
                  </p>
                  {currentVideo.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {res.title || res.url}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentVideoIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <span className="text-muted-foreground text-sm">
                {currentVideoIndex + 1} de {videos.length}
              </span>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentVideoIndex === videos.length - 1}
                className="gap-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Playlist */}
          <div className="w-80 border-l border-border bg-background flex flex-col">
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold text-foreground">📹 Playlist</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {watchedVideos.size}/{videos.length} assistidos
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {videos.map((video, index) => {
                  const isCurrentVideo = index === currentVideoIndex;
                  const isWatched = watchedVideos.has(video.id);

                  return (
                    <button
                      key={video.id}
                      onClick={() => selectVideo(index)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all flex items-start gap-3",
                        isCurrentVideo 
                          ? type === 'map' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-success text-success-foreground"
                          : isWatched
                            ? "bg-accent/20 text-foreground"
                            : "bg-card hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold",
                        isCurrentVideo 
                          ? "bg-white/20" 
                          : isWatched 
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted"
                      )}>
                        {isWatched && !isCurrentVideo ? (
                          <Check className="w-3 h-3" />
                        ) : isCurrentVideo ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm truncate",
                          isCurrentVideo ? "" : "text-foreground"
                        )}>
                          {video.title}
                        </p>
                        <p className={cn(
                          "text-xs mt-0.5",
                          isCurrentVideo ? "opacity-80" : "text-muted-foreground"
                        )}>
                          {video.duration} min
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistPlayerModal;
