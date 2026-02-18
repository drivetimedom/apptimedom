import { useEffect, useRef, useCallback } from 'react';
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
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const hasResumedRef = useRef(false);
  const isSavingRef = useRef(false);

  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!userId || !lessonId || isSavingRef.current || duration === 0) return;
    
    isSavingRef.current = true;
    console.log('💾 Saving progress:', currentTime, '/', duration);
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
      console.error('Error saving watch progress:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [userId, lessonId, onCompleted]);

  useEffect(() => {
    if (!vimeoId || !lessonId || !userId) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    hasResumedRef.current = false;

    // Load saved progress
    const loadProgress = async () => {
      try {
        const { data } = await supabase
          .from('lesson_watch_progress')
          .select('watched_seconds')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (data && data.watched_seconds && data.watched_seconds > 10) {
          // Wait for iframe to load, then seek
          const seekInterval = setInterval(() => {
            if (iframe.contentWindow && !hasResumedRef.current) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: 'setCurrentTime', value: data.watched_seconds }),
                '*'
              );
              hasResumedRef.current = true;
              clearInterval(seekInterval);
            }
          }, 1000);

          // Clear after 10 seconds if it doesn't work
          setTimeout(() => clearInterval(seekInterval), 10000);
        }
      } catch (error) {
        console.log('No saved progress found');
      }
    };

    // Listen for Vimeo postMessage events
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Vimeo event:', data.event || data.method, data);
        
        if (data.event === 'ready') {
          console.log('✅ Vimeo player ready!');
          iframe.contentWindow?.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }),
            '*'
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'pause' }),
            '*'
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ method: 'addEventListener', value: 'ended' }),
            '*'
          );
          iframe.contentWindow?.postMessage(
            JSON.stringify({ method: 'getDuration' }),
            '*'
          );
          
          loadProgress();
        }

        if (data.method === 'getDuration') {
          durationRef.current = data.value || 0;
        }

        if (data.event === 'timeupdate' && data.data) {
          currentTimeRef.current = data.data.seconds || 0;
          console.log('⏱️ Time update:', data.data.seconds);
          if (data.data.duration) {
            durationRef.current = data.data.duration;
          }
        }

        if (data.event === 'pause') {
          saveProgress(currentTimeRef.current, durationRef.current);
        }

        if (data.event === 'ended') {
          saveProgress(durationRef.current, durationRef.current);
        }
      } catch {
        // Not a JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);

    // Periodic save every 15 seconds
    saveIntervalRef.current = setInterval(() => {
      if (currentTimeRef.current > 0 && durationRef.current > 0) {
        saveProgress(currentTimeRef.current, durationRef.current);
      }
    }, 15000);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Save on unmount
      if (currentTimeRef.current > 0 && durationRef.current > 0) {
        saveProgress(currentTimeRef.current, durationRef.current);
      }
    };
  }, [vimeoId, lessonId, userId, iframeRef, saveProgress]);
};
