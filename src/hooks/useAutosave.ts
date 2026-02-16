import { useEffect, useRef, useCallback, useState } from 'react';

const AUTOSAVE_DELAY = 2000; // 2 seconds debounce

interface AutosaveOptions {
  key: string;
  enabled: boolean;
}

export function useAutosave<T>(data: T, { key, enabled }: AutosaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const initialLoadRef = useRef(true);

  // Save to localStorage with debounce
  useEffect(() => {
    if (!enabled || initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          data,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
        setLastSavedAt(new Date());
        console.log(`[Autosave] Draft saved for key: ${key}`);
      } catch (err) {
        console.error('[Autosave] Failed to save draft:', err);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, enabled]);

  // Load saved draft
  const loadDraft = useCallback((): { data: T; savedAt: string } | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.data && parsed?.savedAt) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }, [key]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setLastSavedAt(null);
    console.log(`[Autosave] Draft cleared for key: ${key}`);
  }, [key]);

  // Check if draft exists
  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(key) !== null;
  }, [key]);

  return {
    lastSavedAt,
    loadDraft,
    clearDraft,
    hasDraft,
    hasRestoredDraft,
    setHasRestoredDraft,
  };
}
