import { Asset, AssetField, MediaType, Query } from 'expo-media-library';

import type { FolderMediaType, Track } from '@/lib/db/schema';
import { getDb } from '@/lib/db/schema';

const EXTENSION_RE = /\.[^.]+$/;

async function assetToTrack(asset: Asset, mediaType: FolderMediaType): Promise<Track> {
  const [uri, durationMs, addedAtSec, favorite, filename] = await Promise.all([
    asset.getUri(),
    asset.getDuration(),
    asset.getCreationTime(),
    asset.getFavorite(),
    asset.getFilename(),
  ]);
  return {
    id: asset.id,
    title: filename.replace(EXTENSION_RE, '') || asset.id,
    artist: '',
    album: '',
    albumArtist: '',
    genre: '',
    durationMs: durationMs ?? 0,
    mimeType: null,
    uri,
    artworkUri: null,
    localUri: null,
    favorite,
    mediaType,
    addedAt: addedAtSec ? addedAtSec * 1000 : Date.now(),
  };
}

async function scan(mediaType: FolderMediaType): Promise<Track[]> {
  const assets = await new Query()
    .eq(AssetField.MEDIA_TYPE, mediaType === 'video' ? MediaType.VIDEO : MediaType.AUDIO)
    .orderBy(AssetField.CREATION_TIME)
    .limit(500)
    .exe();

  const tracks = await Promise.all(assets.map((asset) => assetToTrack(asset, mediaType)));

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

  return tracks;
}

/** Scans the device audio library for music tracks and upserts them into the local SQLite library. Requires read permission on the media library. Returns the scanned tracks. */
export async function scanLibrary(): Promise<Track[]> {
  return scan('music');
}

/** Scans the device media library for videos and upserts them into the local SQLite library. Requires read permission on the media library. Returns the scanned videos. */
export async function scanVideos(): Promise<Track[]> {
  return scan('video');
}
