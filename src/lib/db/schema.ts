import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'deep-player.db';

export type FolderKind = 'folder' | 'smartlist';
export type FolderMediaType = 'music' | 'video';

/** A folder or smartlist. `kind: 'folder'` is a user folder; `'smartlist'` is an automatic playlist (e.g. Favorites, Recently Added). */
export type Folder = {
  id: string;
  name: string;
  kind: FolderKind;
  smartlistType: string | null;
  mediaType: FolderMediaType;
  createdAt: number;
};

/** A track known to the library. */
export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  genre: string;
  durationMs: number;
  mimeType: string | null;
  uri: string;
  artworkUri: string | null;
  /** Local file URI of a cached copy (used when playing offline). */
  localUri: string | null;
  favorite: boolean;
  mediaType: FolderMediaType;
  addedAt: number;
};

export type PlaybackPosition = {
  trackId: string;
  positionMs: number;
};

export type Playlist = {
  id: string;
  name: string;
  color: string | null;
  createdAt: number;
};

export type PlaylistTrackRow = {
  playlistId: string;
  trackId: string;
  position: number;
};

/** A distinct (artist, album) pair with tracks. */
export type AlbumRow = {
  title: string;
  artist: string;
};

const SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'folder',
    smartlistType TEXT,
    mediaType TEXT NOT NULL DEFAULT 'music',
    createdAt INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    artist TEXT NOT NULL DEFAULT '',
    album TEXT NOT NULL DEFAULT '',
    albumArtist TEXT NOT NULL DEFAULT '',
    genre TEXT NOT NULL DEFAULT '',
    durationMs REAL NOT NULL DEFAULT 0,
    mimeType TEXT,
    uri TEXT NOT NULL DEFAULT '',
    artworkUri TEXT,
    favorite INTEGER NOT NULL DEFAULT 0,
    mediaType TEXT NOT NULL DEFAULT 'music',
    addedAt INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS playbackState (
    trackId TEXT PRIMARY KEY NOT NULL,
    positionMs REAL NOT NULL DEFAULT 0,
    lastPlayedAt INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    color TEXT,
    createdAt INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS playlistTracks (
    playlistId TEXT NOT NULL,
    trackId TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (playlistId, trackId)
  );
`;

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Opens the shared database handle, creating and migrating the schema on first use.
 */
export function getDb(): Promise<SQLiteDatabase> {
  dbPromise ??= (async () => {
    const db = await openDatabaseAsync(DB_NAME);
    await db.execAsync(SCHEMA_SQL);
    // Add columns that shipped after the initial schema was created.
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tracks)');
    if (!columns.some((c) => c.name === 'localUri')) {
      await db.execAsync('ALTER TABLE tracks ADD COLUMN localUri TEXT');
    }
    return db;
  })();
  return dbPromise;
}
