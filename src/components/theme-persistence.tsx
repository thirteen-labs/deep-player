import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { THEME_CONFIG } from '@/constants/theme';
import { loadThemePreference, saveThemePreference } from '@/db/theme-preference';
import { useResolvedTheme, useThemeStore, type ThemePreference } from '@/hooks/use-theme-store';

export function ThemePersistence() {
  const db = useSQLiteContext();
  const { preference } = useResolvedTheme();
  const hydrate = useThemeStore((s) => s.hydrate);
  const loadedRef = useRef(false);
  const savedRef = useRef<ThemePreference | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = THEME_CONFIG.settings.persistSelection
          ? await loadThemePreference(db)
          : null;
        if (cancelled) return;
        const next = saved ?? THEME_CONFIG.settings.defaultTheme;
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
    if (
      !THEME_CONFIG.settings.persistSelection ||
      !loadedRef.current ||
      preference === savedRef.current
    ) {
      return;
    }
    savedRef.current = preference;
    saveThemePreference(db, preference).catch(() => {
      // Persistence failures should not break theme switching.
    });
  }, [db, preference]);

  return null;
}