import { useEffect, useRef, useCallback, useState } from 'react';
import Player from '@vimeo/player';
import { supabase } from '@/integrations/supabase/client';

interface UseVimeoTrackingProps {
  vimeoId: string | null | undefined;
  lessonId: string;
  userId: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onCompleted?: () => void;
}

export interface VimeoTrackingState {
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

// Guard timeout: if player doesn't become ready in 15s, treat as error
const READY_TIMEOUT_MS = 15_000;
// Debounce before actually initialising to absorb rapid mount/unmount
const INIT_DEBOUNCE_MS = 120;

export const useVimeoTracking = ({
  vimeoId,
  lessonId,
  userId,
  iframeRef,
  onCompleted,
}: UseVimeoTrackingProps): VimeoTrackingState => {
  const playerRef = useRef<Player | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSavingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Stable refs — updated every render but never trigger re-effects
  const userIdRef = useRef(userId);
  const lessonIdRef = useRef(lessonId);
  const onCompletedRef = useRef(onCompleted);
  userIdRef.current = userId;
  lessonIdRef.current = lessonId;
  onCompletedRef.current = onCompleted;

  // Player state exposed to consumers
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const retry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey(k => k + 1);
  }, []);

  // ─── Stable progress saver (reads IDs from refs, never in dep array) ────────
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
  }, []); // intentionally empty — reads everything from stable refs

  // ─── Cleanup helper ─────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (initTimeoutRef.current) { clearTimeout(initTimeoutRef.current); initTimeoutRef.current = null; }
    if (readyGuardRef.current)  { clearTimeout(readyGuardRef.current);  readyGuardRef.current  = null; }
    if (saveIntervalRef.current){ clearInterval(saveIntervalRef.current); saveIntervalRef.current = null; }
    if (playerRef.current)      { playerRef.current.destroy().catch(() => {}); playerRef.current = null; }
    isInitializedRef.current = false;
  }, []);

  // ─── Main effect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!vimeoId || !lessonId || !userId) return;

    // Reset UI state on lesson change
    setIsLoading(true);
    setHasError(false);

    // Cancel any in-flight debounce from a previous rapid update
    if (initTimeoutRef.current) { clearTimeout(initTimeoutRef.current); }

    if (isInitializedRef.current) {
      console.log('⚠️ Player already initialised, skipping');
      return;
    }

    // Debounce: absorb rapid mount/unmount (e.g. StrictMode double-invoke)
    initTimeoutRef.current = setTimeout(() => {
      if (!iframeRef.current || isInitializedRef.current) return;

      console.log('🎬 Initialising Vimeo player for lesson:', lessonId);
      isInitializedRef.current = true;

      let player: Player;
      try {
        player = new Player(iframeRef.current);
      } catch (err) {
        console.error('❌ Failed to create Vimeo Player instance:', err);
        setHasError(true);
        setIsLoading(false);
        isInitializedRef.current = false;
        return;
      }
      playerRef.current = player;

      let duration = 0;

      // Safety net: if ready() never fires within READY_TIMEOUT_MS → show error
      readyGuardRef.current = setTimeout(() => {
        if (isInitializedRef.current && isLoading) {
          console.warn('⏱ Vimeo player ready() timeout — showing error fallback');
          setHasError(true);
          setIsLoading(false);
        }
      }, READY_TIMEOUT_MS);

      player.ready()
        .then(async () => {
          console.log('✅ Vimeo player ready!');
          if (readyGuardRef.current) { clearTimeout(readyGuardRef.current); readyGuardRef.current = null; }
          setIsLoading(false);

          // Restore saved position
          try {
            const { data } = await supabase
              .from('lesson_watch_progress')
              .select('watched_seconds')
              .eq('user_id', userId)
              .eq('lesson_id', lessonId)
              .maybeSingle();

            if (data?.watched_seconds && data.watched_seconds > 10) {
              console.log('⏩ Resuming from:', data.watched_seconds);
              await player.setCurrentTime(data.watched_seconds);
            }
          } catch {
            // non-critical — ignore
          }

          // Get initial duration
          try { duration = await player.getDuration(); } catch { /* ignore */ }
          console.log('📏 Video duration:', duration);
        })
        .catch((err) => {
          console.error('❌ Vimeo player.ready() rejected:', err);
          if (readyGuardRef.current) { clearTimeout(readyGuardRef.current); readyGuardRef.current = null; }
          setHasError(true);
          setIsLoading(false);
        });

      player.on('timeupdate', (data: { seconds: number; duration: number }) => {
        if (data.duration) duration = data.duration;
      });

      player.on('pause', async () => {
        try { saveProgress(await player.getCurrentTime(), duration); } catch { /* ignore */ }
      });

      player.on('ended', () => { saveProgress(duration, duration); });

      player.on('error', () => {
        console.error('❌ Vimeo player emitted error event');
        setHasError(true);
        setIsLoading(false);
      });

      saveIntervalRef.current = setInterval(async () => {
        try {
          const currentTime = await player.getCurrentTime();
          if (currentTime > 0 && duration > 0) saveProgress(currentTime, duration);
        } catch { /* ignore */ }
      }, 15_000);
    }, INIT_DEBOUNCE_MS);

    return () => {
      console.log('🧹 Cleaning up Vimeo player for lesson:', lessonId);
      cleanup();
    };
    // iframeRef & saveProgress are intentionally omitted — both stable via refs
    // retryKey forces a full re-init when the user hits Retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoId, lessonId, userId, retryKey]);

  return { isLoading, hasError, retry };
};
