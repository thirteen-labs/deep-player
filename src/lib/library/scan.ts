import { File } from 'expo-file-system';
import {
  Asset,
  AssetField,
  type AssetMetadata,
  AssetUriVersion,
  MediaType,
  Query,
} from 'expo-media-library';

import { clearMediaFileCache } from '@/features/media-lists/services/media-file.service';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { enqueueDbTask } from '@/lib/db/queue';
import type { FolderMediaType, Track } from '@/lib/db/schema';
import { getDb } from '@/lib/db/schema';

const EXTENSION_RE = /\.[^.]+$/;
const SCAN_LIMIT = 500;
const URI_BATCH_SIZE = 20;

export type ScanKind = 'all' | 'music' | 'video';

const UPSERT_TRACK_SQL = `
  INSERT INTO tracks (id, title, artist, album, albumArtist, genre, durationMs, size, mimeType, uri, artworkUri, favorite, mediaType, addedAt, localUri)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    artist = excluded.artist,
    album = excluded.album,
    albumArtist = excluded.albumArtist,
    genre = excluded.genre,
    durationMs = excluded.durationMs,
    size = CASE WHEN excluded.size > 0 THEN excluded.size ELSE tracks.size END,
    mimeType = excluded.mimeType,
    uri = excluded.uri,
    artworkUri = COALESCE(excluded.artworkUri, tracks.artworkUri),
    favorite = excluded.favorite,
    mediaType = excluded.mediaType,
    addedAt = excluded.addedAt,
    localUri = COALESCE(excluded.localUri, tracks.localUri)`;

/** Reads an asset's byte size, falling back to zero when the media store hides it. */
async function getFileSize(uri: string): Promise<number> {
  try {
    return (await new File(uri).info()).size ?? 0;
  } catch {
    return 0;
  }
}

function metadataToTrack(
  metadata: AssetMetadata,
  mediaType: FolderMediaType,
  uri: string,
  size: number,
): Track {
  const filename = metadata.filename ?? metadata.id;

  return {
    id: metadata.id,
    title: filename.replace(EXTENSION_RE, '') || metadata.id,
    artist: '',
    album: '',
    albumArtist: '',
    genre: '',
    durationMs: Math.max(0, (metadata.duration ?? 0) * 1000),
    size,
    mimeType: null,
    uri,
    artworkUri: null,
    localUri: null,
    favorite: metadata.isFavorite,
    mediaType,
    addedAt: metadata.creationTime ? metadata.creationTime * 1000 : Date.now(),
    hidden: false,
  };
}

/**
 * Resolving every asset field with a separate native call was enough to stall
 * and sometimes kill Expo Go on large libraries. Metadata is cheap, and URIs
 * are resolved in small batches with a prepared database write afterwards.
 */
async function resolveTracks(
  metadata: AssetMetadata[],
  mediaType: FolderMediaType,
): Promise<Track[]> {
  const tracks: Track[] = [];
  let skipped = 0;

  for (let offset = 0; offset < metadata.length; offset += URI_BATCH_SIZE) {
    const batch = metadata.slice(offset, offset + URI_BATCH_SIZE);
    const resolved = await Promise.all(
      batch.map(async (item) => {
        try {
          // Original assets avoid slow-motion/trimmed video exports on iOS.
          const uri = await new Asset(item.id).getUri({ version: AssetUriVersion.ORIGINAL });
          if (!uri) throw new Error('Empty asset URI');
          const size = await getFileSize(uri);
          return metadataToTrack(item, mediaType, uri, size);
        } catch {
          skipped += 1;
          return null;
        }
      }),
    );

    for (const track of resolved) {
      if (track) tracks.push(track);
    }
  }

  if (metadata.length > 0 && tracks.length === 0) {
    throw new Error('Unable to resolve media URIs');
  }
  if (skipped > 0) {
    console.warn(`Skipped ${skipped} media asset(s) with unavailable URIs`);
  }

  return tracks;
}

async function upsertTracks(tracks: Track[]): Promise<void> {
  if (tracks.length === 0) return;

  await enqueueDbTask(async () => {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      const statement = await db.prepareAsync(UPSERT_TRACK_SQL);
      try {
        for (const track of tracks) {
          await statement.executeAsync([
            track.id,
            track.title,
            track.artist,
            track.album,
            track.albumArtist,
            track.genre,
            track.durationMs,
            track.size,
            track.mimeType,
            track.uri,
            track.artworkUri,
            track.favorite ? 1 : 0,
            track.mediaType,
            track.addedAt,
            track.localUri,
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
  });
}

/** Media-library metadata has no hidden flag; dot-prefixed names are the reliable signal. */
function isHiddenAsset(item: AssetMetadata): boolean {
  return Boolean(item.filename?.startsWith('.'));
}

/** Collapses repeated copies of the same media file during a scan. */
function dedupeTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    const key = `${track.uri}|${track.size}|${Math.round(track.durationMs)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function scan(mediaType: FolderMediaType): Promise<Track[]> {
  const folders = useSettingsStore.getState().settings.folders;
  let metadata = await new Query()
    .eq(AssetField.MEDIA_TYPE, mediaType === 'video' ? MediaType.VIDEO : MediaType.AUDIO)
    .orderBy(AssetField.CREATION_TIME)
    .limit(SCAN_LIMIT)
    .exeForMetadata();

  if (!folders.includeHidden) metadata = metadata.filter((item) => !isHiddenAsset(item));

  let tracks = await resolveTracks(metadata, mediaType);
  if (folders.detectDuplicates) tracks = dedupeTracks(tracks);
  await upsertTracks(tracks);

  return tracks;
}

/** Scans the device audio library and upserts tracks into the local SQLite library. */
export async function scanLibrary(): Promise<Track[]> {
  return scan('music');
}

/** Scans the device media library for videos and upserts them into the local SQLite library. */
export async function scanVideos(): Promise<Track[]> {
  return scan('video');
}

async function runScan(kind: ScanKind): Promise<Track[]> {
  const tracks: Track[] = [];
  if (kind !== 'video') tracks.push(...(await scanLibrary()));
  if (kind !== 'music') tracks.push(...(await scanVideos()));
  // Files may have appeared or disappeared; invalidate cached existence checks.
  clearMediaFileCache();
  return tracks;
}

let scanQueue: Promise<void> = Promise.resolve();

/**
 * Runs one scan at a time across the whole app. Settings screens and the
 * Videos tab can both request a scan, and concurrent writes were making the
 * database (and the app) unstable.
 */
export function scanMedia(kind: ScanKind): Promise<Track[]> {
  const task = scanQueue.then(() => runScan(kind));
  // Keep the queue alive after failures so a bad scan cannot block later ones.
  scanQueue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}
