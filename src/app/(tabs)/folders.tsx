import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { FolderSection } from '@/components/folders/folder-section';
import { Screen, TopBar } from '@/components/ui';
import { useDbStore } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { resolveFolderTracks } from '@/utils/folder-tracks';
import { sortFolders } from '@/utils/sort';

/** Folder browser: video series, smartlists and music folders in one place. */
export default function FoldersScreen() {
  const load = useDbStore((s) => s.load);
  const folders = useDbStore((s) => s.folders);
  const tracks = useDbStore((s) => s.tracks);
  const folderTracks = useDbStore((s) => s.folderTracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const smartListSort = useSortStore((s) => s.smartListSort);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

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

  const openFolder = (id: string) => router.push(`/folders/${encodeURIComponent(id)}`);

  return (
    <Screen header={<TopBar title="Folders" showSmartSort showNotifications={false} />}>
      <FolderSection
        title="Video series"
        subtitle="Generated from matching episode names"
        folders={videoSeries}
        counts={folderCounts}
        unit="videos"
        isLoading={!isLoaded}
        emptyMessage="No series folders yet"
        emptyDescription="Name videos like 'Show SN1 EP1' and series appear automatically."
        onOpen={openFolder}
      />
      <FolderSection
        title="Video smartlists"
        folders={videoSmartlists}
        counts={folderCounts}
        unit="videos"
        emptyMessage="No video smartlists yet."
        onOpen={openFolder}
      />
      <FolderSection
        title="Music folders"
        folders={musicFolders}
        counts={folderCounts}
        unit="tracks"
        emptyMessage="No folders yet."
        emptyDescription="Your music folders will appear here."
        onOpen={openFolder}
      />
      <FolderSection
        title="Music smartlists"
        folders={musicSmartlists}
        counts={folderCounts}
        unit="tracks"
        emptyMessage="No music smartlists yet."
        onOpen={openFolder}
      />
    </Screen>
  );
}
