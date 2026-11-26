/**
 * Runtime Zod validation (spec §1 + production requirement: runtime validation).
 * The schema mirrors DeepPlayerSettings exactly. Use `settingsSchema.safeParse`.
 */
import { z } from 'zod';

import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import type { DeepPlayerSettings } from '../types/settings.types';
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
  EQUALIZER_BAND_COUNT,
  EQUALIZER_BAND_MAX,
  EQUALIZER_BAND_MIN,
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
  SMART_FOLDERS_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS,
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

const speed = z.number().min(PLAYBACK_SPEED_MIN).max(PLAYBACK_SPEED_MAX);

export const playbackSchema = z.object({
  autoPlayNext: z.boolean(),
  rememberPosition: z.boolean(),
  resumeBehavior: z.enum(RESUME_BEHAVIOR_OPTIONS),
  defaultSpeed: speed,
  speedMemory: z.enum(SPEED_MEMORY_OPTIONS),
  keepScreenAwake: z.enum(KEEP_SCREEN_AWAKE_OPTIONS),
  sleepTimerDefault: z.number().min(SLEEP_TIMER_MIN).max(SLEEP_TIMER_MAX),
  playbackHistory: z.boolean(),
  autoStopAfterCurrent: z.boolean(),
  continueAfterInterruption: z.boolean(),
  orientation: z.enum(ORIENTATION_OPTIONS),
  audioFocus: z.enum(AUDIO_FOCUS_OPTIONS),
  pauseOnHeadphoneDisconnect: z.boolean(),
  resumeOnHeadphoneConnect: z.boolean(),
  pauseOnCall: z.boolean(),
  duckOnInterruption: z.boolean(),
  backgroundAudio: z.boolean(),
  backgroundVideoAudio: z.boolean(),
  stopWhenTaskRemoved: z.boolean(),
  notificationControls: z.boolean(),
});

export const subtitlesSchema = z.object({
  enabled: z.boolean(),
  autoLoad: z.boolean(),
  preferredLanguage: z.string(),
  fontSize: z.number().min(SUBTITLE_FONT_SIZE_MIN).max(SUBTITLE_FONT_SIZE_MAX),
  textColor: z.string(),
  backgroundOpacity: z.number().min(SUBTITLE_OPACITY_MIN).max(SUBTITLE_OPACITY_MAX),
  bold: z.boolean(),
  outline: z.boolean(),
  verticalOffset: z.number().min(SUBTITLE_VERTICAL_OFFSET_MIN).max(SUBTITLE_VERTICAL_OFFSET_MAX),
  syncOffset: z.number().min(SUBTITLE_SYNC_OFFSET_MIN).max(SUBTITLE_SYNC_OFFSET_MAX),
});

export const videoSchema = z.object({
  decoder: z.enum(VIDEO_DECODER_OPTIONS),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS),
  orientation: z.enum(VIDEO_ORIENTATION_OPTIONS),
  fullscreenOnPlay: z.boolean(),
  autoHideControls: z.number().min(AUTO_HIDE_MIN).max(AUTO_HIDE_MAX),
  brightnessGestures: z.boolean(),
  volumeGestures: z.boolean(),
  seekGestures: z.boolean(),
  doubleTapSeek: z.literal([...DOUBLE_TAP_SEEK_OPTIONS]),
  pipEnabled: z.boolean(),
  frameRateMode: z.enum(FRAME_RATE_MODE_OPTIONS),
  hardwareAcceleration: z.boolean(),
  zoomMode: z.enum(ZOOM_MODE_OPTIONS),
  rotationLock: z.boolean(),
  showStatusBar: z.boolean(),
  showNavigationBar: z.boolean(),
  subtitles: subtitlesSchema,
});

export const audioSchema = z.object({
  defaultSpeed: speed,
  gapless: z.boolean(),
  crossfadeEnabled: z.boolean(),
  crossfadeDuration: z.number().min(CROSSFADE_MIN).max(CROSSFADE_MAX),
  replayGain: z.boolean(),
  volumeNormalization: z.boolean(),
  monoAudio: z.boolean(),
  balance: z.number().min(BALANCE_MIN).max(BALANCE_MAX),
  fadeOnPause: z.boolean(),
  visualizerEnabled: z.boolean(),
  equalizerEnabled: z.boolean(),
  equalizerPreset: z.string(),
  equalizerBands: z
    .array(z.number().min(EQUALIZER_BAND_MIN).max(EQUALIZER_BAND_MAX))
    .length(EQUALIZER_BAND_COUNT),
  bassBoost: z.number().min(EFFECT_MIN).max(EFFECT_MAX),
  virtualizer: z.number().min(EFFECT_MIN).max(EFFECT_MAX),
});

