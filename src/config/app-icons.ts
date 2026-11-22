import type { AlternateAppIcons } from 'expo-alternate-app-icons';

export const DEFAULT_APP_ICON_SOURCE = require('@/assets/images/icon-11.png');

/**
 * Alternate app icons configured in app.json. Names must stay in sync with the
 * `expo-alternate-app-icons` plugin config.
 */
export const APP_ICONS = [
  {
    name: 'Icon2',
    label: 'Icon 2',
    source: require('@/assets/images/icon-2.png'),
  },
  {
    name: 'Icon3',
    label: 'Icon 3',
    source: require('@/assets/images/icon-3.png'),
  },
  {
    name: 'Icon4',
    label: 'Icon 4',
    source: require('@/assets/images/icon-4.png'),
  },
  {
    name: 'Icon11',
    label: 'Icon 11',
    source: require('@/assets/images/icon-11.png'),
  },
  {
    name: 'IconB',
    label: 'Icon B',
    source: require('@/assets/images/icon-b.png'),
  },
  {
    name: 'IconBl',
    label: 'Icon BL',
    source: require('@/assets/images/icon-bl.png'),
  },
  {
    name: 'IconBw',
    label: 'Icon BW',
    source: require('@/assets/images/icon-bw.png'),
  },
  {
    name: 'IconC',
    label: 'Icon C',
    source: require('@/assets/images/icon-c.png'),
  },
  {
    name: 'IconL',
    label: 'Icon L',
    source: require('@/assets/images/icon-l.png'),
  },
  {
    name: 'IconP',
    label: 'Icon P',
    source: require('@/assets/images/icon-p.png'),
  },
  {
    name: 'IconW',
    label: 'Icon W',
    source: require('@/assets/images/icon-w.png'),
  },
] as const;

export type AppIconName = AlternateAppIcons;
