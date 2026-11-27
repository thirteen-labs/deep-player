import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { TrackCollection } from '@/components/library/track-collection';
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
  const listKey = `music:album:${encodeURIComponent(artistName)}:${encodeURIComponent(albumName)}`;

  return (
    <TrackCollection
      title={albumName || 'Album'}
      tracks={tracks}
      listKey={listKey}
      isLoading={!isLoaded}
      emptyMessage="This album is empty."
    />
  );
}
