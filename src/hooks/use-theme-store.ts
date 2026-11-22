import { useColorScheme } from 'react-native';
import { create } from 'zustand';

import { THEME_NAMES, ThemeName, ThemePalette, ThemePreference, Themes } from '@/constants/theme';

interface ThemeStore {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  hydrate: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: 'system',
  hydrated: false,
  setPreference: (preference) => set({ preference }),
  hydrate: (preference) => set({ preference, hydrated: true }),
}));

export function resolveThemeName(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null | undefined
): ThemeName {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function useResolvedTheme(): {
  theme: ThemePalette;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  hydrated: boolean;
} {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const hydrated = useThemeStore((s) => s.hydrated);
  const name = resolveThemeName(preference, systemScheme);
  return { theme: Themes[name], preference, setPreference, hydrated };
}

export { THEME_NAMES, Themes };
export type { ThemeName, ThemePalette, ThemePreference };