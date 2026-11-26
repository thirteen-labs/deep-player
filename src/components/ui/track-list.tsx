import { MusicDoubleNote } from 'iconoir-react-native';
import { View } from 'react-native';

import type { Track } from '@/lib/db/schema';

import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';
import { TrackRow } from './track-row';

type TrackListProps = {
  tracks: Track[];
  activeTrackId?: string | null;
  selectedIds?: Set<string>;
  selectionMode?: boolean;
  onSelect: (track: Track, index: number) => void;
  onLongPress?: (track: Track, index: number) => void;
  onMorePress?: (track: Track, index: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
};

/** Presentational list of tracks; handles loading and empty states. */
export function TrackList({
  tracks,
  activeTrackId,
  selectedIds,
  selectionMode = false,
  onSelect,
  onLongPress,
  onMorePress,
  isLoading = false,
  emptyMessage = 'No tracks in your library yet.',
  emptyDescription = 'Scan the media library in Settings to import tracks from your device.',
}: TrackListProps) {
  if (isLoading) return <LoadingState message="Loading tracks…" variant="block" />;

  if (tracks.length === 0) {
    return (
      <EmptyState
        icon={MusicDoubleNote}
        message={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <View>
      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          active={track.id === activeTrackId}
          selected={selectedIds?.has(track.id)}
          selectionMode={selectionMode}
          onPress={() => onSelect(track, index)}
          onLongPress={onLongPress ? () => onLongPress(track, index) : undefined}
          onMorePress={onMorePress ? () => onMorePress(track, index) : undefined}
        />
      ))}
    </View>
  );
}
