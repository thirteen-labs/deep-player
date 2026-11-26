/** UI constraints and formatters shared by settings controls and search results. */
import { THEME_NAMES } from '@/constants/theme';

import type { SettingType } from '../search/settings.registry';
import {
  ANIMATIONS_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  AUDIO_FOCUS_OPTIONS,
  AUTO_HIDE_MAX,
  AUTO_HIDE_MIN,
  BACKGROUND_STYLE_OPTIONS,
  BALANCE_MAX,
  BALANCE_MIN,
  BLUR_INTENSITY_OPTIONS,
  CONFIDENCE_MAX,
  CONFIDENCE_MIN,
  CROSSFADE_MAX,
  CROSSFADE_MIN,
  DOUBLE_TAP_SEEK_OPTIONS,
  DYNAMIC_COLOR_SOURCE_OPTIONS,
  EFFECT_MAX,
  EFFECT_MIN,
  EQUALIZER_BAND_MAX,
  EQUALIZER_BAND_MIN,
  EQUALIZER_PRESETS,
  FRAME_RATE_MODE_OPTIONS,
  INTERFACE_DENSITY_OPTIONS,
  KEEP_SCREEN_AWAKE_OPTIONS,
  LOGGING_LEVEL_OPTIONS,
  NAVIGATION_STYLE_OPTIONS,
  ORIENTATION_OPTIONS,
  PLAYBACK_SPEED_MAX,
  PLAYBACK_SPEED_MIN,
  PLAYER_ARTWORK_SHAPE_OPTIONS,
  PLAYER_CONTROLS_STYLE_OPTIONS,
  PLAYER_PROGRESS_STYLE_OPTIONS,
  RESUME_BEHAVIOR_OPTIONS,
  SETTING_MODE_OPTIONS,
  SLEEP_TIMER_MAX,
  SLEEP_TIMER_MIN,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS,
  SMART_FOLDERS_OPTIONS,
  SPEED_MEMORY_OPTIONS,
  SUBTITLE_FONT_SIZE_MAX,
  SUBTITLE_FONT_SIZE_MIN,
  SUBTITLE_OPACITY_MAX,
  SUBTITLE_OPACITY_MIN,
  SUBTITLE_SYNC_OFFSET_MAX,
  SUBTITLE_SYNC_OFFSET_MIN,
  SUBTITLE_VERTICAL_OFFSET_MAX,
  SUBTITLE_VERTICAL_OFFSET_MIN,
  THUMBNAIL_QUALITY_OPTIONS,
  THUMBNAIL_SHAPE_OPTIONS,
  UNCERTAIN_MATCHES_OPTIONS,
  VIDEO_DECODER_OPTIONS,
  VIDEO_ORIENTATION_OPTIONS,
  ZOOM_MODE_OPTIONS,
} from '../types/settings.enums';

export interface ControlConfig {
  options?: (string | number)[];
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
}

