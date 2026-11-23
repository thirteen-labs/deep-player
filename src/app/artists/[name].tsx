import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { Screen, TopBar, TrackList } from '@/components/ui';
import { useDbStore, type Track } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';
import { usePlayerStore } from '@/stores/player-store';

export default function ArtistDetailScreen() {
  const { name } = useLocalSearchParams();
  const artistName = String(name ?? '');
  const tracksAll = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const universalSort = useSortStore((s) => s.universalSort);

  const tracks = useMemo(
    () => sortTracks(tracksAll.filter((t) => t.artist === artistName || t.albumArtist === artistName), universalSort),
    [tracksAll, artistName, universalSort]
  );

  return (
    <Screen header={<TopBar title={artistName} showUniversalSort />}>
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
