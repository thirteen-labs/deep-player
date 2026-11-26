/**
 * Global settings search registry (spec §8).
 * EVERY searchable setting registers here. Search works completely offline.
 */
export type SettingType =
  | 'boolean'
  | 'number'
  | 'slider'
  | 'enum'
  | 'string'
  | 'color'
  | 'action'
  | 'equalizer';

export interface SettingSearchEntry {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  route: string;
  type: SettingType;
}

/* ---- Routes (Expo Router, app/(tabs)+settings → /settings/...) ---- */
export const SETTINGS_ROUTES = {
  home: '/settings',
  search: '/settings/search',
  playbackGeneral: '/settings/playback/general',
  playbackInterruptions: '/settings/playback/interruptions',
  playbackBackground: '/settings/playback/background',
  videoDisplay: '/settings/video/display',
  videoGestures: '/settings/video/gestures',
  videoSubtitles: '/settings/video/subtitles',
  videoAdvanced: '/settings/video/advanced',
  audio: '/settings/audio',
  audioEqualizer: '/settings/audio/equalizer',
  audioEffects: '/settings/audio/effects',
  audioOutput: '/settings/audio/output',
  foldersScanning: '/settings/folders/scanning',
  foldersSmart: '/settings/folders/smart-folders',
  foldersExclusions: '/settings/folders/exclusions',
  foldersOrganization: '/settings/folders/organization',
  appearanceThemes: '/settings/appearance/themes',
  appearanceColors: '/settings/appearance/colors',
  appearanceInterface: '/settings/appearance/interface',
  appearancePlayer: '/settings/appearance/player',
  storageCache: '/settings/storage/cache',
  storageDatabase: '/settings/storage/database',
  storageBackup: '/settings/storage/backup',
  privacyAppLock: '/settings/privacy/app-lock',
  privacyPrivateFolders: '/settings/privacy/private-folders',
  notifications: '/settings/notifications',
  accessibility: '/settings/accessibility',
  advancedEngine: '/settings/advanced/engine',
  advancedPerformance: '/settings/advanced/performance',
  advancedDiagnostics: '/settings/advanced/diagnostics',
  advancedDeveloper: '/settings/advanced/developer',
  about: '/settings/about',
} as const;

type Entry = SettingSearchEntry;

const e = (
  id: string,
  title: string,
  description: string,
  category: string,
  route: string,
  type: SettingType,
  keywords: string[] = [],
): Entry => ({ id, title, description, keywords, category, route, type });

const PB = 'Playback';
const VID = 'Video';
const AUD = 'Audio';
const FOL = 'Folders & Organization';
const APP = 'Appearance';
const PLY = 'Player';
const STR = 'Storage & Backup';
const PRI = 'Privacy & Security';
const NOT = 'Notifications';
const ACC = 'Accessibility';
const ADV = 'Advanced';

