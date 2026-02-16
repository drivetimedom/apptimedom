import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSupabaseAutosaveOptions {
  enabled: boolean;
  intervalMs?: number;
}

export function useSupabaseAutosave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  { enabled, intervalMs = 30000 }: UseSupabaseAutosaveOptions
) {
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastServerSave, setLastServerSave] = useState<Date | null>(null);
  const saveFnRef = useRef(saveFunction);
  const dataRef = useRef(data);

  // Keep refs current without triggering effect
  saveFnRef.current = saveFunction;
  dataRef.current = data;

  const doSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const currentDataString = JSON.stringify(dataRef.current);
    if (currentDataString === lastSavedRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      await saveFnRef.current(dataRef.current);
      lastSavedRef.current = currentDataString;
      setLastServerSave(new Date());
      console.log('[SupabaseAutosave] ✅ Saved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('[SupabaseAutosave] Error:', error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(doSave, intervalMs);
    return () => clearInterval(interval);
  }, [enabled, intervalMs, doSave]);

  // Reset tracking when disabled (e.g. modal closed)
  useEffect(() => {
    if (!enabled) {
      lastSavedRef.current = '';
      setLastServerSave(null);
    }
  }, [enabled]);

  return { isSaving, lastServerSave };
}