export const foldersSchema = z.object({
  autoScan: z.boolean(),
  scanOnStartup: z.boolean(),
  backgroundScan: z.boolean(),
  includeHidden: z.boolean(),
  showEmpty: z.boolean(),
  detectDuplicates: z.boolean(),
  generateThumbnails: z.boolean(),
  thumbnailQuality: z.enum(THUMBNAIL_QUALITY_OPTIONS),
  sortBy: z.enum(SORT_BY_OPTIONS),
  sortOrder: z.enum(SORT_ORDER_OPTIONS),
  smartFolders: z.enum(SMART_FOLDERS_OPTIONS),
  uncertainMatches: z.enum(UNCERTAIN_MATCHES_OPTIONS),
  autoMerge: z.boolean(),
  rememberRejectedMatches: z.boolean(),
  seasonDetection: z.boolean(),
  episodeDetection: z.boolean(),
  autoMatchThreshold: z.number().min(CONFIDENCE_MIN).max(CONFIDENCE_MAX),
  suggestionThreshold: z.number().min(CONFIDENCE_MIN).max(CONFIDENCE_MAX),
});

export const appearanceSchema = z.object({
  mode: z.enum(SETTING_MODE_OPTIONS),
  themeId: z.string(),
  accentColor: z.string(),
  dynamicColors: z.boolean(),
  dynamicColorSource: z.enum(DYNAMIC_COLOR_SOURCE_OPTIONS),
  backgroundStyle: z.enum(BACKGROUND_STYLE_OPTIONS),
  blurIntensity: z.enum(BLUR_INTENSITY_OPTIONS),
  animations: z.enum(ANIMATIONS_OPTIONS),
  interfaceDensity: z.enum(INTERFACE_DENSITY_OPTIONS),
  fontScale: z.number(),
  thumbnailShape: z.enum(THUMBNAIL_SHAPE_OPTIONS),
  navigationStyle: z.enum(NAVIGATION_STYLE_OPTIONS),
  wallpaperEnabled: z.boolean(),
  wallpaperUri: z.string().nullable(),
  playerArtworkBackground: z.boolean(),
});

export const playerSchema = z.object({
  miniPlayerEnabled: z.boolean(),
  showArtwork: z.boolean(),
  showVisualizer: z.boolean(),
  showLyrics: z.boolean(),
  showQueueButton: z.boolean(),
  controlsStyle: z.enum(PLAYER_CONTROLS_STYLE_OPTIONS),
  progressStyle: z.enum(PLAYER_PROGRESS_STYLE_OPTIONS),
  artworkShape: z.enum(PLAYER_ARTWORK_SHAPE_OPTIONS),
  fullscreenArtwork: z.boolean(),
  showTrackMetadata: z.boolean(),
});

export const storageSchema = z.object({
  maxCacheSizeMB: z.number(),
  autoCleanup: z.boolean(),
  cleanupThreshold: z.number(),
  thumbnailCache: z.boolean(),
  subtitleCache: z.boolean(),
  backupIncludeAppearance: z.boolean(),
  backupIncludePlayback: z.boolean(),
  backupIncludeFolders: z.boolean(),
  backupIncludePresets: z.boolean(),
});

export const privacySchema = z.object({
  appLockEnabled: z.boolean(),
  biometricEnabled: z.boolean(),
  hidePrivateFolders: z.boolean(),
  clearHistoryOnExit: z.boolean(),
  hideRecentMedia: z.boolean(),
  hideSensitiveThumbnails: z.boolean(),
  requireAuthForSettings: z.boolean(),
});

export const notificationsSchema = z.object({
  playbackNotification: z.boolean(),
  showArtwork: z.boolean(),
  showControls: z.boolean(),
  lockScreenControls: z.boolean(),
  persistent: z.boolean(),
  removeOnStop: z.boolean(),
  showProgress: z.boolean(),
});

export const accessibilitySchema = z.object({
  largeText: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  hapticFeedback: z.boolean(),
  largeControls: z.boolean(),
  screenReaderOptimized: z.boolean(),
  subtitleAccessibility: z.boolean(),
});

export const advancedSchema = z.object({
  debugOverlay: z.boolean(),
  loggingLevel: z.enum(LOGGING_LEVEL_OPTIONS),
  enableExperimental: z.boolean(),
  collectDiagnostics: z.boolean(),
  showEngineInfo: z.boolean(),
  forceSoftwareFallback: z.boolean(),
  preloadNextMedia: z.boolean(),
  databaseDiagnostics: z.boolean(),
});

export const settingsSchema = z.object({
  schemaVersion: z.number().int().nonnegative(),
  playback: playbackSchema,
  video: videoSchema,
  audio: audioSchema,
  folders: foldersSchema,
  appearance: appearanceSchema,
  player: playerSchema,
  storage: storageSchema,
  privacy: privacySchema,
  notifications: notificationsSchema,
  accessibility: accessibilitySchema,
  advanced: advancedSchema,
});

export type SettingsSchema = z.infer<typeof settingsSchema>;

/** Per-section schemas keyed by section name (used for partial backup restoration). */
export const sectionSchemas = {
  playback: playbackSchema,
  video: videoSchema,
  audio: audioSchema,
  folders: foldersSchema,
  appearance: appearanceSchema,
  player: playerSchema,
  storage: storageSchema,
  privacy: privacySchema,
  notifications: notificationsSchema,
  accessibility: accessibilitySchema,
  advanced: advancedSchema,
} as const;

/** Compile-time guard that the Zod schema and canonical TS type stay in sync. */
const _schemaTypeCheck: DeepPlayerSettings = null as unknown as SettingsSchema;
void _schemaTypeCheck;
void SETTINGS_SCHEMA_VERSION;
