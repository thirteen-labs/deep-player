import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { Screen, TopBar, TrackList } from '@/components/ui';
import { useDbStore, type Track } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';
import { usePlayerStore } from '@/stores/player-store';

export default function AlbumDetailScreen() {
  const { artist: artistParam, album: albumParam } = useLocalSearchParams();
  const artistName = artistParam === '_' ? '' : String(artistParam ?? '');
  const albumName = String(albumParam ?? '');
  const tracksAll = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const universalSort = useSortStore((s) => s.universalSort);

  const tracks = useMemo(
    () => sortTracks(tracksAll.filter((t) => t.album === albumName && (t.artist || t.albumArtist) === artistName), universalSort),
    [tracksAll, albumName, artistName, universalSort]
  );

  return (
    <Screen header={<TopBar title={albumName} showUniversalSort />}>
      <TrackList
        tracks={tracks}
        activeTrackId={activeTrackId}
        onSelect={(track: Track) => play(track)}
        onFavoritePress={(track: Track) => void toggleFavorite(track.id)}
        onPlayNextPress={(t: Track) => playNext(t)}
        onAddToQueuePress={(t: Track) => addToQueue(t)}
        isLoading={!isLoaded}
      />
    </Screen>
  );
}
