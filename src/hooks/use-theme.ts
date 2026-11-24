import { useThemeOverride } from '@/components/theme-override';
import { useResolvedTheme } from '@/hooks/use-theme-store';

/**
 * Returns the active ThemePalette, or a scoped override supplied by a
 * ThemeOverrideProvider (used by artwork-adaptive player surfaces).
 */
export function useTheme() {
  const { theme } = useResolvedTheme();
  return useThemeOverride() ?? theme;
}

export { useResolvedTheme };
