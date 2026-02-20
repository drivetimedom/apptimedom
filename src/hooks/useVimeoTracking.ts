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
  /** True while the player is initialising (before ready()) */
  isLoading: boolean;
  /** True while the video is actively buffering mid-play */
  isBuffering: boolean;
  /** True when an unrecoverable error occurred */
  hasError: boolean;
  retry: () => void;
}

// Safety: if player.ready() never resolves within this time → error fallback
const READY_TIMEOUT_MS = 15_000;
// Debounce: absorb rapid lesson changes / StrictMode double-invoke
const INIT_DEBOUNCE_MS = 150;

export const useVimeoTracking = ({
  vimeoId,
  lessonId,
  userId,
  iframeRef,
  onCompleted,
}: UseVimeoTrackingProps): VimeoTrackingState => {
  // ─── Internal refs ──────────────────────────────────────────────────────────
  const playerRef        = useRef<Player | null>(null);
  const saveIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const initTimeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyGuardRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef      = useRef(false);
  const isInitializedRef = useRef(false);
  // Track loading state in a ref so the readyGuard closure always sees the latest value
  const isLoadingRef     = useRef(true);

  // ─── Stable value refs (updated every render, never in dep arrays) ──────────
  const userIdRef      = useRef(userId);
  const lessonIdRef    = useRef(lessonId);
  const onCompletedRef = useRef(onCompleted);
  userIdRef.current      = userId;
  lessonIdRef.current    = lessonId;
  onCompletedRef.current = onCompleted;

  // ─── Exposed state ──────────────────────────────────────────────────────────
  const [retryKey,    setRetryKey]    = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError,    setHasError]    = useState(false);

  const setLoadingSync = useCallback((v: boolean) => {
    isLoadingRef.current = v;
    setIsLoading(v);
  }, []);

  const retry = useCallback(() => {
    setHasError(false);
    setLoadingSync(true);
    setIsBuffering(false);
    setRetryKey(k => k + 1);
  }, [setLoadingSync]);

  // ─── Stable progress saver ──────────────────────────────────────────────────
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
    } catch (err) {
      console.error('❌ Error saving progress:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, []); // intentionally empty — all values read from stable refs

  // ─── Full cleanup ───────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (initTimeoutRef.current)  { clearTimeout(initTimeoutRef.current);   initTimeoutRef.current  = null; }
    if (readyGuardRef.current)   { clearTimeout(readyGuardRef.current);    readyGuardRef.current   = null; }
    if (saveIntervalRef.current) { clearInterval(saveIntervalRef.current); saveIntervalRef.current = null; }
    if (playerRef.current)       { playerRef.current.destroy().catch(() => {}); playerRef.current = null; }
    isInitializedRef.current = false;
  }, []);

  // ─── Main effect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!vimeoId || !lessonId || !userId) return;

    // Reset UI state for new lesson / retry
    setLoadingSync(true);
    setHasError(false);
    setIsBuffering(false);

    // Cancel any pending debounce from a previous rapid update
    if (initTimeoutRef.current) { clearTimeout(initTimeoutRef.current); initTimeoutRef.current = null; }

    if (isInitializedRef.current) {
      console.log('⚠️ Player already initialised, skipping');
      return;
    }

    // Debounce: wait INIT_DEBOUNCE_MS before touching the DOM
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
        setLoadingSync(false);
        isInitializedRef.current = false;
        return;
      }
      playerRef.current = player;

      let duration = 0;

      // ── Safety guard: if ready() never fires → error after READY_TIMEOUT_MS ──
      readyGuardRef.current = setTimeout(() => {
        if (isInitializedRef.current && isLoadingRef.current) {
          console.warn('⏱ Vimeo ready() timeout — showing error fallback');
          setHasError(true);
          setLoadingSync(false);
        }
      }, READY_TIMEOUT_MS);

      // ── Ready ────────────────────────────────────────────────────────────────
      player.ready()
        .then(async () => {
          console.log('✅ Vimeo player ready!');
          if (readyGuardRef.current) { clearTimeout(readyGuardRef.current); readyGuardRef.current = null; }
          setLoadingSync(false);

          // Restore saved watch position
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
          } catch { /* non-critical */ }

          try { duration = await player.getDuration(); } catch { /* ignore */ }
          console.log('📏 Video duration:', duration);
        })
        .catch((err) => {
          console.error('❌ Vimeo player.ready() rejected:', err);
          if (readyGuardRef.current) { clearTimeout(readyGuardRef.current); readyGuardRef.current = null; }
          setHasError(true);
          setLoadingSync(false);
        });

      // ── Playback events ──────────────────────────────────────────────────────
      player.on('timeupdate', (data: { seconds: number; duration: number }) => {
        if (data.duration) duration = data.duration;
      });

      // Buffering overlay mid-play
      player.on('bufferstart', () => { setIsBuffering(true); });
      player.on('bufferend',   () => { setIsBuffering(false); });

      player.on('pause', async () => {
        setIsBuffering(false);
        try { saveProgress(await player.getCurrentTime(), duration); } catch { /* ignore */ }
      });

      player.on('ended', () => {
        setIsBuffering(false);
        saveProgress(duration, duration);
      });

      player.on('error', () => {
        console.error('❌ Vimeo player emitted error event');
        setHasError(true);
        setLoadingSync(false);
        setIsBuffering(false);
      });

      // Periodic autosave every 15s
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
    // iframeRef, saveProgress, cleanup: intentionally omitted — all stable via refs/useCallback([])
    // retryKey: forces full re-init on user-triggered retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoId, lessonId, userId, retryKey]);

  return { isLoading, isBuffering, hasError, retry };
};
