import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { loadThemePreference, saveThemePreference } from '@/db/theme-preference';
import { useThemeStore, type ThemePreference } from '@/hooks/use-theme-store';

export function ThemePersistence() {
  const db = useSQLiteContext();
  const preference = useThemeStore((s) => s.preference);
  const hydrate = useThemeStore((s) => s.hydrate);
  const loadedRef = useRef(false);
  const savedRef = useRef<ThemePreference | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadThemePreference(db);
        if (cancelled) return;
        const next = saved ?? useThemeStore.getState().preference;
        savedRef.current = next;
        hydrate(next);
      } catch {
        if (!cancelled) {
          const next = useThemeStore.getState().preference;
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
    if (!loadedRef.current || preference === savedRef.current) return;
    savedRef.current = preference;
    saveThemePreference(db, preference).catch(() => {
      // Persistence failures should not break theme switching.
    });
  }, [db, preference]);

  return null;
}