export const SETTINGS_REGISTRY: SettingSearchEntry[] = [
  /* ---- 4.1 General playback ---- */
  e('playback.autoPlayNext', 'Autoplay next', 'Automatically play the next item when one ends.', PB, SETTINGS_ROUTES.playbackGeneral, 'boolean', ['auto play', 'next', 'continuous']),
  e('playback.rememberPosition', 'Remember position', 'Resume where you left off.', PB, SETTINGS_ROUTES.playbackGeneral, 'boolean', ['resume', 'position', 'bookmark']),
  e('playback.resumeBehavior', 'Resume behavior', 'Always resume, ask, or never resume.', PB, SETTINGS_ROUTES.playbackGeneral, 'enum', ['always', 'ask', 'never']),
  e('playback.defaultSpeed', 'Default speed', 'Default playback speed (0.25-4.0).', PB, SETTINGS_ROUTES.playbackGeneral, 'slider', ['speed', 'rate', 'tempo']),
  e('playback.speedMemory', 'Speed memory', 'Remember speed globally or per media.', PB, SETTINGS_ROUTES.playbackGeneral, 'enum', ['global', 'per-media']),
  e('playback.keepScreenAwake', 'Keep screen awake', 'Prevent the screen sleeping.', PB, SETTINGS_ROUTES.playbackGeneral, 'enum', ['awake', 'screen', 'sleep']),
  e('playback.sleepTimerDefault', 'Sleep timer default', 'Default sleep timer in minutes (0-180).', PB, SETTINGS_ROUTES.playbackGeneral, 'number', ['sleep', 'timer']),
  e('playback.playbackHistory', 'Playback history', 'Record playback history.', PB, SETTINGS_ROUTES.playbackGeneral, 'boolean', ['history', 'recent']),
  e('playback.autoStopAfterCurrent', 'Auto-stop after current', 'Stop after the current item.', PB, SETTINGS_ROUTES.playbackGeneral, 'boolean', ['stop']),
  e('playback.orientation', 'Orientation', 'Screen orientation.', PB, SETTINGS_ROUTES.playbackGeneral, 'enum', ['auto', 'portrait', 'landscape', 'locked']),
  e('playback.audioFocus', 'Audio focus', 'Audio focus behavior.', PB, SETTINGS_ROUTES.playbackInterruptions, 'enum', ['focus', 'automatic', 'strict']),

  /* ---- 4.2 Interruptions and background ---- */
  e('playback.continueAfterInterruption', 'Continue after interruption', 'Resume after an interruption ends.', PB, SETTINGS_ROUTES.playbackInterruptions, 'boolean', ['interruption', 'resume']),
  e('playback.pauseOnHeadphoneDisconnect', 'Pause on headphone disconnect', 'Pause when headphones are removed.', PB, SETTINGS_ROUTES.playbackInterruptions, 'boolean', ['headphones', 'disconnect', 'pause']),
  e('playback.resumeOnHeadphoneConnect', 'Resume on headphone connect', 'Resume when headphones are connected.', PB, SETTINGS_ROUTES.playbackInterruptions, 'boolean', ['headphones', 'connect', 'resume']),
  e('playback.pauseOnCall', 'Pause on call', 'Pause during phone calls.', PB, SETTINGS_ROUTES.playbackInterruptions, 'boolean', ['call', 'pause']),
  e('playback.duckOnInterruption', 'Duck on interruption', 'Lower volume during interruptions.', PB, SETTINGS_ROUTES.playbackInterruptions, 'boolean', ['duck', 'volume', 'interruption']),
  e('playback.backgroundAudio', 'Background audio', 'Keep audio playing in the background.', PB, SETTINGS_ROUTES.playbackBackground, 'boolean', ['background', 'audio']),
  e('playback.backgroundVideoAudio', 'Background video audio', 'Play a video’s audio in the background.', PB, SETTINGS_ROUTES.playbackBackground, 'boolean', ['background', 'video', 'audio']),
  e('playback.stopWhenTaskRemoved', 'Stop when task removed', 'Stop playback when app task is removed.', PB, SETTINGS_ROUTES.playbackBackground, 'boolean', ['stop', 'task']),
  e('playback.notificationControls', 'Notification controls', 'Show playback notification controls.', PB, SETTINGS_ROUTES.playbackBackground, 'boolean', ['notification', 'controls']),

  /* ---- 4.3 Video ---- */
  e('video.decoder', 'Decoder', 'Video decoder selection.', VID, SETTINGS_ROUTES.videoAdvanced, 'enum', ['auto', 'hardware', 'software']),
  e('video.aspectRatio', 'Aspect ratio', 'Video aspect ratio.', VID, SETTINGS_ROUTES.videoDisplay, 'enum', ['fit', 'fill', 'crop', 'stretch']),
  e('video.orientation', 'Video orientation', 'Video orientation.', VID, SETTINGS_ROUTES.videoDisplay, 'enum', ['auto', 'portrait', 'landscape']),
  e('video.fullscreenOnPlay', 'Fullscreen on play', 'Enter fullscreen when playing.', VID, SETTINGS_ROUTES.videoDisplay, 'boolean', ['fullscreen']),
  e('video.autoHideControls', 'Auto-hide controls', 'Auto-hide controls after ms (1000-15000).', VID, SETTINGS_ROUTES.videoDisplay, 'slider', ['hide', 'controls']),
  e('video.brightnessGestures', 'Brightness gestures', 'Brightness gesture control.', VID, SETTINGS_ROUTES.videoGestures, 'boolean', ['brightness', 'gesture']),
  e('video.volumeGestures', 'Volume gestures', 'Volume gesture control.', VID, SETTINGS_ROUTES.videoGestures, 'boolean', ['volume', 'gesture']),
  e('video.seekGestures', 'Seek gestures', 'Seek gesture control.', VID, SETTINGS_ROUTES.videoGestures, 'boolean', ['seek', 'gesture']),
  e('video.doubleTapSeek', 'Double-tap seek', 'Double-tap seek seconds (5/10/15/30/60).', VID, SETTINGS_ROUTES.videoGestures, 'enum', ['double tap', 'seek']),
  e('video.pipEnabled', 'Picture-in-Picture', 'Allow PiP floating window.', VID, SETTINGS_ROUTES.videoDisplay, 'boolean', ['pip', 'picture in picture']),
  e('video.frameRateMode', 'Frame-rate mode', 'Frame-rate mode.', VID, SETTINGS_ROUTES.videoAdvanced, 'enum', ['original', 'display', 'auto']),
  e('video.hardwareAcceleration', 'Hardware acceleration', 'Use hardware acceleration.', VID, SETTINGS_ROUTES.videoAdvanced, 'boolean', ['hardware', 'acceleration']),
  e('video.zoomMode', 'Zoom mode', 'Video zoom mode.', VID, SETTINGS_ROUTES.videoDisplay, 'enum', ['fit', 'fill', 'zoom']),
  e('video.rotationLock', 'Rotation lock', 'Lock screen rotation.', VID, SETTINGS_ROUTES.videoDisplay, 'boolean', ['rotation', 'lock']),
  e('video.showStatusBar', 'Show status bar', 'Show the status bar.', VID, SETTINGS_ROUTES.videoDisplay, 'boolean', ['status bar']),
  e('video.showNavigationBar', 'Show navigation bar', 'Show the navigation bar.', VID, SETTINGS_ROUTES.videoDisplay, 'boolean', ['navigation bar']),

  /* ---- 4.4 Subtitles ---- */
  e('video.subtitles.enabled', 'Subtitles', 'Enable subtitles.', VID, SETTINGS_ROUTES.videoSubtitles, 'boolean', ['captions', 'subtitles', 'srt']),
  e('video.subtitles.autoLoad', 'Auto-load subtitles', 'Automatically load available subtitle files.', VID, SETTINGS_ROUTES.videoSubtitles, 'boolean', ['captions', 'srt', 'subtitle', 'auto load']),
  e('video.subtitles.preferredLanguage', 'Subtitle language', 'Set preferred subtitle language.', VID, SETTINGS_ROUTES.videoSubtitles, 'string', ['language', 'captions']),
  e('video.subtitles.fontSize', 'Subtitle font size', 'Change subtitle text size (50-200%).', VID, SETTINGS_ROUTES.videoSubtitles, 'slider', ['font', 'size', 'text']),
  e('video.subtitles.textColor', 'Subtitle text color', 'Subtitle text color.', VID, SETTINGS_ROUTES.videoSubtitles, 'color', ['color', 'text']),
  e('video.subtitles.backgroundOpacity', 'Subtitle background opacity', 'Subtitle background opacity (0-100%).', VID, SETTINGS_ROUTES.videoSubtitles, 'slider', ['opacity', 'background']),
  e('video.subtitles.bold', 'Bold subtitles', 'Bold subtitle text.', VID, SETTINGS_ROUTES.videoSubtitles, 'boolean', ['bold']),
  e('video.subtitles.outline', 'Subtitle outline', 'Subtitle outline.', VID, SETTINGS_ROUTES.videoSubtitles, 'boolean', ['outline']),
  e('video.subtitles.verticalOffset', 'Subtitle vertical offset', 'Subtitle vertical offset (-100 to 100).', VID, SETTINGS_ROUTES.videoSubtitles, 'slider', ['offset', 'position']),
  e('video.subtitles.syncOffset', 'Subtitle synchronization', 'Adjust subtitle timing (-10000 to 10000 ms).', VID, SETTINGS_ROUTES.videoSubtitles, 'slider', ['sync', 'timing', 'offset']),

  /* ---- 4.5 Audio ---- */
  e('audio.defaultSpeed', 'Audio default speed', 'Default audio speed (0.25-4.0).', AUD, SETTINGS_ROUTES.audio, 'slider', ['speed']),
  e('audio.gapless', 'Gapless playback', 'Gapless playback.', AUD, SETTINGS_ROUTES.audio, 'boolean', ['gapless']),
  e('audio.crossfadeEnabled', 'Crossfade', 'Enable crossfade.', AUD, SETTINGS_ROUTES.audioEffects, 'boolean', ['crossfade']),
  e('audio.crossfadeDuration', 'Crossfade duration', 'Crossfade duration seconds (0-12).', AUD, SETTINGS_ROUTES.audioEffects, 'slider', ['crossfade', 'duration']),
  e('audio.replayGain', 'ReplayGain', 'ReplayGain volume normalization.', AUD, SETTINGS_ROUTES.audioOutput, 'boolean', ['replaygain', 'normalize']),
  e('audio.volumeNormalization', 'Volume normalization', 'Normalize volume.', AUD, SETTINGS_ROUTES.audioOutput, 'boolean', ['normalization', 'volume']),
  e('audio.monoAudio', 'Mono audio', 'Downmix to mono.', AUD, SETTINGS_ROUTES.audioOutput, 'boolean', ['mono']),
  e('audio.balance', 'Balance', 'Left/right balance (-1 to 1).', AUD, SETTINGS_ROUTES.audioOutput, 'slider', ['balance', 'stereo']),
  e('audio.fadeOnPause', 'Fade on pause', 'Fade on pause.', AUD, SETTINGS_ROUTES.audioEffects, 'boolean', ['fade', 'pause']),
  e('audio.visualizerEnabled', 'Visualizer', 'Audio visualizer.', AUD, SETTINGS_ROUTES.audioEffects, 'boolean', ['visualizer']),
  e('audio.equalizerEnabled', 'Equalizer', 'Enable equalizer.', AUD, SETTINGS_ROUTES.audioEqualizer, 'boolean', ['equalizer', 'eq']),
  e('audio.equalizerPreset', 'Equalizer preset', 'Equalizer preset.', AUD, SETTINGS_ROUTES.audioEqualizer, 'enum', ['preset', 'equalizer']),
  e('audio.equalizerBands', 'Equalizer bands', '10-band equalizer gains (-12 to +12 dB).', AUD, SETTINGS_ROUTES.audioEqualizer, 'equalizer', ['bands', 'eq']),
  e('audio.bassBoost', 'Bass boost', 'Bass boost (0-100).', AUD, SETTINGS_ROUTES.audioEffects, 'slider', ['bass']),
  e('audio.virtualizer', 'Virtualizer', 'Virtualizer (0-100).', AUD, SETTINGS_ROUTES.audioEffects, 'slider', ['virtualizer', 'surround']),

  /* ---- 4.6 Folders and organization ---- */
  e('folders.autoScan', 'Auto scan', 'Automatically scan folders.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['scan']),
  e('folders.scanOnStartup', 'Scan on startup', 'Scan on app startup.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['startup', 'scan']),
  e('folders.backgroundScan', 'Background scan', 'Scan in the background.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['background', 'scan']),
  e('folders.includeHidden', 'Include hidden', 'Include hidden files/folders.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['hidden']),
  e('folders.showEmpty', 'Show empty', 'Show empty folders.', FOL, SETTINGS_ROUTES.foldersOrganization, 'boolean', ['empty']),
  e('folders.detectDuplicates', 'Detect duplicates', 'Detect duplicate media.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['duplicates']),
  e('folders.generateThumbnails', 'Generate thumbnails', 'Generate thumbnails.', FOL, SETTINGS_ROUTES.foldersScanning, 'boolean', ['thumbnails']),
  e('folders.thumbnailQuality', 'Thumbnail quality', 'Thumbnail quality.', FOL, SETTINGS_ROUTES.foldersScanning, 'enum', ['low', 'medium', 'high']),
  e('folders.sortBy', 'Sort by', 'Sort folders by.', FOL, SETTINGS_ROUTES.foldersOrganization, 'enum', ['name', 'date', 'size', 'duration']),
  e('folders.sortOrder', 'Sort order', 'Ascending or descending.', FOL, SETTINGS_ROUTES.foldersOrganization, 'enum', ['ascending', 'descending']),
  e('folders.smartFolders', 'Smart folders', 'Smart-folder mode.', FOL, SETTINGS_ROUTES.foldersSmart, 'enum', ['both', 'manual', 'automatic']),
  e('folders.uncertainMatches', 'Uncertain matches', 'Suggest or ignore uncertain matches.', FOL, SETTINGS_ROUTES.foldersSmart, 'enum', ['suggest', 'ignore']),
  e('folders.autoMerge', 'Auto merge', 'Automatically merge high-confidence matches.', FOL, SETTINGS_ROUTES.foldersSmart, 'boolean', ['merge']),
  e('folders.rememberRejectedMatches', 'Remember rejected matches', 'Remember rejected user decisions.', FOL, SETTINGS_ROUTES.foldersSmart, 'boolean', ['rejected', 'remember']),
  e('folders.seasonDetection', 'Season detection', 'Detect series seasons.', FOL, SETTINGS_ROUTES.foldersSmart, 'boolean', ['season']),
  e('folders.episodeDetection', 'Episode detection', 'Detect episodes.', FOL, SETTINGS_ROUTES.foldersSmart, 'boolean', ['episode']),
  e('folders.autoMatchThreshold', 'Auto-match threshold', 'Confidence for automatic grouping (0-100).', FOL, SETTINGS_ROUTES.foldersSmart, 'slider', ['threshold', 'confidence']),
  e('folders.suggestionThreshold', 'Suggestion threshold', 'Confidence for suggesting approval (0-100).', FOL, SETTINGS_ROUTES.foldersSmart, 'slider', ['threshold', 'confidence']),

  /* ---- 4.7 Appearance ---- */
  e('appearance.mode', 'Appearance mode', 'Light, dark or system.', APP, SETTINGS_ROUTES.appearanceThemes, 'enum', ['dark mode', 'light', 'theme']),
  e('appearance.themeId', 'App theme', 'Change the application theme.', APP, SETTINGS_ROUTES.appearanceThemes, 'string', ['color', 'dark mode', 'style', 'theme']),
  e('appearance.accentColor', 'Accent color', 'App accent color.', APP, SETTINGS_ROUTES.appearanceColors, 'color', ['color', 'accent', 'tint']),
  e('appearance.dynamicColors', 'Dynamic colors', 'Derive colors dynamically.', APP, SETTINGS_ROUTES.appearanceColors, 'boolean', ['dynamic', 'color']),
  e('appearance.dynamicColorSource', 'Dynamic color source', 'Album art or system.', APP, SETTINGS_ROUTES.appearanceColors, 'enum', ['album-art', 'system']),
  e('appearance.backgroundStyle', 'Background style', 'Solid, gradient or glass.', APP, SETTINGS_ROUTES.appearanceColors, 'enum', ['solid', 'gradient', 'glass']),
  e('appearance.blurIntensity', 'Blur intensity', 'Glass blur intensity.', APP, SETTINGS_ROUTES.appearanceInterface, 'enum', ['off', 'low', 'medium', 'high']),
  e('appearance.animations', 'Animations', 'Full, reduced or off.', APP, SETTINGS_ROUTES.appearanceInterface, 'enum', ['full', 'reduced', 'off', 'motion']),
  e('appearance.interfaceDensity', 'Interface density', 'Compact or comfortable.', APP, SETTINGS_ROUTES.appearanceInterface, 'enum', ['compact', 'comfortable']),
  e('appearance.fontScale', 'Font scale', 'Text size scale.', APP, SETTINGS_ROUTES.appearanceInterface, 'slider', ['font', 'size', 'scale', 'text']),
  e('appearance.thumbnailShape', 'Thumbnail shape', 'Rounded or square.', APP, SETTINGS_ROUTES.appearanceInterface, 'enum', ['rounded', 'square']),
  e('appearance.navigationStyle', 'Navigation style', 'Compact or standard.', APP, SETTINGS_ROUTES.appearanceInterface, 'enum', ['compact', 'standard']),
  e('appearance.wallpaperEnabled', 'Wallpaper', 'Enable wallpaper.', APP, SETTINGS_ROUTES.appearanceColors, 'boolean', ['wallpaper']),
  e('appearance.playerArtworkBackground', 'Player artwork background', 'Use artwork as player background.', APP, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['artwork', 'background']),

  /* ---- 4.8 Player customization ---- */
  e('player.miniPlayerEnabled', 'Mini player', 'Show mini player.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['mini', 'player']),
  e('player.showArtwork', 'Show artwork', 'Show artwork.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['artwork']),
  e('player.showVisualizer', 'Show visualizer', 'Show visualizer.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['visualizer']),
  e('player.showLyrics', 'Show lyrics', 'Show lyrics.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['lyrics']),
  e('player.showQueueButton', 'Show queue button', 'Show queue button.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['queue']),
  e('player.controlsStyle', 'Controls style', 'Minimal, standard or expanded.', PLY, SETTINGS_ROUTES.appearancePlayer, 'enum', ['minimal', 'standard', 'expanded']),
  e('player.progressStyle', 'Progress style', 'Line or waveform.', PLY, SETTINGS_ROUTES.appearancePlayer, 'enum', ['line', 'waveform']),
  e('player.artworkShape', 'Artwork shape', 'Rounded, square or circle.', PLY, SETTINGS_ROUTES.appearancePlayer, 'enum', ['rounded', 'square', 'circle']),
  e('player.fullscreenArtwork', 'Fullscreen artwork', 'Fullscreen artwork.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['fullscreen', 'artwork']),
  e('player.showTrackMetadata', 'Show track metadata', 'Show track metadata.', PLY, SETTINGS_ROUTES.appearancePlayer, 'boolean', ['metadata']),

  /* ---- 4.9 Storage and backup ---- */
  e('storage.maxCacheSizeMB', 'Max cache size', 'Maximum cache size MB.', STR, SETTINGS_ROUTES.storageCache, 'number', ['cache', 'size']),
  e('storage.autoCleanup', 'Auto cleanup', 'Automatically clean cache.', STR, SETTINGS_ROUTES.storageCache, 'boolean', ['cleanup', 'cache']),
  e('storage.cleanupThreshold', 'Cleanup threshold', 'Cleanup threshold percent.', STR, SETTINGS_ROUTES.storageCache, 'number', ['threshold']),
  e('storage.thumbnailCache', 'Thumbnail cache', 'Cache thumbnails.', STR, SETTINGS_ROUTES.storageCache, 'boolean', ['thumbnail', 'cache']),
  e('storage.subtitleCache', 'Subtitle cache', 'Cache subtitles.', STR, SETTINGS_ROUTES.storageCache, 'boolean', ['subtitle', 'cache']),
  e('storage.backupIncludeAppearance', 'Backup appearance', 'Include appearance in backup.', STR, SETTINGS_ROUTES.storageBackup, 'boolean', ['backup', 'appearance']),
  e('storage.backupIncludePlayback', 'Backup playback', 'Include playback in backup.', STR, SETTINGS_ROUTES.storageBackup, 'boolean', ['backup', 'playback']),
  e('storage.backupIncludeFolders', 'Backup folders', 'Include folders in backup.', STR, SETTINGS_ROUTES.storageBackup, 'boolean', ['backup', 'folders']),
  e('storage.backupIncludePresets', 'Backup presets', 'Include presets in backup.', STR, SETTINGS_ROUTES.storageBackup, 'boolean', ['backup', 'presets']),

  /* ---- 4.10 Privacy and security ---- */
  e('privacy.appLockEnabled', 'App lock', 'Require authentication to open app.', PRI, SETTINGS_ROUTES.privacyAppLock, 'boolean', ['lock', 'pin', 'biometric']),
  e('privacy.biometricEnabled', 'Biometric', 'Use biometric authentication.', PRI, SETTINGS_ROUTES.privacyAppLock, 'boolean', ['biometric', 'fingerprint', 'face']),
  e('privacy.hidePrivateFolders', 'Hide private folders', 'Hide private folders.', PRI, SETTINGS_ROUTES.privacyPrivateFolders, 'boolean', ['private', 'hide']),
  e('privacy.clearHistoryOnExit', 'Clear history on exit', 'Clear history on exit.', PRI, SETTINGS_ROUTES.privacyPrivateFolders, 'boolean', ['history', 'clear']),
  e('privacy.hideRecentMedia', 'Hide recent media', 'Hide recent media.', PRI, SETTINGS_ROUTES.privacyPrivateFolders, 'boolean', ['recent', 'hide']),
  e('privacy.hideSensitiveThumbnails', 'Hide sensitive thumbnails', 'Hide sensitive thumbnails.', PRI, SETTINGS_ROUTES.privacyPrivateFolders, 'boolean', ['sensitive', 'thumbnail']),
  e('privacy.requireAuthForSettings', 'Require auth for settings', 'Require authentication for settings.', PRI, SETTINGS_ROUTES.privacyAppLock, 'boolean', ['auth', 'settings']),

  /* ---- 4.11 Notifications ---- */
  e('notifications.playbackNotification', 'Playback notification', 'Show playback notification.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['notification', 'playback']),
  e('notifications.showArtwork', 'Show artwork', 'Show artwork in notification.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['artwork']),
  e('notifications.showControls', 'Show controls', 'Show controls in notification.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['controls']),
  e('notifications.lockScreenControls', 'Lock screen controls', 'Show lock-screen controls.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['lock screen']),
  e('notifications.persistent', 'Persistent', 'Persistent notification.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['persistent']),
  e('notifications.removeOnStop', 'Remove on stop', 'Remove notification on stop.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['remove', 'stop']),
  e('notifications.showProgress', 'Show progress', 'Show progress in notification.', NOT, SETTINGS_ROUTES.notifications, 'boolean', ['progress']),

  /* ---- 4.12 Accessibility ---- */
  e('accessibility.largeText', 'Large text', 'Larger text.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['text', 'large']),
  e('accessibility.highContrast', 'High contrast', 'High contrast.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['contrast']),
  e('accessibility.reducedMotion', 'Reduced motion', 'Reduce motion.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['motion', 'reduce']),
  e('accessibility.hapticFeedback', 'Haptic feedback', 'Haptic feedback.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['haptic', 'vibration']),
  e('accessibility.largeControls', 'Large controls', 'Larger controls.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['controls', 'large']),
  e('accessibility.screenReaderOptimized', 'Screen reader optimized', 'Optimize for screen readers.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['screen reader', 'talkback', 'voiceover']),
  e('accessibility.subtitleAccessibility', 'Subtitle accessibility', 'Accessible subtitles.', ACC, SETTINGS_ROUTES.accessibility, 'boolean', ['subtitle']),

  /* ---- 4.13 Advanced ---- */
  e('advanced.debugOverlay', 'Debug overlay', 'Show debug overlay.', ADV, SETTINGS_ROUTES.advancedDeveloper, 'boolean', ['debug']),
  e('advanced.loggingLevel', 'Logging level', 'Logging verbosity.', ADV, SETTINGS_ROUTES.advancedDiagnostics, 'enum', ['none', 'error', 'warn', 'debug']),
  e('advanced.enableExperimental', 'Experimental features', 'Enable experimental features.', ADV, SETTINGS_ROUTES.advancedDeveloper, 'boolean', ['experimental']),
  e('advanced.collectDiagnostics', 'Collect diagnostics', 'Collect diagnostics.', ADV, SETTINGS_ROUTES.advancedDiagnostics, 'boolean', ['diagnostics']),
  e('advanced.showEngineInfo', 'Show engine info', 'Show engine info.', ADV, SETTINGS_ROUTES.advancedEngine, 'boolean', ['engine', 'info']),
  e('advanced.forceSoftwareFallback', 'Force software fallback', 'Force software decoding fallback.', ADV, SETTINGS_ROUTES.advancedEngine, 'boolean', ['software', 'fallback']),
  e('advanced.preloadNextMedia', 'Preload next media', 'Preload next media.', ADV, SETTINGS_ROUTES.advancedPerformance, 'boolean', ['preload', 'next']),
  e('advanced.databaseDiagnostics', 'Database diagnostics', 'Database diagnostics.', ADV, SETTINGS_ROUTES.advancedDiagnostics, 'boolean', ['database', 'diagnostics']),
];

/** Fast lookup by id. */
export const SETTINGS_BY_ID: Record<string, SettingSearchEntry> = Object.fromEntries(
  SETTINGS_REGISTRY.map((entry) => [entry.id, entry]),
);
