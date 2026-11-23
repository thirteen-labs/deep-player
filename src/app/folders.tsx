import { Plus } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';

import {
  AppButton,
  EmptyState,
  FolderRow,
  InfoRow,
  LoadingState,
  NamePromptModal,
  Screen,
  SectionCard,
  TopBar,
} from '@/components/ui';
import { useSortStore } from '@/stores/sort-store';
import { resolveFolderTracks } from '@/utils/folder-tracks';
import { sortFolders } from '@/utils/sort';
import { useDbStore } from '@/lib/db/store';

export default function FoldersScreen() {
  const load = useDbStore((s) => s.load);
  const folders = useDbStore((s) => s.folders);
  const tracks = useDbStore((s) => s.tracks);
  const folderTracks = useDbStore((s) => s.folderTracks);
  const playlists = useDbStore((s) => s.playlists);
  const playlistTracks = useDbStore((s) => s.playlistTracks);
  const createPlaylist = useDbStore((s) => s.createPlaylist);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const smartListSort = useSortStore((s) => s.smartListSort);
  const [isNamingPlaylist, setIsNamingPlaylist] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const musicFolders = useMemo(
    () => sortFolders(folders.filter((f) => f.kind === 'folder' && !f.smartlistType), smartListSort),
    [folders, smartListSort],
  );
  const videoSeries = useMemo(
    () => sortFolders(folders.filter((f) => f.smartlistType === 'series'), smartListSort),
    [folders, smartListSort],
  );
  const musicSmartlists = useMemo(
    () => sortFolders(folders.filter((f) => f.kind === 'smartlist' && f.mediaType === 'music'), smartListSort),
    [folders, smartListSort],
  );
  const videoSmartlists = useMemo(
    () =>
      sortFolders(
        folders.filter((f) => f.kind === 'smartlist' && f.mediaType === 'video' && f.smartlistType !== 'series'),
        smartListSort,
      ),
    [folders, smartListSort],
  );

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const folder of folders) {
      counts.set(folder.id, resolveFolderTracks(folder, tracks, folderTracks).length);
    }
    return counts;
  }, [folders, tracks, folderTracks]);

  const playlistTrackCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of playlistTracks) {
      counts.set(row.playlistId, (counts.get(row.playlistId) ?? 0) + 1);
    }
    return counts;
  }, [playlistTracks]);

  const openFolder = (id: string) => router.push(`/folders/${encodeURIComponent(id)}`);

  const createNamedPlaylist = (name: string) => {
    setIsNamingPlaylist(false);
    void createPlaylist(name);
  };

  return (
    <Screen header={<TopBar title="Folders" showSmartSort showNotifications={false} />}>
      <SectionCard title="Video series" subtitle="Generated from matching episode names">
        {!isLoaded ? <LoadingState /> : null}
        {videoSeries.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            subtitle={`${folderCounts.get(folder.id) ?? 0} videos`}
            onPress={() => openFolder(folder.id)}
          />
        ))}
        {isLoaded && videoSeries.length === 0 ? (
          <EmptyState
            message="No series folders yet"
            description="Name your videos like 'Show SN1 EP1' and folders appear automatically."
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Video smartlists">
        {videoSmartlists.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            subtitle={`${folderCounts.get(folder.id) ?? 0} videos`}
            onPress={() => openFolder(folder.id)}
          />
        ))}
        {isLoaded && videoSmartlists.length === 0 ? (
          <EmptyState message="No video smartlists yet." />
        ) : null}
      </SectionCard>

      <SectionCard title="Music folders">
        {musicFolders.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            subtitle={`${folderCounts.get(folder.id) ?? 0} tracks`}
            onPress={() => openFolder(folder.id)}
          />
        ))}
        {isLoaded && musicFolders.length === 0 ? (
          <EmptyState message="No folders yet." description="Your music folders will appear here." />
        ) : null}
      </SectionCard>

      <SectionCard title="Music smartlists">
        {musicSmartlists.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            subtitle={`${folderCounts.get(folder.id) ?? 0} tracks`}
            onPress={() => openFolder(folder.id)}
          />
        ))}
        {isLoaded && musicSmartlists.length === 0 ? (
          <EmptyState message="No music smartlists yet." />
        ) : null}
      </SectionCard>

      <SectionCard
        title="Playlists"
        action={<AppButton label="New playlist" icon={Plus} variant="ghost" size="small" onPress={() => setIsNamingPlaylist(true)} />}>
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

      <NamePromptModal
        key={isNamingPlaylist ? 'playlist-prompt-open' : 'playlist-prompt-closed'}
        visible={isNamingPlaylist}
        title="New playlist"
        description="Give your playlist a name."
        value="New playlist"
        confirmLabel="Create"
        onCancel={() => setIsNamingPlaylist(false)}
        onConfirm={createNamedPlaylist}
      />
    </Screen>
  );
}
