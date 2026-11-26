/**
 * Playback engine capability contract (spec §11).
 * Capabilities are reported by the actual native engine and platform —
 * Deep Player must not assume every feature exists.
 */
export interface PlayerCapabilities {
  audio: {
    backgroundPlayback: boolean;
    gapless: boolean;
    crossfade: boolean;
    equalizer: boolean;
    replayGain: boolean;
    volumeNormalization: boolean;
    audioEffects: boolean;
  };

  video: {
    hardwareDecoding: boolean;
    softwareDecoding: boolean;
    pictureInPicture: boolean;
    subtitles: boolean;
    externalSubtitles: boolean;
    /** expo-video exposes track selection but no font/colour/position styling. */
    subtitleStyling: boolean;
    playbackSpeed: boolean;
    rotation: boolean;
    /** The installed player exposes no public gesture layer. */
    gestureControls: boolean;
  };

  system: {
    foregroundService: boolean;
    mediaNotifications: boolean;
    lockScreenControls: boolean;
    backgroundAudio: boolean;
    /** Android exposes a controllable system navigation bar. */
    navigationBar: boolean;
    /** Native platforms expose a controllable status bar. */
    statusBar: boolean;
    /** No private-folder/vault model exists yet. */
    privateFolders: boolean;
    /** expo-media-library exposes no local thumbnail generator. */
    thumbnailGeneration: boolean;
  };
}

export type CapabilitySection = keyof PlayerCapabilities;
export type CapabilityKey =
  | `audio.${keyof PlayerCapabilities['audio']}`
  | `video.${keyof PlayerCapabilities['video']}`
  | `system.${keyof PlayerCapabilities['system']}`;

export interface CapabilityInfo {
  supported: boolean;
  /** Human-readable reason shown when unsupported. */
  reason?: string;
}

/**
 * Maps a settings id to the engine capability that must exist for the control
 * to do anything real. Settings not in this map are pure app preferences.
 */
export const SETTING_CAPABILITY_MAP: Partial<Record<string, CapabilityKey>> = {
  // audio
  'audio.gapless': 'audio.gapless',
  'audio.crossfadeEnabled': 'audio.crossfade',
  'audio.crossfadeDuration': 'audio.crossfade',
  'audio.replayGain': 'audio.replayGain',
  'audio.volumeNormalization': 'audio.volumeNormalization',
  'audio.equalizerEnabled': 'audio.equalizer',
  'audio.equalizerPreset': 'audio.equalizer',
  'audio.equalizerBands': 'audio.equalizer',
  'audio.bassBoost': 'audio.audioEffects',
  'audio.virtualizer': 'audio.audioEffects',
  'audio.monoAudio': 'audio.audioEffects',
  'audio.balance': 'audio.audioEffects',
  'audio.visualizerEnabled': 'audio.audioEffects',
  'playback.backgroundAudio': 'audio.backgroundPlayback',
  'playback.backgroundVideoAudio': 'system.backgroundAudio',
  'playback.notificationControls': 'system.mediaNotifications',
  // video
  'video.decoder': 'video.hardwareDecoding',
  'video.hardwareAcceleration': 'video.hardwareDecoding',
  'video.pipEnabled': 'video.pictureInPicture',
  'video.subtitles.enabled': 'video.subtitles',
  'video.subtitles.autoLoad': 'video.subtitles',
  'video.subtitles.fontSize': 'video.subtitleStyling',
  'video.subtitles.textColor': 'video.subtitleStyling',
  'video.subtitles.backgroundOpacity': 'video.subtitleStyling',
  'video.subtitles.bold': 'video.subtitleStyling',
  'video.subtitles.outline': 'video.subtitleStyling',
  'video.subtitles.verticalOffset': 'video.subtitleStyling',
  'video.subtitles.syncOffset': 'video.subtitleStyling',
  'player.showLyrics': 'video.subtitles',
  'playback.orientation': 'video.rotation',
  'video.orientation': 'video.rotation',
  'video.rotationLock': 'video.rotation',
  'video.brightnessGestures': 'video.gestureControls',
  'video.volumeGestures': 'video.gestureControls',
  'video.seekGestures': 'video.gestureControls',
  'video.showNavigationBar': 'system.navigationBar',
  'video.showStatusBar': 'system.statusBar',
  'playback.defaultSpeed': 'video.playbackSpeed',
  'audio.defaultSpeed': 'video.playbackSpeed',
  // notifications / system
  'notifications.playbackNotification': 'system.mediaNotifications',
  'notifications.lockScreenControls': 'system.lockScreenControls',
  'notifications.showControls': 'system.mediaNotifications',
  'notifications.showArtwork': 'system.mediaNotifications',
  'notifications.showProgress': 'system.mediaNotifications',
  'playback.stopWhenTaskRemoved': 'system.foregroundService',
  'notifications.persistent': 'system.foregroundService',
  'privacy.hidePrivateFolders': 'system.privateFolders',
  'accessibility.subtitleAccessibility': 'video.subtitleStyling',
  // folders / storage
  'folders.generateThumbnails': 'system.thumbnailGeneration',
  'folders.thumbnailQuality': 'system.thumbnailGeneration',
};
