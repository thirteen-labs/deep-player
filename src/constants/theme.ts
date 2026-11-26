import { Platform } from 'react-native';

import {
  THEME_CONFIG,
  type ThemeColors,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeName,
} from '@/constants/theme-config';

export { THEME_CONFIG, THEME_SETTINGS } from '@/constants/theme-config';
export type { ThemeColors, ThemeConfig, ThemeDefinition, ThemeMode, ThemeSettings } from '@/constants/theme-config';
export type { ThemeName } from '@/constants/theme-config';

export type ThemePreference = ThemeName;

/** Palette consumed by themed components. Legacy aliases are kept for compatibility. */
export interface ThemePalette extends ThemeColors {
  name: ThemeName;
  label: string;
  mode: ThemeMode;
  isDark: boolean;
  text: string;
  textSecondary: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  tint: string;
  accent: string;
  border: string;
  glassBackground: string;
  glassBorder: string;
  /** CSS gradient for experimental_backgroundImage */
  gradient: string;
  /** Remote or local image URI for screen background; undefined = no image */
  backgroundImage?: string;
  /** Blur tint for expo-blur */
  blurTint: 'light' | 'dark' | 'systemChromeMaterial' | 'systemMaterialDark' | 'systemMaterialLight';
  statusBarStyle: 'light' | 'dark';
  tabBarBackground: string;
}

/** Converts a hex color (including #RRGGBBAA) to an rgba() string. */
function toRgba(color: string, alpha: number): string {
  const raw = color.trim().replace(/^#/, '');
  const hex =
    raw.length === 3
      ? raw.split('').map((char) => char + char).join('')
      : raw.slice(0, 6);
  const value = /^[0-9a-f]{6}$/i.test(hex) ? hex : '000000';
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toPalette(definition: ThemeDefinition): ThemePalette {
  const { id, name: label, mode, colors } = definition;
  const isDark = mode === 'dark';

  return {
    ...colors,
    name: id,
    label,
    mode,
    isDark,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceElevated,
    tint: colors.primary,
    accent: colors.secondary,
    border: colors.border,
    glassBackground: toRgba(isDark ? colors.surfaceElevated : colors.surface, isDark ? 0.62 : 0.72),
    glassBorder: colors.border,
    gradient: `linear-gradient(180deg, ${colors.surfaceElevated} 0%, ${colors.background} 100%)`,
    backgroundImage: undefined,
    blurTint: isDark ? 'systemMaterialDark' : 'systemMaterialLight',
    statusBarStyle: isDark ? 'light' : 'dark',
    tabBarBackground: colors.tabBarBackground,
  };
}

export const Themes = Object.fromEntries(
  THEME_CONFIG.themes.map((definition) => [definition.id, toPalette(definition)])
) as Record<ThemeName, ThemePalette>;

export const THEME_NAMES = THEME_CONFIG.themes.map((theme) => theme.id) as ThemeName[];

/** Forces maximum foreground/background contrast without changing theme identity. */
export function withHighContrast(theme: ThemePalette): ThemePalette {
  if (theme.isDark) {
    return {
      ...theme,
      background: '#000000',
      surface: '#0A0A0A',
      surfaceElevated: '#161616',
      backgroundElement: '#0A0A0A',
      backgroundSelected: '#161616',
      playerBackground: '#000000',
      tabBarBackground: '#000000',
      text: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#F2F2F2',
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      tint: '#FFFFFF',
      accent: '#FFFFFF',
      border: '#FFFFFF',
      glassBackground: 'rgba(0, 0, 0, 0.92)',
      glassBorder: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.9)',
      statusBarStyle: 'light',
    };
  }
  return {
    ...theme,
    background: '#FFFFFF',
    surface: '#F4F4F4',
    surfaceElevated: '#E6E6E6',
    backgroundElement: '#F4F4F4',
    backgroundSelected: '#E6E6E6',
    playerBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    text: '#000000',
    textPrimary: '#000000',
    textSecondary: '#1A1A1A',
    primary: '#000000',
    secondary: '#000000',
    tint: '#000000',
    accent: '#000000',
    border: '#000000',
    glassBackground: 'rgba(255, 255, 255, 0.94)',
    glassBorder: '#000000',
    overlay: 'rgba(255, 255, 255, 0.9)',
    statusBarStyle: 'dark',
  };
}

/** Keys usable as ThemedText/ThemedView color props. */
export type ThemeColor =
  | 'text'
  | 'textPrimary'
  | 'background'
  | 'surface'
  | 'surfaceElevated'
  | 'backgroundElement'
  | 'backgroundSelected'
  | 'textSecondary'
  | 'tint'
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'border'
  | 'playerBackground'
  | 'tabBarBackground'
  | 'overlay';

/** Runtime list of the keys above, for narrowing palette-key vs explicit colors. */
export const THEME_COLOR_KEYS: readonly ThemeColor[] = [
  'text',
  'textPrimary',
  'background',
  'surface',
  'surfaceElevated',
  'backgroundElement',
  'backgroundSelected',
  'textSecondary',
  'tint',
  'primary',
  'accent',
  'secondary',
  'border',
  'playerBackground',
  'tabBarBackground',
  'overlay',
];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Clears the shared floating tab pill on every platform. */
export const BottomTabInset = 64;
export const MaxContentWidth = 800;
