import { Plus } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';

import {
  AppButton,
  EmptyState,
  FolderRow,
  InfoRow,
  LoadingState,
  Screen,
  SectionCard,
  TopBar,
} from '@/components/ui';
import { useSortStore } from '@/stores/sort-store';
import { sortFolders } from '@/utils/sort';
import { useDbStore } from '@/lib/db/store';
import { promptName } from '@/lib/prompt';

export default function FoldersScreen() {
  const load = useDbStore((s) => s.load);
  const folders = useDbStore((s) => s.folders);
  const playlists = useDbStore((s) => s.playlists);
  const playlistTracks = useDbStore((s) => s.playlistTracks);
  const createPlaylist = useDbStore((s) => s.createPlaylist);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const smartListSort = useSortStore((s) => s.smartListSort);

  useEffect(() => {
    void load();
  }, [load]);

  const musicFolders = useMemo(
    () => sortFolders(folders.filter((f) => f.kind === 'folder'), smartListSort),
    [folders, smartListSort],
  );
  const videoSmartlists = useMemo(
    () => sortFolders(folders.filter((f) => f.kind === 'smartlist' && f.mediaType === 'video'), smartListSort),
    [folders, smartListSort],
  );

  const playlistTrackCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of playlistTracks) {
      counts.set(row.playlistId, (counts.get(row.playlistId) ?? 0) + 1);
    }
    return counts;
  }, [playlistTracks]);

  const newPlaylistFlow = () => {
    if (Platform.OS === 'web') {
      const name = promptName('New playlist name', 'New playlist');
      if (name?.trim()) void createPlaylist(name.trim());
      return;
    }
    Alert.prompt(
      'New playlist',
      'Enter a name',
      (name) => {
        if (name?.trim()) void createPlaylist(name.trim());
      },
      'plain-text',
      'New playlist'
    );
  };

  return (
    <Screen header={<TopBar title="Folders" showSmartSort />}>
      <SectionCard title="Music folders">
        {!isLoaded ? <LoadingState /> : null}
        {musicFolders.map((folder) => (
          <FolderRow key={folder.id} folder={folder} />
        ))}
        {isLoaded && musicFolders.length === 0 ? (
          <EmptyState message="No folders yet." description="Your music folders will appear here." />
        ) : null}
      </SectionCard>

      <SectionCard title="Video smartlists">
        {videoSmartlists.map((folder) => (
          <FolderRow key={folder.id} folder={folder} subtitle="Video" />
        ))}
        {isLoaded && videoSmartlists.length === 0 ? (
          <EmptyState message="No video smartlists yet." />
        ) : null}
      </SectionCard>

      <SectionCard
        title="Playlists"
        action={<AppButton label="New playlist" icon={Plus} variant="ghost" size="small" onPress={newPlaylistFlow} />}>
        {playlists.map((playlist) => (
          <InfoRow
            key={playlist.id}
            label={playlist.name}
            value={`${playlistTrackCounts.get(playlist.id) ?? 0} tracks`}
            valueColor="textSecondary"
            onPress={() => router.push(`/playlists/${playlist.id}`)}
          />
        ))}
        {isLoaded && playlists.length === 0 ? (
          <EmptyState message="No playlists yet." description="Create one to group your favorite tracks." />
        ) : null}
      </SectionCard>
    </Screen>
  );
}
