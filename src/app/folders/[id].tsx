import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { TrackCollection } from '@/components/library/track-collection';
import { EmptyState, LoadingState, Screen, SectionCard, TopBar } from '@/components/ui';
import { VideoList } from '@/components/videos/video-list';
import { Spacing } from '@/constants/theme';
import { sortConfigToTrackSortKey } from '@/features/media-lists/adapters';
import { useLegacySortBridge, useMediaSort } from '@/features/media-lists/hooks';
import { useDbStore } from '@/lib/db/store';
import { resolveFolderTracks } from '@/utils/folder-tracks';
import { sortTracks } from '@/utils/track-sorting';

/** Folder detail: music folders use the shared track collection, video folders use the video list. */
export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams();
  const folderId = String(id ?? '');
  const load = useDbStore((s) => s.load);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const folders = useDbStore((s) => s.folders);
  const tracks = useDbStore((s) => s.tracks);
  const folderTracks = useDbStore((s) => s.folderTracks);
  const positions = useDbStore((s) => s.playbackPositions);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const folder = useMemo(() => folders.find((item) => item.id === folderId), [folders, folderId]);
  const contents = useMemo(
    () => (folder ? resolveFolderTracks(folder, tracks, folderTracks) : []),
    [folder, tracks, folderTracks],
  );
  const sortSection = folder?.mediaType === 'video' ? 'video' : 'music';
  const listKey = `${sortSection}:folder:${folderId}`;
  useLegacySortBridge(listKey, sortSection);
  const { sort } = useMediaSort(listKey, sortSection);
  const sortedContents = useMemo(
    () => sortTracks(contents, sortConfigToTrackSortKey(sort)),
    [contents, sort],
  );

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

  if (folder.mediaType === 'video') {
    return (
      <Screen fullWidth header={<TopBar title={folder.name} showUniversalSort showNotifications={false} />}>
        <SectionCard
          title={folder.name}
          subtitle={`${sortedContents.length} videos`}
          flush
          padding={Spacing.half}
          gap={Spacing.half}>
          <VideoList
            videos={sortedContents}
            positions={positions}
            onPress={(track) => router.push(`/videos/${encodeURIComponent(track.id)}`)}
          />
        </SectionCard>
      </Screen>
    );
  }

  return (
    <TrackCollection
      title={folder.name}
      tracks={contents}
      listKey={listKey}
      sortSection="music"
      emptyMessage="This folder is empty."
      emptyDescription="Rescan your library to refresh its contents."
    />
  );
}
