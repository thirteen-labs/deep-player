import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { TrackCollection } from '@/components/library/track-collection';
import { ThemedText } from '@/components/themed-text';
import { AppButton, NamePromptModal, SectionCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSortedTracks } from '@/hooks/use-sorted-tracks';
import { useDbStore, type Track } from '@/lib/db/store';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const playlistId = String(id ?? '');
  const playlist = useDbStore((s) => s.playlists.find((item) => item.id === playlistId));
  // Keep the selector stable: selecting derived arrays would re-render forever.
  const playlistLinks = useDbStore((s) => s.playlistTracks);
  const allTracks = useDbStore((s) => s.tracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const load = useDbStore((s) => s.load);
  const renamePlaylist = useDbStore((s) => s.renamePlaylist);
  const deletePlaylist = useDbStore((s) => s.deletePlaylist);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const tracks = useMemo(() => {
    const byId = new Map(allTracks.map((track) => [track.id, track]));
    return playlistLinks
      .filter((link) => link.playlistId === playlistId)
      .map((link) => byId.get(link.trackId))
      .filter((track): track is Track => track !== undefined);
  }, [playlistLinks, allTracks, playlistId]);
  const sortedTracks = useSortedTracks(tracks);

  const title = playlist?.name ?? 'Playlist';

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
    <TrackCollection
      title={title}
      tracks={sortedTracks}
      isLoading={!isLoaded}
      emptyMessage="This playlist is empty."
      emptyDescription="Add tracks from the Music tab.">
      <SectionCard title="Playlist" gap={Spacing.three}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <AppButton label="Rename" variant="ghost" size="small" onPress={() => setIsRenaming(true)} />
        <AppButton label="Delete" variant="ghost" size="small" onPress={deleteFlow} />
      </SectionCard>

      <NamePromptModal
        key={isRenaming ? `rename-${title}-open` : `rename-${title}-closed`}
        visible={isRenaming}
        title="Rename playlist"
        description="Enter a new name for this playlist."
        value={title}
        onCancel={() => setIsRenaming(false)}
        onConfirm={(name) => {
          setIsRenaming(false);
          if (name.trim()) void renamePlaylist(playlistId, name.trim());
        }}
      />
    </TrackCollection>
  );
}
