import { useMemo, type PropsWithChildren } from 'react';

import { Screen, TopBar, TrackList } from '@/components/ui';
import { sortConfigToTrackSortKey } from '@/features/media-lists/adapters';
import { useLegacySortBridge, useMediaSort } from '@/features/media-lists/hooks';
import type { MediaSection } from '@/features/media-lists/types';
import type { Track } from '@/lib/db/schema';
import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';
import { sortTracks } from '@/utils/track-sorting';

type TrackCollectionProps = PropsWithChildren<{
  title: string;
  tracks: Track[];
  /** Per-list sort key; keeps detail screen sort independent and persisted. */
  listKey: string;
  sortSection?: Extract<MediaSection, 'music' | 'video'>;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}>;

/** Shared screen shell for album / artist / playlist / folder track lists. */
export function TrackCollection({
  title,
  tracks,
  listKey,
  sortSection = 'music',
  isLoading = false,
  emptyMessage,
  emptyDescription,
  children,
}: TrackCollectionProps) {
  useLegacySortBridge(listKey, sortSection);
  const { sort } = useMediaSort(listKey, sortSection);
  const sortedTracks = useMemo(
    () => sortTracks(tracks, sortConfigToTrackSortKey(sort)),
    [tracks, sort],
  );
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);

  return (
    <Screen fullWidth header={<TopBar title={title} showUniversalSort />}>
      {children}
      <TrackList
        tracks={sortedTracks}
        activeTrackId={activeTrackId}
        onSelect={(track) => play(track)}
        onMorePress={(track) => openTrackSheet(track)}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
      />
    </Screen>
  );
}
