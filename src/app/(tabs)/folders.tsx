import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { FolderSection } from '@/components/folders/folder-section';
import { Screen, TopBar } from '@/components/ui';
import { SmartListsSection } from '@/features/media-lists/components';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useDbStore } from '@/lib/db/store';
import { useSortStore } from '@/stores/sort-store';
import { countFolderTracks, createFolderTrackLookup } from '@/utils/folder-tracks';
import { sortFolders } from '@/utils/sort';

/** Folder browser: smart video folders generated from recurring series names. */
export default function FoldersScreen() {
  const load = useDbStore((s) => s.load);
  const folders = useDbStore((s) => s.folders);
  const tracks = useDbStore((s) => s.tracks);
  const folderTracks = useDbStore((s) => s.folderTracks);
  const isLoaded = useDbStore((s) => s.isLoaded);
  const smartListSort = useSortStore((s) => s.smartListSort);
  const showEmpty = useSettingsStore((s) => s.settings.folders.showEmpty);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const folderCounts = useMemo(() => {
    const lookup = createFolderTrackLookup(tracks, folderTracks);
    const counts = new Map<string, number>();
    for (const folder of folders) {
      counts.set(folder.id, countFolderTracks(folder, lookup));
    }
    return counts;
  }, [folders, tracks, folderTracks]);

  const smartFolders = useMemo(
    () =>
      sortFolders(
        folders.filter(
          (folder) =>
            folder.smartlistType === 'series' &&
            (showEmpty || (folderCounts.get(folder.id) ?? 0) > 0),
        ),
        smartListSort,
      ),
    [folderCounts, folders, smartListSort, showEmpty],
  );

  const openFolder = (id: string) => router.push(`/folders/${encodeURIComponent(id)}`);

  return (
    <Screen
      header={
        <TopBar title="Folders" showLogo={false} showSmartSort showSearch showNotifications={false} />
      }>
      <SmartListsSection />

      <FolderSection
        title="Smart folders"
        subtitle="Videos grouped by series name"
        folders={smartFolders}
        counts={folderCounts}
        unit="videos"
        isLoading={!isLoaded}
        emptyMessage="No smart folders yet"
        emptyDescription="Add videos with matching series names to build them automatically."
        onOpen={openFolder}
      />
    </Screen>
  );
}
