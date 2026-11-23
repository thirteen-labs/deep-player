import type { Folder, FolderTrackRow, Track } from '@/lib/db/schema';
import { sortTracks } from '@/utils/track-sorting';

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
