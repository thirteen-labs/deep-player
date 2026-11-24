import { MusicDoubleNote } from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
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
  onFavoritePress?: (track: Track) => void;
  onPlayNextPress?: (track: Track) => void;
  onAddToQueuePress?: (track: Track) => void;
  onEditPress?: (track: Track) => void;
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
  onFavoritePress,
  onPlayNextPress,
  onAddToQueuePress,
  onEditPress,
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
    <View style={styles.list}>
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
          onFavoritePress={onFavoritePress ? () => onFavoritePress(track) : undefined}
          onPlayNextPress={onPlayNextPress ? () => onPlayNextPress(track) : undefined}
          onAddToQueuePress={onAddToQueuePress ? () => onAddToQueuePress(track) : undefined}
          onEditPress={onEditPress ? () => onEditPress(track) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.half,
  },
});