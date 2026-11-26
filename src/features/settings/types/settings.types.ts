/**
 * Canonical Deep Player settings contract.
 *
 * This file is the single source of truth for the settings schema (spec §5).
 * Every screen, selector, backup, migration and validation layer must derive
 * from these types — do not create conflicting per-screen interfaces.
 */

/** Light/dark/system appearance mode. */
export type SettingMode = 'light' | 'dark' | 'system';

/** Schema version for persistence + backup migration. Bump on breaking changes. */
export const SETTINGS_SCHEMA_VERSION = 1;

/** Top-level settings sections (domains). */
export type SettingsSection =
  | 'playback'
  | 'video'
  | 'audio'
  | 'folders'
  | 'appearance'
  | 'player'
  | 'storage'
  | 'privacy'
  | 'notifications'
  | 'accessibility'
  | 'advanced';

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  'playback',
  'video',
  'audio',
  'folders',
  'appearance',
  'player',
  'storage',
  'privacy',
  'notifications',
  'accessibility',
  'advanced',
] as const;

export interface DeepPlayerSettings {
  schemaVersion: number;

  playback: {
    autoPlayNext: boolean;
    rememberPosition: boolean;
    resumeBehavior: 'always' | 'ask' | 'never';
    defaultSpeed: number;
    speedMemory: 'global' | 'per-media';
    keepScreenAwake: 'always' | 'during-playback' | 'never';
    sleepTimerDefault: number;
    playbackHistory: boolean;
    autoStopAfterCurrent: boolean;
    continueAfterInterruption: boolean;
    orientation: 'auto' | 'portrait' | 'landscape' | 'locked';
    audioFocus: 'automatic' | 'strict';
    pauseOnHeadphoneDisconnect: boolean;
    resumeOnHeadphoneConnect: boolean;
    pauseOnCall: boolean;
    duckOnInterruption: boolean;
    backgroundAudio: boolean;
    backgroundVideoAudio: boolean;
    stopWhenTaskRemoved: boolean;
    notificationControls: boolean;
  };

  video: {
    decoder: 'auto' | 'hardware' | 'software';
    aspectRatio: 'fit' | 'fill' | 'crop' | 'stretch';
    orientation: 'auto' | 'portrait' | 'landscape';
    fullscreenOnPlay: boolean;
    autoHideControls: number;
    brightnessGestures: boolean;
    volumeGestures: boolean;
    seekGestures: boolean;
    doubleTapSeek: 5 | 10 | 15 | 30 | 60;
    pipEnabled: boolean;
    frameRateMode: 'original' | 'display' | 'auto';
    hardwareAcceleration: boolean;
    zoomMode: 'fit' | 'fill' | 'zoom';
    rotationLock: boolean;
    showStatusBar: boolean;
    showNavigationBar: boolean;

    subtitles: {
      enabled: boolean;
      autoLoad: boolean;
      preferredLanguage: string;
      fontSize: number;
      textColor: string;
      backgroundOpacity: number;
      bold: boolean;
      outline: boolean;
      verticalOffset: number;
      syncOffset: number;
    };
  };

  audio: {
    defaultSpeed: number;
    gapless: boolean;
    crossfadeEnabled: boolean;
    crossfadeDuration: number;
    replayGain: boolean;
    volumeNormalization: boolean;
    monoAudio: boolean;
    balance: number;
    fadeOnPause: boolean;
    visualizerEnabled: boolean;
    equalizerEnabled: boolean;
    equalizerPreset: string;
    equalizerBands: number[];
    bassBoost: number;
    virtualizer: number;
  };

  folders: {
    autoScan: boolean;
    scanOnStartup: boolean;
    backgroundScan: boolean;
    includeHidden: boolean;
    showEmpty: boolean;
    detectDuplicates: boolean;
    generateThumbnails: boolean;
    thumbnailQuality: 'low' | 'medium' | 'high';
    sortBy: 'name' | 'date' | 'size' | 'duration';
    sortOrder: 'ascending' | 'descending';
    smartFolders: 'both' | 'manual' | 'automatic';
    uncertainMatches: 'suggest' | 'ignore';
    autoMerge: boolean;
    rememberRejectedMatches: boolean;
    seasonDetection: boolean;
    episodeDetection: boolean;
    autoMatchThreshold: number;
    suggestionThreshold: number;
  };

  appearance: {
    mode: SettingMode;
    themeId: string;
    accentColor: string;
    dynamicColors: boolean;
    dynamicColorSource: 'album-art' | 'system';
    backgroundStyle: 'solid' | 'gradient' | 'glass';
    blurIntensity: 'off' | 'low' | 'medium' | 'high';
    animations: 'full' | 'reduced' | 'off';
    interfaceDensity: 'compact' | 'comfortable';
    fontScale: number;
    thumbnailShape: 'rounded' | 'square';
    navigationStyle: 'compact' | 'standard';
    wallpaperEnabled: boolean;
    wallpaperUri: string | null;
    playerArtworkBackground: boolean;
  };

  player: {
    miniPlayerEnabled: boolean;
    showArtwork: boolean;
    showVisualizer: boolean;
    showLyrics: boolean;
    showQueueButton: boolean;
    controlsStyle: 'minimal' | 'standard' | 'expanded';
    progressStyle: 'line' | 'waveform';
    artworkShape: 'rounded' | 'square' | 'circle';
    fullscreenArtwork: boolean;
    showTrackMetadata: boolean;
  };

  storage: {
    maxCacheSizeMB: number;
    autoCleanup: boolean;
    cleanupThreshold: number;
    thumbnailCache: boolean;
    subtitleCache: boolean;
    backupIncludeAppearance: boolean;
    backupIncludePlayback: boolean;
    backupIncludeFolders: boolean;
    backupIncludePresets: boolean;
  };

  privacy: {
    appLockEnabled: boolean;
    biometricEnabled: boolean;
    hidePrivateFolders: boolean;
    clearHistoryOnExit: boolean;
    hideRecentMedia: boolean;
    hideSensitiveThumbnails: boolean;
    requireAuthForSettings: boolean;
  };

  notifications: {
    playbackNotification: boolean;
    showArtwork: boolean;
    showControls: boolean;
    lockScreenControls: boolean;
    persistent: boolean;
    removeOnStop: boolean;
    showProgress: boolean;
  };

  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    hapticFeedback: boolean;
    largeControls: boolean;
    screenReaderOptimized: boolean;
    subtitleAccessibility: boolean;
  };

  advanced: {
    debugOverlay: boolean;
    loggingLevel: 'none' | 'error' | 'warn' | 'debug';
    enableExperimental: boolean;
    collectDiagnostics: boolean;
    showEngineInfo: boolean;
    forceSoftwareFallback: boolean;
    preloadNextMedia: boolean;
    databaseDiagnostics: boolean;
  };
}

/** A single section's value type. */
export type SettingsSectionValue<K extends keyof DeepPlayerSettings> = DeepPlayerSettings[K];

/** Dotted setting identifier, e.g. `video.subtitles.autoLoad`. */
export type SettingId = string;
