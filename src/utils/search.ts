import type { AlbumRow, Folder, Playlist, Track } from '@/lib/db/schema';

/** Keeps search results quick to render on large libraries. */
export const SEARCH_RESULT_LIMIT = 20;

export type LibrarySearchInput = {
  tracks: Track[];
  artists: string[];
  albums: AlbumRow[];
  playlists: Playlist[];
  folders: Folder[];
};

export type LibrarySearchResults = {
  songs: Track[];
  videos: Track[];
  artists: string[];
  albums: AlbumRow[];
  playlists: Playlist[];
  folders: Folder[];
};

const EMPTY_RESULTS: LibrarySearchResults = {
  songs: [],
  videos: [],
  artists: [],
  albums: [],
  playlists: [],
  folders: [],
};

/** Case-insensitive substring match across any of the supplied fields. */
function matches(query: string, values: (string | null | undefined)[]): boolean {
  return values.some((value) => value?.toLocaleLowerCase().includes(query));
}

/**
 * Universal search over every local library collection. Each group is capped
 * so the results page stays responsive even for very large libraries.
 */
export function searchLibrary(query: string, library: LibrarySearchInput): LibrarySearchResults {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return EMPTY_RESULTS;

  return {
    songs: library.tracks
      .filter(
        (track) =>
          track.mediaType === 'music' &&
          matches(normalized, [track.title, track.artist, track.album, track.albumArtist, track.genre]),
      )
      .slice(0, SEARCH_RESULT_LIMIT),
    videos: library.tracks
      .filter(
        (track) =>
          track.mediaType === 'video' &&
          matches(normalized, [track.title, track.artist, track.album, track.uri]),
      )
      .slice(0, SEARCH_RESULT_LIMIT),
    artists: library.artists
      .filter((artist) => matches(normalized, [artist]))
      .slice(0, SEARCH_RESULT_LIMIT),
    albums: library.albums
      .filter((album) => matches(normalized, [album.title, album.artist]))
      .slice(0, SEARCH_RESULT_LIMIT),
    playlists: library.playlists
      .filter((playlist) => matches(normalized, [playlist.name]))
      .slice(0, SEARCH_RESULT_LIMIT),
    folders: library.folders
      .filter((folder) => matches(normalized, [folder.name]))
      .slice(0, SEARCH_RESULT_LIMIT),
  };
}

/** True when at least one collection has results. */
export function hasSearchResults(results: LibrarySearchResults): boolean {
  return Object.values(results).some((group) => group.length > 0);
}
