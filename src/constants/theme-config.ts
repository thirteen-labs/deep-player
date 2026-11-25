export type ThemeMode = 'dark' | 'light';

export type ThemeName =
  | 'midnight'
  | 'ivory'
  | 'arctic'
  | 'lavender'
  | 'forest'
  | 'coral'
  | 'graphite'
  | 'amber';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  playerBackground: string;
  tabBarBackground: string;
  overlay: string;
}

export interface ThemeDefinition {
  id: ThemeName;
  name: string;
  mode: ThemeMode;
  colors: ThemeColors;
}

export interface ThemeSettings {
  defaultTheme: ThemeName;
  allowThemeSwitching: boolean;
  dynamicAlbumArtTheme: boolean;
  persistSelection: boolean;
  applyToSystemBars: boolean;
}

export interface ThemeConfig {
  themes: readonly ThemeDefinition[];
  settings: ThemeSettings;
}

/** Source of truth for every player theme and app-wide theme behavior. */
export const THEME_CONFIG = {
  themes: [
    {
      id: 'midnight',
      name: 'Midnight',
      mode: 'dark',
      colors: {
        background: '#090B12',
        surface: '#171C2B',
        surfaceElevated: '#222A3D',
        primary: '#7887FF',
        secondary: '#A5B0FF',
        textPrimary: '#F5F6FF',
        textSecondary: '#AAB4CE',
        border: '#30374A',
        playerBackground: '#090B12',
        tabBarBackground: '#101421',
        overlay: '#00000099',
      },
    },
    {
      id: 'ivory',
      name: 'Ivory',
      mode: 'light',
      colors: {
        background: '#F4F2ED',
        surface: '#FFFFFF',
        surfaceElevated: '#EAE6DD',
        primary: '#A17C53',
        secondary: '#C19B72',
        textPrimary: '#28241F',
        textSecondary: '#746B60',
        border: '#DED8CE',
        playerBackground: '#F4F2ED',
        tabBarBackground: '#FFFFFF',
        overlay: '#00000055',
      },
    },
    {
      id: 'arctic',
      name: 'Arctic',
      mode: 'dark',
      colors: {
        background: '#071719',
        surface: '#10292D',
        surfaceElevated: '#193A40',
        primary: '#48DDEB',
        secondary: '#8AF0F5',
        textPrimary: '#F0FFFF',
        textSecondary: '#A5D8DD',
        border: '#285056',
        playerBackground: '#071719',
        tabBarBackground: '#0B2023',
        overlay: '#00000099',
      },
    },
    {
      id: 'lavender',
      name: 'Lavender',
      mode: 'light',
      colors: {
        background: '#F6F1FC',
        surface: '#FFFFFF',
        surfaceElevated: '#EDE4F7',
        primary: '#9365CF',
        secondary: '#B58BEA',
        textPrimary: '#2D223A',
        textSecondary: '#786A89',
        border: '#E1D5EF',
        playerBackground: '#F6F1FC',
        tabBarBackground: '#FFFFFF',
        overlay: '#00000055',
      },
    },
    {
      id: 'forest',
      name: 'Forest',
      mode: 'dark',
      colors: {
        background: '#101711',
        surface: '#1B2B20',
        surfaceElevated: '#263A2B',
        primary: '#A6DB75',
        secondary: '#C3ED96',
        textPrimary: '#F2F8EF',
        textSecondary: '#BBD6B2',
        border: '#3D5942',
        playerBackground: '#101711',
        tabBarBackground: '#152019',
        overlay: '#00000099',
      },
    },
    {
      id: 'coral',
      name: 'Coral',
      mode: 'light',
      colors: {
        background: '#FFF5F2',
        surface: '#FFFFFF',
        surfaceElevated: '#FCE7E2',
        primary: '#F06F65',
        secondary: '#F79B8F',
        textPrimary: '#352321',
        textSecondary: '#806663',
        border: '#F0D6D0',
        playerBackground: '#FFF5F2',
        tabBarBackground: '#FFFFFF',
        overlay: '#00000055',
      },
    },
    {
      id: 'graphite',
      name: 'Graphite',
      mode: 'dark',
      colors: {
        background: '#171717',
        surface: '#282828',
        surfaceElevated: '#353535',
        primary: '#E5E5E5',
        secondary: '#AAAAAA',
        textPrimary: '#FFFFFF',
        textSecondary: '#C6C6C6',
        border: '#555555',
        playerBackground: '#171717',
        tabBarBackground: '#202020',
        overlay: '#000000AA',
      },
    },
    {
      id: 'amber',
      name: 'Amber',
      mode: 'dark',
      colors: {
        background: '#17120B',
        surface: '#302315',
        surfaceElevated: '#44321E',
        primary: '#FFB547',
        secondary: '#FFD18A',
        textPrimary: '#FFF8ED',
        textSecondary: '#E9C58E',
        border: '#60462A',
        playerBackground: '#17120B',
        tabBarBackground: '#21190F',
        overlay: '#00000099',
      },
    },
  ],
  settings: {
    defaultTheme: 'midnight',
    allowThemeSwitching: true,
    dynamicAlbumArtTheme: true,
    persistSelection: true,
    applyToSystemBars: true,
  },
} as const satisfies ThemeConfig;

export const THEME_SETTINGS: ThemeSettings = THEME_CONFIG.settings;
