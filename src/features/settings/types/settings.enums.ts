/**
 * Constrained option lists for enum-valued settings (spec §4 constraints).
 * Kept separate from the schema so UI selectors and Zod share one source.
 */

export const RESUME_BEHAVIOR_OPTIONS = ['always', 'ask', 'never'] as const;
export const SPEED_MEMORY_OPTIONS = ['global', 'per-media'] as const;
export const KEEP_SCREEN_AWAKE_OPTIONS = ['always', 'during-playback', 'never'] as const;
export const ORIENTATION_OPTIONS = ['auto', 'portrait', 'landscape', 'locked'] as const;
export const AUDIO_FOCUS_OPTIONS = ['automatic', 'strict'] as const;

/** Speed constraints: 0.25–4.0. */
export const PLAYBACK_SPEED_MIN = 0.25;
export const PLAYBACK_SPEED_MAX = 4.0;
/** Sleep timer: 0–180 minutes. */
export const SLEEP_TIMER_MIN = 0;
export const SLEEP_TIMER_MAX = 180;

export const VIDEO_DECODER_OPTIONS = ['auto', 'hardware', 'software'] as const;
export const ASPECT_RATIO_OPTIONS = ['fit', 'fill', 'crop', 'stretch'] as const;
export const VIDEO_ORIENTATION_OPTIONS = ['auto', 'portrait', 'landscape'] as const;
export const FRAME_RATE_MODE_OPTIONS = ['original', 'display', 'auto'] as const;
export const ZOOM_MODE_OPTIONS = ['fit', 'fill', 'zoom'] as const;
export const DOUBLE_TAP_SEEK_OPTIONS = [5, 10, 15, 30, 60] as const;
/** Auto-hide: 1000–15000 ms. */
export const AUTO_HIDE_MIN = 1000;
export const AUTO_HIDE_MAX = 15000;
/** Subtitle font size 50–200%. */
export const SUBTITLE_FONT_SIZE_MIN = 50;
export const SUBTITLE_FONT_SIZE_MAX = 200;
/** Subtitle background opacity 0–100%. */
export const SUBTITLE_OPACITY_MIN = 0;
export const SUBTITLE_OPACITY_MAX = 100;
/** Subtitle vertical offset -100 to 100. */
export const SUBTITLE_VERTICAL_OFFSET_MIN = -100;
export const SUBTITLE_VERTICAL_OFFSET_MAX = 100;
/** Subtitle sync offset -10000 to 10000 ms. */
export const SUBTITLE_SYNC_OFFSET_MIN = -10000;
export const SUBTITLE_SYNC_OFFSET_MAX = 10000;

/** Crossfade: 0–12 seconds. */
export const CROSSFADE_MIN = 0;
export const CROSSFADE_MAX = 12;
/** Balance: -1 to 1. */
export const BALANCE_MIN = -1;
export const BALANCE_MAX = 1;
/** Bass boost / virtualizer: 0–100. */
export const EFFECT_MIN = 0;
export const EFFECT_MAX = 100;
/** Equalizer band gain range: -12 to +12 dB. */
export const EQUALIZER_BAND_MIN = -12;
export const EQUALIZER_BAND_MAX = 12;
/** 10-band equalizer frequencies (Hz). */
export const EQUALIZER_BAND_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export const EQUALIZER_BAND_COUNT = 10;
export const EQUALIZER_PRESETS = [
  'flat',
  'classical',
  'dance',
  'hip-hop',
  'jazz',
  'pop',
  'rock',
  'custom',
] as const;

export const THUMBNAIL_QUALITY_OPTIONS = ['low', 'medium', 'high'] as const;
export const SORT_BY_OPTIONS = ['name', 'date', 'size', 'duration'] as const;
export const SORT_ORDER_OPTIONS = ['ascending', 'descending'] as const;
export const SMART_FOLDERS_OPTIONS = ['both', 'manual', 'automatic'] as const;
export const UNCERTAIN_MATCHES_OPTIONS = ['suggest', 'ignore'] as const;
/** Smart-folder confidence thresholds (spec §4.6). */
export const AUTO_MATCH_THRESHOLD_DEFAULT = 90;
export const SUGGESTION_THRESHOLD_DEFAULT = 65;
export const CONFIDENCE_MIN = 0;
export const CONFIDENCE_MAX = 100;

export const SETTING_MODE_OPTIONS = ['light', 'dark', 'system'] as const;
export const DYNAMIC_COLOR_SOURCE_OPTIONS = ['album-art', 'system'] as const;
export const BACKGROUND_STYLE_OPTIONS = ['solid', 'gradient', 'glass'] as const;
export const BLUR_INTENSITY_OPTIONS = ['off', 'low', 'medium', 'high'] as const;
export const ANIMATIONS_OPTIONS = ['full', 'reduced', 'off'] as const;
export const INTERFACE_DENSITY_OPTIONS = ['compact', 'comfortable'] as const;
export const THUMBNAIL_SHAPE_OPTIONS = ['rounded', 'square'] as const;
export const NAVIGATION_STYLE_OPTIONS = ['compact', 'standard'] as const;

export const PLAYER_CONTROLS_STYLE_OPTIONS = ['minimal', 'standard', 'expanded'] as const;
export const PLAYER_PROGRESS_STYLE_OPTIONS = ['line', 'waveform'] as const;
export const PLAYER_ARTWORK_SHAPE_OPTIONS = ['rounded', 'square', 'circle'] as const;

export const LOGGING_LEVEL_OPTIONS = ['none', 'error', 'warn', 'debug'] as const;

/** Backup category keys (spec §9). */
export const BACKUP_CATEGORIES = [
  'appearance',
  'playback',
  'video',
  'audio',
  'folders',
  'player',
  'storage',
  'privacy',
  'notifications',
  'accessibility',
  'advanced',
] as const;
export type BackupCategory = (typeof BACKUP_CATEGORIES)[number];
