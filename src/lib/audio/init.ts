import { setAudioModeAsync } from 'expo-audio';

/**
 * Configures the app-wide audio session once at startup:
 * - plays even when the phone is on silent
 * - lets playback continue in the background / on the lock screen
 * - takes control of interruptions on Android (needed for lock-screen controls)
 */
export async function initAudioSession(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });
}
