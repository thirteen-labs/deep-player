import { create } from 'zustand';

import {
  THEME_CONFIG,
  THEME_NAMES,
  Themes,
  type ThemeName,
  type ThemePalette,
  type ThemePreference,
} from '@/constants/theme';

interface ThemeStore {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  hydrate: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: THEME_CONFIG.settings.defaultTheme,
  hydrated: false,
  setPreference: (preference) => set({ preference }),
  hydrate: (preference) => set({ preference, hydrated: true }),
}));

/** Themes are explicit now; the OS color scheme no longer selects a palette. */
export function resolveThemeName(preference: ThemePreference): ThemeName {
  return preference;
}

export function useResolvedTheme(): {
  theme: ThemePalette;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  hydrated: boolean;
} {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const hydrated = useThemeStore((s) => s.hydrated);
  return {
    theme: Themes[resolveThemeName(preference)],
    preference,
    setPreference,
    hydrated,
  };
}

export { THEME_NAMES, Themes };
export type { ThemeName, ThemePalette, ThemePreference };