const asSeconds = (v: number) => `${Math.round(v * 10) / 10}s`;
const asMs = (v: number) => `${Math.round(v)} ms`;
const asPercent = (v: number) => `${Math.round(v)}%`;
const asFactor = (v: number) => `${Math.round(v * 100) / 100}×`;
const asMb = (v: number) => `${Math.round(v)} MB`;
const asDb = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)} dB`;

export const CONTROL_CONFIG: Record<string, ControlConfig> = {
  'playback.resumeBehavior': { options: [...RESUME_BEHAVIOR_OPTIONS] },
  'playback.defaultSpeed': {
    min: PLAYBACK_SPEED_MIN,
    max: PLAYBACK_SPEED_MAX,
    step: 0.05,
    format: asFactor,
  },
  'playback.speedMemory': { options: [...SPEED_MEMORY_OPTIONS] },
  'playback.keepScreenAwake': { options: [...KEEP_SCREEN_AWAKE_OPTIONS] },
  'playback.sleepTimerDefault': {
    min: SLEEP_TIMER_MIN,
    max: SLEEP_TIMER_MAX,
    step: 1,
    format: (v) => (v === 0 ? 'Off' : `${Math.round(v)} min`),
  },
  'playback.orientation': { options: [...ORIENTATION_OPTIONS] },
  'playback.audioFocus': { options: [...AUDIO_FOCUS_OPTIONS] },

  'video.decoder': { options: [...VIDEO_DECODER_OPTIONS] },
  'video.aspectRatio': { options: [...ASPECT_RATIO_OPTIONS] },
  'video.orientation': { options: [...VIDEO_ORIENTATION_OPTIONS] },
  'video.autoHideControls': {
    min: AUTO_HIDE_MIN,
    max: AUTO_HIDE_MAX,
    step: 500,
    format: asMs,
  },
  'video.doubleTapSeek': { options: [...DOUBLE_TAP_SEEK_OPTIONS] },
  'video.frameRateMode': { options: [...FRAME_RATE_MODE_OPTIONS] },
  'video.zoomMode': { options: [...ZOOM_MODE_OPTIONS] },
  'video.subtitles.fontSize': {
    min: SUBTITLE_FONT_SIZE_MIN,
    max: SUBTITLE_FONT_SIZE_MAX,
    step: 5,
    format: asPercent,
  },
  'video.subtitles.backgroundOpacity': {
    min: SUBTITLE_OPACITY_MIN,
    max: SUBTITLE_OPACITY_MAX,
    step: 1,
    format: asPercent,
  },
  'video.subtitles.verticalOffset': {
    min: SUBTITLE_VERTICAL_OFFSET_MIN,
    max: SUBTITLE_VERTICAL_OFFSET_MAX,
    step: 1,
    format: asMs,
  },
  'video.subtitles.syncOffset': {
    min: SUBTITLE_SYNC_OFFSET_MIN,
    max: SUBTITLE_SYNC_OFFSET_MAX,
    step: 100,
    format: asMs,
  },

  'audio.defaultSpeed': {
    min: PLAYBACK_SPEED_MIN,
    max: PLAYBACK_SPEED_MAX,
    step: 0.05,
    format: asFactor,
  },
  'audio.crossfadeDuration': {
    min: CROSSFADE_MIN,
    max: CROSSFADE_MAX,
    step: 1,
    format: asSeconds,
  },
  'audio.balance': {
    min: BALANCE_MIN,
    max: BALANCE_MAX,
    step: 0.05,
    format: (v) => (Math.round(v * 100) / 100).toFixed(2),
  },
  'audio.equalizerPreset': { options: [...EQUALIZER_PRESETS] },
  'audio.equalizerBands': {
    min: EQUALIZER_BAND_MIN,
    max: EQUALIZER_BAND_MAX,
    step: 1,
    format: asDb,
  },
  'audio.bassBoost': { min: EFFECT_MIN, max: EFFECT_MAX, step: 1, format: asPercent },
  'audio.virtualizer': { min: EFFECT_MIN, max: EFFECT_MAX, step: 1, format: asPercent },

  'folders.thumbnailQuality': { options: [...THUMBNAIL_QUALITY_OPTIONS] },
  'folders.sortBy': { options: [...SORT_BY_OPTIONS] },
  'folders.sortOrder': { options: [...SORT_ORDER_OPTIONS] },
  'folders.smartFolders': { options: [...SMART_FOLDERS_OPTIONS] },
  'folders.uncertainMatches': { options: [...UNCERTAIN_MATCHES_OPTIONS] },
  'folders.autoMatchThreshold': {
    min: CONFIDENCE_MIN,
    max: CONFIDENCE_MAX,
    step: 1,
    format: asPercent,
  },
  'folders.suggestionThreshold': {
    min: CONFIDENCE_MIN,
    max: CONFIDENCE_MAX,
    step: 1,
    format: asPercent,
  },

  'appearance.mode': { options: [...SETTING_MODE_OPTIONS] },
  'appearance.themeId': { options: [...THEME_NAMES] },
  'appearance.dynamicColorSource': { options: [...DYNAMIC_COLOR_SOURCE_OPTIONS] },
  'appearance.backgroundStyle': { options: [...BACKGROUND_STYLE_OPTIONS] },
  'appearance.blurIntensity': { options: [...BLUR_INTENSITY_OPTIONS] },
  'appearance.animations': { options: [...ANIMATIONS_OPTIONS] },
  'appearance.interfaceDensity': { options: [...INTERFACE_DENSITY_OPTIONS] },
  'appearance.fontScale': { min: 0.5, max: 2, step: 0.05, format: asFactor },
  'appearance.thumbnailShape': { options: [...THUMBNAIL_SHAPE_OPTIONS] },
  'appearance.navigationStyle': { options: [...NAVIGATION_STYLE_OPTIONS] },

  'player.controlsStyle': { options: [...PLAYER_CONTROLS_STYLE_OPTIONS] },
  'player.progressStyle': { options: [...PLAYER_PROGRESS_STYLE_OPTIONS] },
  'player.artworkShape': { options: [...PLAYER_ARTWORK_SHAPE_OPTIONS] },

  'storage.maxCacheSizeMB': { min: 64, max: 4096, step: 64, format: asMb },
  'storage.cleanupThreshold': {
    min: CONFIDENCE_MIN,
    max: CONFIDENCE_MAX,
    step: 1,
    format: asPercent,
  },

  'advanced.loggingLevel': { options: [...LOGGING_LEVEL_OPTIONS] },
};

export function getControlConfig(id: string, _type: SettingType): ControlConfig {
  return CONTROL_CONFIG[id] ?? {};
}

/** Human-readable value for search results and preview cards. */
export function labelize(value: string | number): string {
  return String(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSettingValue(id: string, value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (Array.isArray(value)) return `${value.length} values`;

  const config = CONTROL_CONFIG[id];
  if (config?.options && config.options.includes(value as string & number)) {
    return labelize(value as string | number);
  }
  if (typeof value === 'number') {
    return config?.format ? config.format(value) : String(Math.round(value * 100) / 100);
  }
  return String(value);
}
