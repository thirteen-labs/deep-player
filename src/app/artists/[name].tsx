import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { TrackCollection } from '@/components/library/track-collection';
import { useSortedTracks } from '@/hooks/use-sorted-tracks';
import { useDbStore } from '@/lib/db/store';

export default function ArtistDetailScreen() {
  const { name } = useLocalSearchParams();
  const artistName = String(name ?? '');
  const allTracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);

  const tracks = useMemo(
    () => allTracks.filter((track) => track.artist === artistName || track.albumArtist === artistName),
    [allTracks, artistName],
  );
  const sortedTracks = useSortedTracks(tracks);

  return (
    <TrackCollection
      title={artistName || 'Artist'}
      tracks={sortedTracks}
      isLoading={!isLoaded}
      emptyMessage="No tracks for this artist."
    />
  );
}
