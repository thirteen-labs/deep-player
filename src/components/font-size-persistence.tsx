import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { loadFontScale, saveFontScale } from '@/db/font-size-preference';
import { useFontSizeStore, type FontScale } from '@/stores/font-size-store';

/** Hydrates and persists the app-wide font size preference. */
export function FontSizePersistence() {
  const db = useSQLiteContext();
  const fontScale = useFontSizeStore((s) => s.fontScale);
  const hydrate = useFontSizeStore((s) => s.hydrate);
  const loadedRef = useRef(false);
  const savedRef = useRef<FontScale | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadFontScale(db);
        if (cancelled) return;
        const next = saved ?? useFontSizeStore.getState().fontScale;
        savedRef.current = next;
        hydrate(next);
      } catch {
        if (!cancelled) {
          const next = useFontSizeStore.getState().fontScale;
          savedRef.current = next;
          hydrate(next);
        }
      } finally {
        if (!cancelled) loadedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, hydrate]);

  useEffect(() => {
    if (!loadedRef.current || fontScale === savedRef.current) return;
    savedRef.current = fontScale;
    saveFontScale(db, fontScale).catch(() => {
      // Persistence failures should not block font size changes.
    });
  }, [db, fontScale]);

  return null;
}
