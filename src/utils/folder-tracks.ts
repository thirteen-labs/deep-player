import type { Folder, FolderTrackRow, Track } from '@/lib/db/schema';
import { sortTracks } from '@/utils/track-sorting';

type FolderTrackLookup = {
  trackById: Map<string, Track>;
  folderTrackIds: Map<string, string[]>;
  musicTracks: Track[];
  videoTracks: Track[];
};

/** Builds shared indexes for counting many folders without rescanning all tracks per folder. */
export function createFolderTrackLookup(
  tracks: Track[],
  folderTracks: FolderTrackRow[],
): FolderTrackLookup {
  const trackById = new Map(tracks.map((track) => [track.id, track]));
  const folderTrackIds = new Map<string, string[]>();

  for (const row of folderTracks) {
    const ids = folderTrackIds.get(row.folderId);
    if (ids) ids.push(row.trackId);
    else folderTrackIds.set(row.folderId, [row.trackId]);
  }

  return {
    trackById,
    folderTrackIds,
    musicTracks: tracks.filter((track) => track.mediaType !== 'video'),
    videoTracks: tracks.filter((track) => track.mediaType === 'video'),
  };
}

/** Counts folder contents using indexes from createFolderTrackLookup. */
export function countFolderTracks(folder: Folder, lookup: FolderTrackLookup): number {
  if (folder.smartlistType === 'series' || folder.kind === 'folder') {
    const ids = lookup.folderTrackIds.get(folder.id) ?? [];
    if (ids.length === 0 && folder.id === 'folder:all') return lookup.musicTracks.length;

    let count = 0;
    for (const id of ids) {
      if (lookup.trackById.has(id)) count += 1;
    }
    return count;
  }

  switch (folder.smartlistType) {
    case 'favorites':
      return lookup.musicTracks.filter((track) => track.favorite).length;
    case 'recently_added':
      return (folder.mediaType === 'video' ? lookup.videoTracks : lookup.musicTracks).length;
    default:
      return 0;
  }
}

/** Resolves the contents of a seeded smartlist or a generated series folder. */
export function resolveFolderTracks(
  folder: Folder,
  tracks: Track[],
  folderTracks: FolderTrackRow[],
): Track[] {
  if (folder.smartlistType === 'series' || folder.kind === 'folder') {
    const ids = folderTracks
      .filter((row) => row.folderId === folder.id)
      .sort((a, b) => a.position - b.position)
      .map((row) => row.trackId);
    if (ids.length === 0 && folder.id === 'folder:all') {
      return sortTracks(tracks.filter((t) => t.mediaType !== 'video'), 'title-asc');
    }
    const byId = new Map(tracks.map((track) => [track.id, track]));
    return ids.map((id) => byId.get(id)).filter((track): track is Track => Boolean(track));
  }

  switch (folder.smartlistType) {
    case 'favorites':
      return sortTracks(tracks.filter((t) => t.favorite && t.mediaType !== 'video'), 'title-asc');
    case 'recently_added':
      return sortTracks(tracks.filter((t) => t.mediaType === folder.mediaType), 'recently-added');
    default:
      return [];
  }
}
