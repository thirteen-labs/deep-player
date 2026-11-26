/**
 * Runtime capability detection (spec §11).
 *
 * The settings UI never calls native playback modules directly. This is the
 * single bridge that inspects the installed native engine and app config, then
 * reports the result to the capability registry. Features that the current
 * engine does not actually implement stay false even if a preference exists.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isPictureInPictureSupported } from 'expo-video';

import { CONSERVATIVE_CAPABILITIES, reportCapabilities } from './capability.registry';
import type { PlayerCapabilities } from './capability.types';

type PluginEntry = string | [string, Record<string, unknown>?];

function pluginConfig(name: string): Record<string, unknown> | undefined {
  const plugins = Constants.expoConfig?.plugins as PluginEntry[] | undefined;
  const entry = plugins?.find((plugin) => Array.isArray(plugin) && plugin[0] === name);
  return Array.isArray(entry) ? entry[1] : undefined;
}

function isTrue(value: unknown): boolean {
  return value === true;
}

/** Detect what the installed build can really do. Never throws. */
export function detectRuntimeCapabilities(): PlayerCapabilities {
  try {
    const audioConfig = pluginConfig('expo-audio');
    const videoConfig = pluginConfig('expo-video');
    const backgroundAudio = isTrue(audioConfig?.enableBackgroundPlayback);
    const pipConfigured = isTrue(videoConfig?.supportsPictureInPicture);
    const pipSupported =
      Platform.OS !== 'web' &&
      pipConfigured &&
      typeof isPictureInPictureSupported === 'function' &&
      isPictureInPictureSupported();

    return {
      ...CONSERVATIVE_CAPABILITIES,
      audio: {
        ...CONSERVATIVE_CAPABILITIES.audio,
        // expo-audio can play in the background when the config plugin enables it.
        backgroundPlayback: backgroundAudio,
        // expo-audio has no public gapless/crossfade/EQ/ReplayGain engine yet.
      },
      video: {
        ...CONSERVATIVE_CAPABILITIES.video,
        pictureInPicture: pipSupported,
        // expo-video exposes subtitle track selection but not arbitrary styling,
        // decoder selection, or a custom touch-gesture layer.
        subtitles: true,
        externalSubtitles: true,
        hardwareDecoding: false,
        gestureControls: false,
      },
      system: {
        ...CONSERVATIVE_CAPABILITIES.system,
        foregroundService: Platform.OS === 'android' && backgroundAudio,
        mediaNotifications: backgroundAudio,
        lockScreenControls: true,
        backgroundAudio,
        navigationBar: Platform.OS === 'android',
        statusBar: Platform.OS !== 'web',
        privateFolders: false,
      },
    };
  } catch {
    // A failed probe must leave the conservative baseline in place.
    return { ...CONSERVATIVE_CAPABILITIES };
  }
}

/** Publish detected capabilities to every settings screen. */
export function reportRuntimeCapabilities(): PlayerCapabilities {
  const detected = detectRuntimeCapabilities();
  reportCapabilities(detected);
  return detected;
}
