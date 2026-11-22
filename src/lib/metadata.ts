import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';
import { parseBuffer } from 'music-metadata';

import type { Track } from '@/lib/db/schema';

export type FetchedTrackMetadata = Partial<
  Pick<Track, 'title' | 'artist' | 'album' | 'albumArtist' | 'genre' | 'artworkUri'>
>;

function toUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function getMimeFromPath(path: string): string | undefined {
  const lower = path.toLowerCase();
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) return 'audio/mp4';
  if (lower.endsWith('.flac')) return 'audio/flac';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.aac')) return 'audio/aac';
  return undefined;
}

export async function fetchTrackMetadata(
  track: Pick<Track, 'id' | 'uri' | 'localUri' | 'title'>
): Promise<FetchedTrackMetadata> {
  const uri = track.localUri || track.uri;
  if (!uri) return {};

  try {
    const info = await FileSystem.getInfoAsync(uri);
    // Avoid loading very large files fully into memory for tag reading.
    if (info.exists && typeof info.size === 'number' && info.size > 25 * 1024 * 1024) {
      return {};
    }
  } catch {
    // If size check fails, continue and try reading.
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = toUint8Array(base64);
  const mimeType = getMimeFromPath(uri);
  const parsed = await parseBuffer(bytes, { mimeType, size: bytes.byteLength }, { duration: false, skipCovers: true });

  const common = parsed.common;
  const title = common.title?.trim();
  const artist = common.artist?.trim();
  const album = common.album?.trim();
  const albumArtist = common.albumartist?.trim();
  const genre = common.genre?.[0]?.trim();

  return {
    ...(title ? { title } : {}),
    ...(artist ? { artist } : {}),
    ...(album ? { album } : {}),
    ...(albumArtist ? { albumArtist } : {}),
    ...(genre ? { genre } : {}),
  };
}