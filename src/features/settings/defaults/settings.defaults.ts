/**
 * Single source of defaults (spec §6). Defaults are immutable: deep-frozen
 * and always cloned before being handed to callers. Stores must never mutate
 * DEFAULT_SETTINGS in place.
 */
import type { DeepPlayerSettings } from '../types/settings.types';
import { SETTINGS_SCHEMA_VERSION } from '../types/settings.types';
import { EQUALIZER_BAND_COUNT } from '../types/settings.enums';

const defaults: DeepPlayerSettings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,

  playback: {
    autoPlayNext: true,
    rememberPosition: true,
    resumeBehavior: 'always',
    defaultSpeed: 1,
    speedMemory: 'per-media',
    keepScreenAwake: 'during-playback',
    sleepTimerDefault: 0,
    playbackHistory: true,
    autoStopAfterCurrent: false,
    continueAfterInterruption: false,
    orientation: 'auto',
    audioFocus: 'automatic',
    pauseOnHeadphoneDisconnect: true,
    resumeOnHeadphoneConnect: false,
    pauseOnCall: true,
    duckOnInterruption: true,
    backgroundAudio: true,
    backgroundVideoAudio: false,
    stopWhenTaskRemoved: false,
    notificationControls: true,
  },

  video: {
    decoder: 'auto',
    aspectRatio: 'fit',
    orientation: 'auto',
    fullscreenOnPlay: false,
    autoHideControls: 3000,
    brightnessGestures: true,
    volumeGestures: true,
    seekGestures: true,
    doubleTapSeek: 10,
    pipEnabled: true,
    frameRateMode: 'original',
    hardwareAcceleration: true,
    zoomMode: 'fit',
    rotationLock: false,
    showStatusBar: false,
    showNavigationBar: false,

    subtitles: {
      enabled: true,
      autoLoad: true,
      preferredLanguage: 'system',
      fontSize: 100,
      textColor: '#FFFFFF',
      backgroundOpacity: 40,
      bold: false,
      outline: true,
      verticalOffset: 0,
      syncOffset: 0,
    },
  },

  audio: {
    defaultSpeed: 1,
    gapless: true,
    crossfadeEnabled: false,
    crossfadeDuration: 3,
    replayGain: false,
    volumeNormalization: false,
    monoAudio: false,
    balance: 0,
    fadeOnPause: false,
    visualizerEnabled: true,
    equalizerEnabled: false,
    equalizerPreset: 'flat',
    equalizerBands: Array(EQUALIZER_BAND_COUNT).fill(0),
    bassBoost: 0,
    virtualizer: 0,
  },

  folders: {
    autoScan: true,
    scanOnStartup: false,
    backgroundScan: true,
    includeHidden: false,
    showEmpty: false,
    detectDuplicates: true,
    generateThumbnails: true,
    thumbnailQuality: 'medium',
    sortBy: 'name',
    sortOrder: 'ascending',
    smartFolders: 'both',
    uncertainMatches: 'suggest',
    autoMerge: false,
    rememberRejectedMatches: true,
    seasonDetection: true,
    episodeDetection: true,
    autoMatchThreshold: 90,
    suggestionThreshold: 65,
  },

  appearance: {
    mode: 'system',
    themeId: 'midnight',
    accentColor: '#B7F34B',
    dynamicColors: false,
    dynamicColorSource: 'album-art',
    backgroundStyle: 'solid',
    blurIntensity: 'medium',
    animations: 'full',
    interfaceDensity: 'comfortable',
    fontScale: 1,
    thumbnailShape: 'rounded',
    navigationStyle: 'standard',
    wallpaperEnabled: false,
    wallpaperUri: null,
    playerArtworkBackground: true,
  },

  player: {
    miniPlayerEnabled: true,
    showArtwork: true,
    showVisualizer: false,
    showLyrics: true,
    showQueueButton: true,
    controlsStyle: 'standard',
    progressStyle: 'line',
    artworkShape: 'rounded',
    fullscreenArtwork: true,
    showTrackMetadata: true,
  },

  storage: {
    maxCacheSizeMB: 512,
    autoCleanup: true,
    cleanupThreshold: 80,
    thumbnailCache: true,
    subtitleCache: true,
    backupIncludeAppearance: true,
    backupIncludePlayback: true,
    backupIncludeFolders: true,
    backupIncludePresets: true,
  },

  privacy: {
    appLockEnabled: false,
    biometricEnabled: false,
    hidePrivateFolders: false,
    clearHistoryOnExit: false,
    hideRecentMedia: false,
    hideSensitiveThumbnails: false,
    requireAuthForSettings: false,
  },

  notifications: {
    playbackNotification: true,
    showArtwork: true,
    showControls: true,
    lockScreenControls: true,
    persistent: true,
    removeOnStop: true,
    showProgress: true,
  },

  accessibility: {
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    hapticFeedback: true,
    largeControls: false,
    screenReaderOptimized: false,
    subtitleAccessibility: true,
  },

  advanced: {
    debugOverlay: false,
    loggingLevel: 'error',
    enableExperimental: false,
    collectDiagnostics: false,
    showEngineInfo: false,
    forceSoftwareFallback: false,
    preloadNextMedia: true,
    databaseDiagnostics: false,
  },
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}

/** Immutable canonical defaults. Never mutate; clone before applying. */
export const DEFAULT_SETTINGS: Readonly<DeepPlayerSettings> = deepFreeze(defaults);

/** Structured-clone immutable defaults into a mutable value. */
export function cloneDefaults(): DeepPlayerSettings {
  return structuredClone(defaults);
}
