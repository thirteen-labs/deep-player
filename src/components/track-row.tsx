import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';

import { TrackRow as TrackRowBase } from './ui/track-row';

type Props = {
  track: Parameters<typeof TrackRowBase>[0]['track'];
  index?: number;
  active?: boolean;
  selected?: boolean;
  selectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onEditPress?: () => void;
};

/**
 * Connected track row. Uses stable store action selectors.
 */
export function TrackRow({ track, index, active, selected, selectionMode, onPress, onLongPress, onEditPress }: Props) {
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);

  return (
    <TrackRowBase
      track={track}
      index={index}
      active={active}
      selected={selected}
      selectionMode={selectionMode}
      onPress={onPress ?? (() => play(track))}
      onLongPress={onLongPress}
      onFavoritePress={() => void toggleFavorite(track.id)}
      onPlayNextPress={() => playNext(track)}
      onAddToQueuePress={() => addToQueue(track)}
      onEditPress={onEditPress}
    />
  );
}