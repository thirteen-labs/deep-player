/** Landing-page/category navigation metadata (spec §2–§3). */
import type { SettingsSection } from '../types/settings.types';

export interface SettingsCategoryLink {
  title: string;
  description: string;
  route: string;
}

export interface SettingsCategoryDefinition {
  id: string;
  title: string;
  description: string;
  route: string;
  section: SettingsSection;
  cards: SettingsCategoryLink[];
}

const card = (title: string, description: string, route: string): SettingsCategoryLink => ({
  title,
  description,
  route,
});

export const SETTINGS_CATEGORIES: SettingsCategoryDefinition[] = [
  {
    id: 'playback',
    title: 'Playback',
    description: 'Playback behavior and interruptions',
    route: '/settings/playback',
    section: 'playback',
    cards: [
      card('General', 'Speed, resume and history', '/settings/playback/general'),
      card('Interruptions', 'Calls, headphones and focus', '/settings/playback/interruptions'),
      card('Background', 'Background and notification playback', '/settings/playback/background'),
    ],
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Display, gestures and subtitles',
    route: '/settings/video',
    section: 'video',
    cards: [
      card('Display', 'Aspect ratio, zoom and controls', '/settings/video/display'),
      card('Gestures', 'Brightness, volume and seeking', '/settings/video/gestures'),
      card('Subtitles', 'Language, appearance and timing', '/settings/video/subtitles'),
      card('Advanced', 'Decoder and frame-rate options', '/settings/video/advanced'),
      card('Video library', 'Scan videos and view smart lists', '/settings/legacy/video'),
    ],
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Equalizer, effects and output',
    route: '/settings/audio',
    section: 'audio',
    cards: [
      card('Equalizer', '10-band presets and gains', '/settings/audio/equalizer'),
      card('Effects', 'Crossfade, bass and visualizer', '/settings/audio/effects'),
      card('Output', 'Gain, balance and normalization', '/settings/audio/output'),
      card('Library & permissions', 'Scan music and manage file access', '/settings/legacy/music'),
    ],
  },
  {
    id: 'folders',
    title: 'Folders & Organization',
    description: 'Scanning and smart folders',
    route: '/settings/folders',
    section: 'folders',
    cards: [
      card('Scanning', 'Auto-scan and thumbnails', '/settings/folders/scanning'),
      card('Smart folders', 'Series, seasons and matching', '/settings/folders/smart-folders'),
      card('Exclusions', 'Paths stored in the media database', '/settings/folders/exclusions'),
      card('Organization', 'Sorting and empty folders', '/settings/folders/organization'),
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Themes and interface customization',
    route: '/settings/appearance',
    section: 'appearance',
    cards: [
      card('Themes', 'Mode and theme catalog', '/settings/appearance/themes'),
      card('Colors', 'Accent and dynamic colors', '/settings/appearance/colors'),
      card('Interface', 'Density, motion and text size', '/settings/appearance/interface'),
      card('Player', 'Player surface customization', '/settings/appearance/player'),
    ],
  },
  {
    id: 'storage',
    title: 'Storage & Backup',
    description: 'Cache and local configuration backup',
    route: '/settings/storage',
    section: 'storage',
    cards: [
      card('Cache', 'Cache limits and cleanup', '/settings/storage/cache'),
      card('Database', 'SQLite media database', '/settings/storage/database'),
      card('Backup', 'Export and import settings', '/settings/storage/backup'),
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'App lock and private folders',
    route: '/settings/privacy',
    section: 'privacy',
    cards: [
      card('App lock', 'PIN and biometric preferences', '/settings/privacy/app-lock'),
      card('Private folders', 'Hidden and sensitive media', '/settings/privacy/private-folders'),
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Background and playback notifications',
    route: '/settings/notifications',
    section: 'notifications',
    cards: [],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'Text, motion and accessibility',
    route: '/settings/accessibility',
    section: 'accessibility',
    cards: [],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Engine, performance and diagnostics',
    route: '/settings/advanced',
    section: 'advanced',
    cards: [
      card('Engine', 'Native capability information', '/settings/advanced/engine'),
      card('Performance', 'Preloading and optimization', '/settings/advanced/performance'),
      card('Diagnostics', 'Logging and diagnostics', '/settings/advanced/diagnostics'),
      card('Developer', 'Experimental controls', '/settings/advanced/developer'),
    ],
  },
  {
    id: 'about',
    title: 'About',
    description: 'Version and open-source licenses',
    route: '/settings/about',
    section: 'advanced',
    cards: [
      card('Licenses', 'Open-source notices', '/settings/about/licenses'),
      card('Changelog', 'Release history', '/settings/about/changelog'),
    ],
  },
];

export const QUICK_ACCESS_CARDS: SettingsCategoryLink[] = [
  card('Themes', 'Change the app theme', '/settings/appearance/themes'),
  card('Audio', 'Equalizer and output', '/settings/audio'),
  card('Video', 'Display and subtitles', '/settings/video'),
];

export function categoryForRoute(route: string): SettingsCategoryDefinition | undefined {
  return SETTINGS_CATEGORIES.find((category) => category.route === route);
}
