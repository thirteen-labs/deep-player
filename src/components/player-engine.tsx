import { usePlayer } from '@/stores/player-store';

/**
 * Mounts the single `expo-audio` player for the whole app lifetime.
 * Keeping this at the root means navigating between tabs never creates
 * duplicate players or listeners, and playback survives screen changes.
 */
export function PlayerEngine() {
  usePlayer();
  return null;
}
