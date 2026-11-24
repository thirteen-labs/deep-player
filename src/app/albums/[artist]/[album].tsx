import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { TrackCollection } from '@/components/library/track-collection';
import { useSortedTracks } from '@/hooks/use-sorted-tracks';
import { useDbStore } from '@/lib/db/store';

export default function AlbumDetailScreen() {
  const { artist: artistParam, album: albumParam } = useLocalSearchParams();
  const artistName = artistParam === '_' ? '' : String(artistParam ?? '');
  const albumName = String(albumParam ?? '');
  const allTracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);

  const tracks = useMemo(
    () =>
      allTracks.filter(
        (track) => track.album === albumName && (track.artist === artistName || track.albumArtist === artistName),
      ),
    [allTracks, albumName, artistName],
  );
  const sortedTracks = useSortedTracks(tracks);

  return (
    <TrackCollection
      title={albumName || 'Album'}
      tracks={sortedTracks}
      isLoading={!isLoaded}
      emptyMessage="This album is empty."
    />
  );
}
