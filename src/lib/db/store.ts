import { create } from 'zustand';

import { AlbumRow, Folder, FolderMediaType, FolderKind, Playlist, PlaylistTrackRow, PlaybackPosition, Track, getDb } from '@/lib/db/schema';

export type { AlbumRow, Folder, FolderMediaType, FolderKind, Playlist, PlaylistTrackRow, PlaybackPosition, Track };

/** Default folders seeded on first run. */
const SEED_FOLDERS: Folder[] = [
  { id: 'folder:all', name: 'All Music', kind: 'folder', smartlistType: null, mediaType: 'music', createdAt: 0 },
  { id: 'folder:favorites', name: 'Favorites', kind: 'smartlist', smartlistType: 'favorites', mediaType: 'music', createdAt: 0 },
  { id: 'folder:recent', name: 'Recently Added', kind: 'smartlist', smartlistType: 'recently_added', mediaType: 'music', createdAt: 0 },
  {
    id: 'folder:recent-video',
    name: 'Recently Added (Video)',
    kind: 'smartlist',
    smartlistType: 'recently_added',
    mediaType: 'video',
    createdAt: 0,
  },
];

type DbStore = {
  folders: Folder[];
  tracks: Track[];
  /** Distinct artist names across the library, sorted. */
  artists: string[];
  /** Distinct (artist, album) pairs with tracks, sorted. */
  albums: AlbumRow[];
  playlists: Playlist[];
  /** Rows of the playlistTracks table (links playlists to tracks). */
  playlistTracks: PlaylistTrackRow[];
  /** Tracks with a recent playbackState, newest first. */
  recentlyPlayed: Track[];
  /** Playback position per track, in seconds (from the `playbackState` table). */
  playbackPositions: Record<string, number>;
  isLoaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  upsertTracks: (tracks: Track[]) => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  setPlaybackPosition: (trackId: string, positionMs: number) => Promise<void>;
  createPlaylist: (name: string) => Promise<string>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Track[];
  getArtistTracks: (name: string) => Track[];
  getAlbumTracks: (artist: string, title: string) => Track[];
  setTrackArtworkUri: (trackId: string, uri: string) => Promise<void>;
  setTrackLocalUri: (trackId: string, uri: string) => Promise<void>;
  recordPlayback: (trackId: string) => Promise<void>;
  updateTrack: (trackId: string, patch: Partial<Pick<Track, 'title' | 'artist' | 'album' | 'albumArtist' | 'genre' | 'artworkUri'>>) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  deleteTracks: (trackIds: string[]) => Promise<void>;
};

