import { useAudioPlayer, useAudioPlayerStatus, type AudioPlayer, type AudioStatus } from 'expo-audio';

export type AudioHandle = {
  player: AudioPlayer;
  status: AudioStatus;
};

/**
 * Wraps the shared `expo-audio` player: the player handle plus a status object
 * that updates on the player's `updateInterval`.
 */
export function useAppAudio(): AudioHandle {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  return { player, status };
}
