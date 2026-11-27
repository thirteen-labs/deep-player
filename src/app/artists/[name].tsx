import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { TrackCollection } from '@/components/library/track-collection';
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
  const listKey = `music:artist:${encodeURIComponent(artistName)}`;

  return (
    <TrackCollection
      title={artistName || 'Artist'}
      tracks={tracks}
      listKey={listKey}
      isLoading={!isLoaded}
      emptyMessage="No tracks for this artist."
    />
  );
}
