import { Platform } from 'react-native';

export type ThemeName =
  | 'light'
  | 'cream'
  | 'sky'
  | 'blossom'
  | 'dark'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'midnight'
  | 'graphite';

export type ThemePreference = ThemeName | 'system';

export interface ThemePalette {
  name: ThemeName;
  label: string;
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

export const Themes: Record<ThemeName, ThemePalette> = {
  light: {
    name: 'light',
    label: 'Light',
    isDark: false,
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    backgroundElement: '#F2F4F7',
    backgroundSelected: '#E4E7EC',
    tint: '#0A7EA4',
    accent: '#3C87F7',
    border: 'rgba(0,0,0,0.08)',
    glassBackground: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.7)',
    gradient: 'linear-gradient(180deg, #FFFFFF 0%, #F2F6FB 100%)',
    blurTint: 'systemMaterialLight',
    statusBarStyle: 'dark',
    tabBarBackground: '#FFFFFF',
  },
  cream: {
    name: 'cream',
    label: 'Cream',
    isDark: false,
    text: '#2B2118',
    textSecondary: '#7A6A58',
    background: '#FFF8F0',
    backgroundElement: '#F3E8DA',
    backgroundSelected: '#E8D8C4',
    tint: '#C47A2C',
    accent: '#E09B4F',
    border: 'rgba(90,60,30,0.10)',
    glassBackground: 'rgba(255,248,240,0.58)',
    glassBorder: 'rgba(255,255,255,0.75)',
    gradient: 'linear-gradient(180deg, #FFF8F0 0%, #F7ECDDF0 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'light',
    statusBarStyle: 'dark',
    tabBarBackground: '#FFF8F0',
  },
  sky: {
    name: 'sky',
    label: 'Sky',
    isDark: false,
    text: '#102A43',
    textSecondary: '#486581',
    background: '#F0F8FF',
    backgroundElement: '#DCEEFB',
    backgroundSelected: '#C9E2F7',
    tint: '#2D9CDB',
    accent: '#56CCF2',
    border: 'rgba(16,42,67,0.10)',
    glassBackground: 'rgba(240,248,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.72)',
    gradient: 'linear-gradient(180deg, #F0F8FF 0%, #D9EEFF 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'light',
    statusBarStyle: 'dark',
    tabBarBackground: '#F0F8FF',
  },
  blossom: {
    name: 'blossom',
    label: 'Blossom',
    isDark: false,
    text: '#3D1F2E',
    textSecondary: '#7A5268',
    background: '#FFF5F8',
    backgroundElement: '#FCE4EC',
    backgroundSelected: '#F8CDD8',
    tint: '#D81B60',
    accent: '#F06292',
    border: 'rgba(90,30,60,0.10)',
    glassBackground: 'rgba(255,245,248,0.56)',
    glassBorder: 'rgba(255,255,255,0.72)',
    gradient: 'linear-gradient(180deg, #FFF5F8 0%, #FDE7EF 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'light',
    statusBarStyle: 'dark',
    tabBarBackground: '#FFF5F8',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    isDark: true,
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#0B0D10',
    backgroundElement: '#1C1F24',
    backgroundSelected: '#2A2E35',
    tint: '#58C4DC',
    accent: '#5EA2FF',
    border: 'rgba(255,255,255,0.10)',
    glassBackground: 'rgba(20,22,28,0.55)',
    glassBorder: 'rgba(255,255,255,0.12)',
    gradient: 'linear-gradient(180deg, #141821 0%, #0B0D10 100%)',
    blurTint: 'systemMaterialDark',
    statusBarStyle: 'light',
    tabBarBackground: '#0B0D10',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    isDark: true,
    text: '#EAF8FF',
    textSecondary: '#A7C7D9',
    background: '#071B2E',
    backgroundElement: '#0E2A42',
    backgroundSelected: '#163B59',
    tint: '#5FD4FF',
    accent: '#3EC6E0',
    border: 'rgba(140,220,255,0.14)',
    glassBackground: 'rgba(8,38,64,0.45)',
    glassBorder: 'rgba(140,220,255,0.22)',
    gradient: 'linear-gradient(180deg, #0B3D60 0%, #071B2E 45%, #04111D 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'dark',
    statusBarStyle: 'light',
    tabBarBackground: '#071B2E',
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    isDark: true,
    text: '#FFF5EE',
    textSecondary: '#FFD0B8',
    background: '#2A1020',
    backgroundElement: '#421A2F',
    backgroundSelected: '#5A2540',
    tint: '#FFB36B',
    accent: '#FF7A59',
    border: 'rgba(255,190,150,0.16)',
    glassBackground: 'rgba(60,20,40,0.42)',
    glassBorder: 'rgba(255,200,170,0.22)',
    gradient: 'linear-gradient(180deg, #FF7A59 0%, #B8325E 35%, #2A1020 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'dark',
    statusBarStyle: 'light',
    tabBarBackground: '#2A1020',
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    isDark: true,
    text: '#EEF7F1',
    textSecondary: '#B7D1C0',
    background: '#0D1F17',
    backgroundElement: '#173126',
    backgroundSelected: '#214235',
    tint: '#7AD9A3',
    accent: '#56C596',
    border: 'rgba(150,220,180,0.14)',
    glassBackground: 'rgba(14,40,30,0.45)',
    glassBorder: 'rgba(160,230,190,0.20)',
    gradient: 'linear-gradient(180deg, #1F5A43 0%, #0D1F17 55%, #08130F 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'dark',
    statusBarStyle: 'light',
    tabBarBackground: '#0D1F17',
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    isDark: true,
    text: '#F1EFFF',
    textSecondary: '#C2B8E0',
    background: '#120E24',
    backgroundElement: '#211A3D',
    backgroundSelected: '#2D2352',
    tint: '#B59CFF',
    accent: '#8E7CFF',
    border: 'rgba(190,170,255,0.14)',
    glassBackground: 'rgba(30,22,58,0.45)',
    glassBorder: 'rgba(200,185,255,0.20)',
    gradient: 'linear-gradient(180deg, #352A63 0%, #1A1333 45%, #120E24 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'dark',
    statusBarStyle: 'light',
    tabBarBackground: '#120E24',
  },
  graphite: {
    name: 'graphite',
    label: 'Graphite',
    isDark: true,
    text: '#F5F7FA',
    textSecondary: '#B0BAC5',
    background: '#14171A',
    backgroundElement: '#22272E',
    backgroundSelected: '#30363D',
    tint: '#79C0FF',
    accent: '#A5D6FF',
    border: 'rgba(180,200,220,0.12)',
    glassBackground: 'rgba(34,39,46,0.55)',
    glassBorder: 'rgba(180,200,220,0.16)',
    gradient: 'linear-gradient(180deg, #2D333B 0%, #14171A 100%)',
    backgroundImage:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1600&auto=format&fit=crop',
    blurTint: 'dark',
    statusBarStyle: 'light',
    tabBarBackground: '#14171A',
  },
};

export const THEME_NAMES: ThemeName[] = [
  'light',
  'cream',
  'sky',
  'blossom',
  'dark',
  'ocean',
  'sunset',
  'forest',
  'midnight',
  'graphite',
];

/** Keys usable as ThemedText/ThemedView color props, back-compat with existing components */
export type ThemeColor = 'text' | 'background' | 'backgroundElement' | 'backgroundSelected' | 'textSecondary' | 'tint' | 'accent';

/** Runtime list of the keys above, for narrowing palette-key vs explicit colors. */
export const THEME_COLOR_KEYS: readonly ThemeColor[] = [
  'text',
  'background',
  'backgroundElement',
  'backgroundSelected',
  'textSecondary',
  'tint',
  'accent',
];

export const Colors = {
  light: Themes.light,
  dark: Themes.dark,
} as const;

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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
