import { useEffect, useRef, useCallback } from 'react';
import Player from '@vimeo/player';
import { supabase } from '@/integrations/supabase/client';

interface UseVimeoTrackingProps {
  vimeoId: string | null | undefined;
  lessonId: string;
  userId: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onCompleted?: () => void;
}

export const useVimeoTracking = ({
  vimeoId,
  lessonId,
  userId,
  iframeRef,
  onCompleted,
}: UseVimeoTrackingProps) => {
  const playerRef = useRef<Player | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSavingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!userId || !lessonId || isSavingRef.current || duration === 0) return;

    isSavingRef.current = true;
    console.log('💾 Saving progress:', Math.floor(currentTime), '/', Math.floor(duration));

    try {
      const completed = currentTime >= duration * 0.9;

      await supabase
        .from('lesson_watch_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          watched_seconds: Math.floor(currentTime),
          total_duration: Math.floor(duration),
          completed,
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });

      if (completed && onCompleted) {
        onCompleted();
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [userId, lessonId, onCompleted]);

  useEffect(() => {
    if (!vimeoId || !lessonId || !userId || !iframeRef.current) return;

    if (isInitializedRef.current) {
      console.log('⚠️ Player already initialized for lesson:', lessonId);
      return;
    }

    console.log('🎬 Initializing Vimeo player for lesson:', lessonId);
    isInitializedRef.current = true;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    let duration = 0;

    player.getDuration().then((d) => {
      duration = d;
      console.log('📏 Video duration:', duration);
    });

    const loadProgress = async () => {
      try {
        const { data } = await supabase
          .from('lesson_watch_progress')
          .select('watched_seconds')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (data && data.watched_seconds && data.watched_seconds > 10) {
          console.log('⏩ Resuming from:', data.watched_seconds);
          await player.setCurrentTime(data.watched_seconds);
        }
      } catch (error) {
        console.log('No saved progress found');
      }
    };

    player.ready().then(() => {
      console.log('✅ Vimeo player ready!');
      loadProgress();
    });

    player.on('timeupdate', (data: { seconds: number; duration: number }) => {
      if (data.duration) duration = data.duration;
    });

    player.on('pause', async () => {
      try {
        const currentTime = await player.getCurrentTime();
        saveProgress(currentTime, duration);
      } catch { /* ignore */ }
    });

    player.on('ended', () => {
      saveProgress(duration, duration);
    });

    saveIntervalRef.current = setInterval(async () => {
      try {
        const currentTime = await player.getCurrentTime();
        if (currentTime > 0 && duration > 0) {
          saveProgress(currentTime, duration);
        }
      } catch { /* ignore */ }
    }, 15000);

    return () => {
      console.log('🧹 Cleaning up Vimeo player for lesson:', lessonId);
      isInitializedRef.current = false;

      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
  }, [vimeoId, lessonId, userId, iframeRef, saveProgress]);
};
