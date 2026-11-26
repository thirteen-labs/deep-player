import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';

import { TrackRow as TrackRowBase } from './ui/track-row';

type Props = {
  track: Parameters<typeof TrackRowBase>[0]['track'];
  index?: number;
  active?: boolean;
  selected?: boolean;
  selectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onMorePress?: () => void;
};

/**
 * Connected track row. Plays on press and opens the shared track options
 * sheet from the overflow button (or a custom handler when provided).
 */
export function TrackRow({
  track,
  index,
  active,
  selected,
  selectionMode,
  onPress,
  onLongPress,
  onMorePress,
}: Props) {
  const play = usePlayerStore((s) => s.play);

  return (
    <TrackRowBase
      track={track}
      index={index}
      active={active}
      selected={selected}
      selectionMode={selectionMode}
      onPress={onPress ?? (() => play(track))}
      onLongPress={onLongPress}
      onMorePress={onMorePress ?? (() => openTrackSheet(track))}
    />
  );
}
