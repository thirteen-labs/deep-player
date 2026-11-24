import type { AlternateAppIcons } from 'expo-alternate-app-icons';

export const DEFAULT_APP_ICON_SOURCE = require('@/assets/images/icon-purple.png');

/**
 * Alternate app icons configured in app.json. Names must stay in sync with the
 * `expo-alternate-app-icons` plugin config.
 */
export const APP_ICONS = [
  {
    name: 'IconPurple',
    label: 'Purple',
    source: require('@/assets/images/icon-purple.png'),
  },
  {
    name: 'IconGreen',
    label: 'Green',
    source: require('@/assets/images/icon-green.png'),
  },
  {
    name: 'IconSunset',
    label: 'Sunset',
    source: require('@/assets/images/icon-sunset.png'),
  },
  {
    name: 'IconRed',
    label: 'Red',
    source: require('@/assets/images/icon-red.png'),
  },
  {
    name: 'IconBlue',
    label: 'Blue',
    source: require('@/assets/images/icon-blue.png'),
  },
  {
    name: 'IconAurora',
    label: 'Aurora',
    source: require('@/assets/images/icon-aurora.png'),
  },
  {
    name: 'IconBlack',
    label: 'Black',
    source: require('@/assets/images/icon-black.png'),
  },
  {
    name: 'IconLime',
    label: 'Lime',
    source: require('@/assets/images/icon-lime.png'),
  },
] as const;

export type AppIconName = AlternateAppIcons;
