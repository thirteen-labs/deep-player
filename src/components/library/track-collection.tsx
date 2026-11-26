import type { PropsWithChildren } from 'react';

import { Screen, TopBar, TrackList } from '@/components/ui';
import type { Track } from '@/lib/db/schema';
import { usePlayerStore } from '@/stores/player-store';
import { openTrackSheet } from '@/stores/track-sheet-store';

type TrackCollectionProps = PropsWithChildren<{
  title: string;
  tracks: Track[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}>;

/** Shared screen shell for album / artist / playlist / folder track lists. */
export function TrackCollection({
  title,
  tracks,
  isLoading = false,
  emptyMessage,
  emptyDescription,
  children,
}: TrackCollectionProps) {
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);

  return (
    <Screen fullWidth header={<TopBar title={title} showUniversalSort />}>
      {children}
      <TrackList
        tracks={tracks}
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
