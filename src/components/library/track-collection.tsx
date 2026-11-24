import type { PropsWithChildren } from 'react';

import { Screen, TopBar, TrackList } from '@/components/ui';
import type { Track } from '@/lib/db/schema';
import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';

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
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);

  return (
    <Screen header={<TopBar title={title} showUniversalSort />}>
      {children}
      <TrackList
        tracks={tracks}
        activeTrackId={activeTrackId}
        onSelect={(track) => play(track)}
        onFavoritePress={(track) => void toggleFavorite(track.id)}
        onPlayNextPress={(track) => playNext(track)}
        onAddToQueuePress={(track) => addToQueue(track)}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
      />
    </Screen>
  );
}
