import { router, useLocalSearchParams } from 'expo-router';
import { Film } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, InfoRow, LoadingState, Screen, SectionCard, TopBar, TrackList } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';
import { useSortStore } from '@/stores/sort-store';
import { formatTime } from '@/utils/format';
import { resolveFolderTracks } from '@/utils/folder-tracks';
import { sortTracks } from '@/utils/track-sorting';

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams();
  const folderId = String(id ?? '');
  const load = useDbStore((s) => s.load);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const folders = useDbStore((s) => s.folders);
  const tracks = useDbStore((s) => s.tracks);
  const folderTracks = useDbStore((s) => s.folderTracks);
  const positions = useDbStore((s) => s.playbackPositions);
  const toggleFavorite = useDbStore((s) => s.toggleFavorite);
  const universalSort = useSortStore((s) => s.universalSort);

  const activeTrackId = usePlayerStore((s) => s.track?.id);
  const play = usePlayerStore((s) => s.play);
  const playNext = usePlayerStore((s) => s.playNext);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const folder = useMemo(() => folders.find((item) => item.id === folderId), [folders, folderId]);
  const contents = useMemo(() => {
    if (!folder) return [];
    return sortTracks(resolveFolderTracks(folder, tracks, folderTracks), universalSort);
  }, [folder, tracks, folderTracks, universalSort]);

  if (!isLoaded) {
    return (
      <Screen header={<TopBar title="Folder" />}>
        <LoadingState message="Loading folder…" />
      </Screen>
    );
  }

  if (!folder) {
    return (
      <Screen header={<TopBar title="Folder" />}>
        <EmptyState message="Folder not found" description="It may have been removed after a library scan." />
      </Screen>
    );
  }

  const isVideo = folder.mediaType === 'video';

  return (
    <Screen header={<TopBar title={folder.name} showUniversalSort showNotifications={false} />}>
      <SectionCard title={folder.name} subtitle={`${contents.length} ${isVideo ? 'videos' : 'tracks'}`}>
        {contents.length === 0 ? (
          <EmptyState message="This folder is empty" description="Rescan your library to refresh its contents." />
        ) : isVideo ? (
          <View style={styles.list}>
            {contents.map((item) => {
              const duration = item.durationMs > 0 ? formatTime(item.durationMs / 1000) : '0:00';
              const position = positions[item.id] ?? 0;
              return (
                <InfoRow
                  key={item.id}
                  icon={Film}
                  label={item.title || item.uri}
                  subtitle={position > 10 ? `Resume ${formatTime(position)} · ${duration}` : duration}
                  onPress={() => router.push(`/videos/${encodeURIComponent(item.id)}`)}
                />
              );
            })}
          </View>
        ) : (
          <TrackList
            tracks={contents}
            activeTrackId={activeTrackId}
            onSelect={(track) => play(track)}
            onFavoritePress={(track) => void toggleFavorite(track.id)}
            onPlayNextPress={(track) => playNext(track)}
            onAddToQueuePress={(track) => addToQueue(track)}
          />
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.half,
  },
});