export const useDbStore = create<DbStore>((set, get) => ({
  folders: [],
  tracks: [],
  artists: [],
  albums: [],
  playlists: [],
  playlistTracks: [],
  recentlyPlayed: [],
  playbackPositions: {},
  isLoaded: false,
  error: null,

  load: async () => {
    try {
      const db = await getDb();

      // Seed the default folders the first time the library is used.
      const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM folders');
      if (!existing || existing.count === 0) {
        for (const folder of SEED_FOLDERS) {
          await db.runAsync(
            'INSERT OR IGNORE INTO folders (id, name, kind, smartlistType, mediaType, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            folder.id,
            folder.name,
            folder.kind,
            folder.smartlistType,
            folder.mediaType,
            folder.createdAt
          );
        }
      }

      const [folders, tracks, positions, playlists, playlistTracks, recentlyPlayed] = await Promise.all([
        db.getAllAsync<Folder>('SELECT * FROM folders ORDER BY name'),
        db.getAllAsync<Track>('SELECT * FROM tracks ORDER BY addedAt DESC'),
        db.getAllAsync<PlaybackPosition>('SELECT trackId, positionMs FROM playbackState'),
        db.getAllAsync<Playlist>('SELECT * FROM playlists ORDER BY name'),
        db.getAllAsync<PlaylistTrackRow>('SELECT * FROM playlistTracks'),
        db.getAllAsync<Track>(
          `SELECT t.* FROM tracks t JOIN playbackState p ON p.trackId = t.id
           ORDER BY p.lastPlayedAt DESC LIMIT 20`
        ),
      ]);

      // Derived artist and album indexes (used by the Artists and Albums screens).
      const artists = [...new Set(tracks.map((t) => t.artist || t.albumArtist).filter(Boolean))].sort();

      const albumsByKey = new Map<string, AlbumRow>();
      for (const track of tracks) {
        if (!track.album) continue;
        const artist = track.artist || track.albumArtist;
        const key = `${artist}|${track.album}`;
        if (!albumsByKey.has(key)) {
          albumsByKey.set(key, { title: track.album, artist });
        }
      }
      const albums = [...albumsByKey.values()].sort((a, b) => (a.artist + a.title).localeCompare(b.artist + b.title));

      set({
        folders,
        tracks,
        artists,
        albums,
        playlists,
        playlistTracks,
        recentlyPlayed,
        playbackPositions: Object.fromEntries(positions.map((p) => [p.trackId, p.positionMs] as const)),
        isLoaded: true,
        error: null,
      });
    } catch (error) {
      set({ error: String(error) });
    }
  },

  upsertTracks: async (tracks) => {
    if (tracks.length === 0) return;
    const db = await getDb();
    for (const track of tracks) {
      await db.runAsync(
        `INSERT INTO tracks (id, title, artist, album, albumArtist, genre, durationMs, mimeType, uri, artworkUri, favorite, mediaType, addedAt, localUri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           artist = excluded.artist,
           album = excluded.album,
           albumArtist = excluded.albumArtist,
           genre = excluded.genre,
           durationMs = excluded.durationMs,
           mimeType = excluded.mimeType,
           uri = excluded.uri,
           artworkUri = COALESCE(excluded.artworkUri, tracks.artworkUri),
           favorite = excluded.favorite,
           mediaType = excluded.mediaType,
           addedAt = excluded.addedAt,
           localUri = COALESCE(excluded.localUri, tracks.localUri)`,
        track.id,
        track.title,
        track.artist,
        track.album,
        track.albumArtist,
        track.genre,
        track.durationMs,
        track.mimeType,
        track.uri,
        track.artworkUri,
        track.favorite ? 1 : 0,
        track.mediaType,
        track.addedAt,
        track.localUri
      );
    }
  },

  toggleFavorite: async (trackId) => {
    const db = await getDb();
    const row = await db.getFirstAsync<{ favorite: number }>('SELECT favorite FROM tracks WHERE id = ?', trackId);
    if (!row) return;
    const favorite = !row.favorite;
    await db.runAsync('UPDATE tracks SET favorite = ? WHERE id = ?', favorite ? 1 : 0, trackId);
    const { tracks } = get();
    set({ tracks: tracks.map((t) => (t.id === trackId ? { ...t, favorite } : t)) });
  },

  setPlaybackPosition: async (trackId, positionMs) => {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO playbackState (trackId, positionMs, lastPlayedAt)
       VALUES (?, ?, ?)
       ON CONFLICT(trackId) DO UPDATE SET
         positionMs = excluded.positionMs,
         lastPlayedAt = excluded.lastPlayedAt`,
      trackId,
      positionMs,
      Date.now()
    );
    set((state) => ({ playbackPositions: { ...state.playbackPositions, [trackId]: positionMs } }));
  },

  createPlaylist: async (name) => {
    const db = await getDb();
    const id = `playlist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await db.runAsync('INSERT INTO playlists (id, name, createdAt) VALUES (?, ?, ?)', id, name, Date.now());
    const { playlists } = get();
    set({ playlists: [...playlists, { id, name, color: null, createdAt: Date.now() }] });
    return id;
  },

  renamePlaylist: async (id, name) => {
    const db = await getDb();
    await db.runAsync('UPDATE playlists SET name = ? WHERE id = ?', name, id);
    const { playlists } = get();
    set({ playlists: playlists.map((p) => (p.id === id ? { ...p, name } : p)) });
  },

  deletePlaylist: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM playlists WHERE id = ?', id);
    await db.runAsync('DELETE FROM playlistTracks WHERE playlistId = ?', id);
    const { playlists, playlistTracks } = get();
    set({
      playlists: playlists.filter((p) => p.id !== id),
      playlistTracks: playlistTracks.filter((r) => r.playlistId !== id),
    });
  },

  addToPlaylist: async (playlistId, trackId) => {
    const db = await getDb();
    const existing = await db.getFirstAsync(
      'SELECT 1 AS ok FROM playlistTracks WHERE playlistId = ? AND trackId = ?',
      playlistId,
      trackId
    );
    if (existing) return;
    const last = await db.getFirstAsync<{ max: number }>(
      'SELECT COALESCE(MAX(position), -1) + 1 AS max FROM playlistTracks WHERE playlistId = ?',
      playlistId
    );
    const position = last?.max ?? 0;
    await db.runAsync(
      'INSERT INTO playlistTracks (playlistId, trackId, position) VALUES (?, ?, ?)',
      playlistId,
      trackId,
      position
    );
    set((state) => ({ playlistTracks: [...state.playlistTracks, { playlistId, trackId, position }] }));
  },

  removeFromPlaylist: async (playlistId, trackId) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM playlistTracks WHERE playlistId = ? AND trackId = ?', playlistId, trackId);
    set((state) => ({
      playlistTracks: state.playlistTracks.filter((r) => !(r.playlistId === playlistId && r.trackId === trackId)),
    }));
  },

  getPlaylistTracks: (playlistId) => {
    const state = get();
    const rows = state.playlistTracks.filter((r) => r.playlistId === playlistId).sort((a, b) => a.position - b.position);
    const trackById = new Map(state.tracks.map((t) => [t.id, t]));
    return rows.map((r) => trackById.get(r.trackId)).filter((t): t is Track => t !== undefined);
  },

  getArtistTracks: (name) => {
    return get().tracks.filter((t) => t.artist === name || t.albumArtist === name);
  },

  getAlbumTracks: (artist, title) => {
    return get().tracks.filter((t) => t.album === title && (t.artist || t.albumArtist) === artist);
  },

  setTrackArtworkUri: async (trackId, uri) => {
    const db = await getDb();
    await db.runAsync('UPDATE tracks SET artworkUri = ? WHERE id = ?', uri, trackId);
    const { tracks } = get();
    set({ tracks: tracks.map((t) => (t.id === trackId ? { ...t, artworkUri: uri } : t)) });
  },

  setTrackLocalUri: async (trackId, uri) => {
    const db = await getDb();
    await db.runAsync('UPDATE tracks SET localUri = ? WHERE id = ?', uri, trackId);
    const { tracks } = get();
    set({ tracks: tracks.map((t) => (t.id === trackId ? { ...t, localUri: uri } : t)) });
  },

  recordPlayback: async (trackId) => {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO playbackState (trackId, positionMs, lastPlayedAt) VALUES (?, 0, ?)
       ON CONFLICT(trackId) DO UPDATE SET lastPlayedAt = excluded.lastPlayedAt`,
      trackId,
      Date.now()
    );
  },

  updateTrack: async (trackId, patch) => {
    const db = await getDb();
    const current = get().tracks.find((t) => t.id === trackId);
    if (!current) return;
    const next: Track = { ...current, ...patch };
    await db.runAsync(
      `UPDATE tracks SET title = ?, artist = ?, album = ?, albumArtist = ?, genre = ?, artworkUri = ? WHERE id = ?`,
      next.title,
      next.artist,
      next.album,
      next.albumArtist,
      next.genre,
      next.artworkUri,
      trackId
    );
    set((state) => ({ tracks: state.tracks.map((t) => (t.id === trackId ? next : t)) }));
  },

  deleteTrack: async (trackId) => {
    await get().deleteTracks([trackId]);
  },

  deleteTracks: async (trackIds) => {
    if (trackIds.length === 0) return;
    const db = await getDb();
    const ids = new Set(trackIds);
    for (const id of trackIds) {
      await db.runAsync('DELETE FROM tracks WHERE id = ?', id);
      await db.runAsync('DELETE FROM playlistTracks WHERE trackId = ?', id);
      await db.runAsync('DELETE FROM playbackState WHERE trackId = ?', id);
    }
    set((state) => ({
      tracks: state.tracks.filter((t) => !ids.has(t.id)),
      playlistTracks: state.playlistTracks.filter((r) => !ids.has(r.trackId)),
      recentlyPlayed: state.recentlyPlayed.filter((t) => !ids.has(t.id)),
      playbackPositions: Object.fromEntries(
        Object.entries(state.playbackPositions).filter(([id]) => !ids.has(id))
      ),
    }));
  },
}));
