import { useResolvedTheme } from '@/hooks/use-theme-store';

/**
 * Returns the active ThemePalette. Supports multi-theme selection via useThemeStore.
 */
export function useTheme() {
  const { theme } = useResolvedTheme();
  return theme;
}

export { useResolvedTheme };
