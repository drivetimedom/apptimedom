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
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs to avoid stale closures without adding to deps
  const userIdRef = useRef(userId);
  const lessonIdRef = useRef(lessonId);
  const onCompletedRef = useRef(onCompleted);
  userIdRef.current = userId;
  lessonIdRef.current = lessonId;
  onCompletedRef.current = onCompleted;

  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    const uid = userIdRef.current;
    const lid = lessonIdRef.current;
    if (!uid || !lid || isSavingRef.current || duration === 0) return;

    isSavingRef.current = true;
    console.log('💾 Saving progress:', Math.floor(currentTime), '/', Math.floor(duration));

    try {
      const completed = currentTime >= duration * 0.9;

      await supabase
        .from('lesson_watch_progress')
        .upsert({
          user_id: uid,
          lesson_id: lid,
          watched_seconds: Math.floor(currentTime),
          total_duration: Math.floor(duration),
          completed,
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });

      if (completed && onCompletedRef.current) {
        onCompletedRef.current();
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, []); // stable — reads from refs

  useEffect(() => {
    if (!vimeoId || !lessonId || !userId) return;

    // Clear any pending debounce
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    if (isInitializedRef.current) {
      console.log('⚠️ Player already initialized, skipping');
      return;
    }

    // Debounce initialization by 100ms to avoid rapid mount/unmount cycles
    initTimeoutRef.current = setTimeout(() => {
      if (!iframeRef.current || isInitializedRef.current) return;

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
        } catch {
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
    }, 100);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

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
  }, [vimeoId, lessonId, userId]); // iframeRef and saveProgress removed — stable via refs
};
