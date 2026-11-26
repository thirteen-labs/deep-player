import { useCallback, useMemo } from 'react';
import { create } from 'zustand';

import {
  THEME_CONFIG,
  THEME_NAMES,
  Themes,
  withHighContrast,
  type ThemeName,
  type ThemePalette,
  type ThemePreference,
} from '@/constants/theme';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import type { SettingMode } from '@/features/settings/types/settings.types';

interface ThemeStore {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  hydrate: (preference: ThemePreference) => void;
}

/**
 * Legacy theme preference store. It remains the persistence bridge for the
 * SQLite-backed ThemePersistence component, while the settings store is the
 * source of truth for the resolved app theme.
 */
export const useThemeStore = create<ThemeStore>((set) => ({
  preference: THEME_CONFIG.settings.defaultTheme,
  hydrated: false,
  setPreference: (preference) => set({ preference }),
  hydrate: (preference) => set({ preference, hydrated: true }),
}));

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_NAMES as readonly string[]).includes(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Resolve the catalog theme, honoring light/dark/system preference. */
export function resolveThemeName(preference: ThemePreference, mode?: SettingMode): ThemeName {
  const selected = isThemePreference(preference) ? preference : THEME_CONFIG.settings.defaultTheme;
  if (!mode || mode === 'system' || Themes[selected]?.mode === mode) return selected;
  return THEME_NAMES.find((name) => Themes[name].mode === mode) ?? selected;
}

function withAccent(theme: ThemePalette, accentColor: unknown): ThemePalette {
  if (!isHexColor(accentColor)) return theme;
  return { ...theme, primary: accentColor, secondary: accentColor, accent: accentColor, tint: accentColor };
}

export function useResolvedTheme(): {
  theme: ThemePalette;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  hydrated: boolean;
} {
  const legacyPreference = useThemeStore((s) => s.preference);
  const legacyHydrated = useThemeStore((s) => s.hydrated);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const settingsThemeId = useSettingsStore((s) => s.settings.appearance.themeId);
  const settingsMode = useSettingsStore((s) => s.settings.appearance.mode);
  const accentColor = useSettingsStore((s) => s.settings.appearance.accentColor);
  const highContrast = useSettingsStore((s) => s.settings.accessibility.highContrast);
  const setLegacyPreference = useThemeStore((s) => s.setPreference);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const preference = settingsHydrated && isThemePreference(settingsThemeId) ? settingsThemeId : legacyPreference;

  const theme = useMemo(() => {
    const base = withAccent(Themes[resolveThemeName(preference, settingsMode)], accentColor);
    return highContrast ? withHighContrast(base) : base;
  }, [accentColor, highContrast, preference, settingsMode]);

  /** Update both stores so every consumer (and SQLite persistence) sees the change. */
  const setPreference = useCallback(
    (next: ThemePreference) => {
      setLegacyPreference(next);
      if (!isThemePreference(next)) return;
      setSetting('appearance.themeId', next);
      setSetting('appearance.mode', Themes[next]?.mode ?? 'system');
    },
    [setLegacyPreference, setSetting],
  );

  return {
    theme,
    preference,
    setPreference,
    hydrated: legacyHydrated && settingsHydrated,
  };
}

export { THEME_NAMES, Themes };
export type { ThemeName, ThemePalette, ThemePreference };
