import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { TrackRow } from '@/components/track-row';
import {
  AppButton,
  EmptyState,
  NamePromptModal,
  Screen,
  SectionCard,
  TopBar,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore, type Track } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const playlistId = String(id ?? '');
  const playlist = useDbStore((s) => s.playlists.find((p) => p.id === playlistId));
  // Never call a selector that builds a new array: it would re-render forever.
  const playlistLinks = useDbStore((s) => s.playlistTracks);
  const allTracks = useDbStore((s) => s.tracks);
  const universalSort = useSortStore((s) => s.universalSort);
  const tracks = useMemo(() => {
    const byId = new Map(allTracks.map((t) => [t.id, t]));
    const linked = playlistLinks
      .filter((link) => link.playlistId === playlistId)
      .map((link) => byId.get(link.trackId))
      .filter((track): track is Track => track !== undefined);
    return sortTracks(linked, universalSort);
  }, [playlistLinks, allTracks, playlistId, universalSort]);
  const load = useDbStore((s) => s.load);
  const renamePlaylist = useDbStore((s) => s.renamePlaylist);
  const deletePlaylist = useDbStore((s) => s.deletePlaylist);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const title = playlist?.name ?? 'Playlist';

  const rename = (name: string) => {
    setIsRenaming(false);
    if (name.trim()) void renamePlaylist(playlistId, name.trim());
  };

  const deleteFlow = () => {
    Alert.alert(`Delete "${title}"`, 'Delete the playlist and its tracks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deletePlaylist(playlistId).then(() => router.back());
        },
      },
    ]);
  };

  return (
    <Screen header={<TopBar title={title} showUniversalSort />}>
      <SectionCard title="Playlist" gap={Spacing.three}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <AppButton label="Rename" variant="ghost" size="small" onPress={() => setIsRenaming(true)} />
        <AppButton label="Delete" variant="ghost" size="small" onPress={deleteFlow} />
      </SectionCard>

      <SectionCard title="Tracks" gap={Spacing.one}>
        {tracks.length === 0 ? (
          <EmptyState message="This playlist is empty." description="Add tracks from your music library." />
        ) : (
          tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} />
          ))
        )}
      </SectionCard>

      <NamePromptModal
        key={isRenaming ? `rename-${title}-open` : `rename-${title}-closed`}
        visible={isRenaming}
        title="Rename playlist"
        description="Enter a new name for this playlist."
        value={title}
        onCancel={() => setIsRenaming(false)}
        onConfirm={rename}
      />
    </Screen>
  );
}
