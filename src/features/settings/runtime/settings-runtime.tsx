/**
 * Bridges canonical settings to the modules that actually do work.
 *
 * Settings screens never call native modules. This component is the single
 * consumer of those APIs: audio session mode, playback preferences, wake lock,
 * orientation, typography, video cache and engine capability reporting.
 */
import { setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { setVideoCacheSizeAsync } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import { FONT_SCALE_FACTORS, resolveFontScaleStep } from '@/features/settings/bridges/font-scale';
import { patchCapabilities } from '@/features/settings/capabilities/capability.registry';
import { reportRuntimeCapabilities } from '@/features/settings/capabilities/runtime-capabilities';
import { useDbStore } from '@/lib/db/store';
import { scanMedia } from '@/lib/library/scan';
import { useFontSizeStore } from '@/stores/font-size-store';
import { registerResumePrompt, usePlayerStore } from '@/stores/player-store';
import { useSortStore } from '@/stores/sort-store';

import { settingsWarn } from './settings-logger';

import { useSettingsStore } from '../store/settings.store';

const KEEP_AWAKE_TAG = 'deep-player-settings';

function clampSpeed(value: number): number {
  return Math.min(4, Math.max(0.25, Number.isFinite(value) ? value : 1));
}

/** `useKeepAwake` must be called unconditionally, so gate it by mounting. */
function KeepAwakeGate() {
  useKeepAwake(KEEP_AWAKE_TAG, { suppressDeactivateWarnings: true });
  return null;
}

/** Applies every behavioral setting without adding Save buttons to the UI. */
export function SettingsRuntime() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const playback = useSettingsStore((s) => s.settings.playback);
  const audio = useSettingsStore((s) => s.settings.audio);
  const appearance = useSettingsStore((s) => s.settings.appearance);
  const accessibility = useSettingsStore((s) => s.settings.accessibility);
  const folders = useSettingsStore((s) => s.settings.folders);
  const privacy = useSettingsStore((s) => s.settings.privacy);
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const advanced = useSettingsStore((s) => s.settings.advanced);
  const storage = useSettingsStore((s) => s.settings.storage);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const setPlaybackPreferences = usePlayerStore((s) => s.setPlaybackPreferences);
  const initialSpeedApplied = useRef(false);

  // Engine capabilities are reported once the native modules are available.
  useEffect(() => {
    reportRuntimeCapabilities();
  }, []);

  // Resume prompts live outside the store so store code stays UI-independent.
  useEffect(() => {
    registerResumePrompt(
      async (track, seconds) =>
        new Promise<boolean>((resolve) => {
          const total = Math.round(seconds);
          const minutes = Math.floor(total / 60);
          const remainder = total % 60;
          const position = `${minutes}m ${remainder}s`;
          Alert.alert(
            'Resume playback?',
            `Continue “${track.title}” from ${position}, or start over?`,
            [
              { text: 'Start over', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Resume', onPress: () => resolve(true) },
            ],
            { cancelable: false },
          );
        }),
    );
    return () => registerResumePrompt(null);
  }, []);

  // Mirror playback/notification preferences into the player engine.
  useEffect(() => {
    if (!hydrated) return;
    setPlaybackPreferences({
      autoPlayNext: playback.autoPlayNext,
      rememberPosition: playback.rememberPosition,
      resumeBehavior: playback.resumeBehavior,
      autoStopAfterCurrent: playback.autoStopAfterCurrent,
      sleepTimerDefault: playback.sleepTimerDefault,
      playbackHistory: playback.playbackHistory,
      preloadNextMedia: advanced.preloadNextMedia,
      notificationControls:
        playback.notificationControls && notifications.playbackNotification,
      removeNotificationOnStop: notifications.removeOnStop,
      notificationOptions: {
        showArtwork: notifications.showArtwork && !privacy.hideSensitiveThumbnails,
        showControls: notifications.showControls,
        showProgress: notifications.showProgress,
      },
    });
  }, [
    hydrated,
    playback.autoPlayNext,
    playback.rememberPosition,
    playback.resumeBehavior,
    playback.autoStopAfterCurrent,
    playback.sleepTimerDefault,
    playback.playbackHistory,
    advanced.preloadNextMedia,
    playback.notificationControls,
    notifications.playbackNotification,
    notifications.showArtwork,
    notifications.showControls,
    notifications.showProgress,
    notifications.removeOnStop,
    privacy.hideSensitiveThumbnails,
    setPlaybackPreferences,
  ]);

  // expo-audio's session mode implements audio focus / ducking / background.
  useEffect(() => {
    if (!hydrated) return;
    const background = playback.backgroundAudio || playback.backgroundVideoAudio;
    const lockScreenActive = playback.notificationControls && notifications.lockScreenControls;
    const interruptionMode = lockScreenActive
      ? 'doNotMix'
      : playback.duckOnInterruption
        ? 'duckOthers'
        : playback.audioFocus === 'strict'
          ? 'doNotMixPersistent'
          : 'mixWithOthers';
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: background,
      interruptionMode,
    }).catch((error) => {
      settingsWarn('Audio mode update failed', error);
    });
  }, [
    hydrated,
    playback.backgroundAudio,
    playback.backgroundVideoAudio,
    playback.audioFocus,
    playback.duckOnInterruption,
    playback.notificationControls,
    notifications.lockScreenControls,
  ]);

  // Default speed reaches the engine; per-media memory stops overwriting a
  // speed the user changed with the player's speed control.
  useEffect(() => {
    if (!hydrated) return;
    const preferred = clampSpeed(audio.defaultSpeed !== 1 ? audio.defaultSpeed : playback.defaultSpeed);
    if (!initialSpeedApplied.current) {
      initialSpeedApplied.current = true;
      if (Math.abs(usePlayerStore.getState().speed - 1) < 0.01) setSpeed(preferred);
      return;
    }
    if (playback.speedMemory === 'global') setSpeed(preferred);
  }, [hydrated, audio.defaultSpeed, playback.defaultSpeed, playback.speedMemory, setSpeed]);

  // Screen wake lock: always, only while playing, or never.
  const keepAwake =
    hydrated &&
    (playback.keepScreenAwake === 'always' ||
      (playback.keepScreenAwake === 'during-playback' && isPlaying));
  // Global orientation preference. "locked" keeps the current device policy.
  useEffect(() => {
    if (!hydrated || Platform.OS === 'web') return;
    const mode = playback.orientation;
    if (mode === 'auto') {
      void ScreenOrientation.unlockAsync().catch(() => undefined);
      return;
    }
    if (mode === 'portrait') {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => undefined);
      return;
    }
    if (mode === 'landscape') {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => undefined);
    }
  }, [hydrated, playback.orientation]);

  // Appearance/accessibility font scale feeds the legacy typography store.
  useEffect(() => {
    if (!hydrated) return;
    const step = resolveFontScaleStep(appearance.fontScale, accessibility.largeText);
    if (useFontSizeStore.getState().fontScale !== step) {
      useFontSizeStore.getState().setFontScale(step);
    }
  }, [hydrated, appearance.fontScale, accessibility.largeText]);

  // Folder sort + smart-folder settings reach the library organizer.
  useEffect(() => {
    if (!hydrated) return;
    const key =
      folders.sortBy === 'name'
        ? folders.sortOrder === 'ascending'
          ? 'title-asc'
          : 'title-desc'
        : folders.sortBy === 'date'
          ? 'recently-added'
          : folders.sortBy === 'size'
            ? 'size-desc'
            : 'duration-desc';
    if (useSortStore.getState().universalSort !== key) {
      useSortStore.getState().setUniversalSort(key);
    }
  }, [hydrated, folders.sortBy, folders.sortOrder]);

  useEffect(() => {
    if (!hydrated) return;
    void useDbStore.getState().load().catch((error) => {
      settingsWarn('Library reload after folder settings change failed', error);
    });
  }, [
    hydrated,
    folders.smartFolders,
    folders.uncertainMatches,
    folders.autoMatchThreshold,
    folders.suggestionThreshold,
  ]);

  // Automated scans funnel through the same queue as manual rescans.
  useEffect(() => {
    if (!hydrated || !folders.autoScan || !folders.scanOnStartup) return;
    void scanMedia('all')
      .then(() => useDbStore.getState().load())
      .catch((error: unknown) => {
        settingsWarn('Startup library scan failed', error);
      });
  }, [hydrated, folders.autoScan, folders.scanOnStartup]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const settings = useSettingsStore.getState().settings.folders;
      if (!settings.autoScan || !settings.backgroundScan) return;
      void scanMedia('all')
        .then(() => useDbStore.getState().load())
        .catch((error: unknown) => {
          settingsWarn('Background library scan failed', error);
        });
    });
    return () => subscription.remove();
  }, []);

  // Privacy: clear recent media and resume positions when the app leaves foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') return;
      if (!useSettingsStore.getState().settings.privacy.clearHistoryOnExit) return;
      void useDbStore
        .getState()
        .clearPlaybackHistory()
        .catch((error: unknown) => {
          settingsWarn('Could not clear playback history', error);
        });
    });
    return () => subscription.remove();
  }, []);

  // Reanimated has only warn/error levels; map verbosity settings onto them.
  useEffect(() => {
    if (!hydrated) return;
    configureReanimatedLogger({
      level:
        advanced.loggingLevel === 'warn' || advanced.loggingLevel === 'debug'
          ? ReanimatedLogLevel.warn
          : ReanimatedLogLevel.error,
      strict: advanced.loggingLevel === 'debug',
    });
  }, [hydrated, advanced.loggingLevel]);

  // The advanced software fallback downgrades reported decoding capability.
  // expo-video never exposes a decoder choice, so turning this off cannot
  // re-enable a capability the engine did not report.
  useEffect(() => {
    if (!hydrated || !advanced.forceSoftwareFallback) return;
    patchCapabilities({ video: { hardwareDecoding: false, softwareDecoding: true } });
  }, [hydrated, advanced.forceSoftwareFallback]);

  // The expo-video cache is configured in bytes; this never touches media files.
  useEffect(() => {
    if (!hydrated || Platform.OS === 'web' || storage.maxCacheSizeMB <= 0) return;
    void setVideoCacheSizeAsync(storage.maxCacheSizeMB * 1024 * 1024).catch((error: unknown) => {
      settingsWarn('Video cache size update failed', error);
    });
  }, [hydrated, storage.maxCacheSizeMB]);

  return <>{keepAwake ? <KeepAwakeGate /> : null}</>;
}

/** Exposed for tests/diagnostics. */
export const FONT_SCALE_FACTOR_VALUES = FONT_SCALE_FACTORS;
