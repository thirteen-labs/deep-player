import { Directory, File, Paths } from 'expo-file-system';

import type { FolderMediaType, Track } from '@/lib/db/schema';

/** Keep video downloads separate from audio so warming covers both libraries. */
const CACHE_DIRS: Record<FolderMediaType, string> = {
  music: 'cached-audio',
  video: 'cached-video',
};

function isNetworkUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

/** File-safe name derived from the track id (media-library ids can contain slashes). */
function fileNameFor(track: Track): string {
  return track.id.replace(/[^a-zA-Z0-9-_]/g, '_');
}

/**
 * Returns the on-device copy of a track's file when it is already cached,
 * downloading it when missing. Returns null when there is nothing to cache
 * (local/platform URIs, or a failed download).
 */
export async function cacheTrack(track: Track): Promise<string | null> {
  if (!isNetworkUri(track.uri)) {
    return track.localUri ?? null;
  }
  try {
    const dir = new Directory(Paths.document, CACHE_DIRS[track.mediaType]);
    if (!dir.exists) {
      dir.create();
    }
    const target = new File(dir, fileNameFor(track));
    if (target.exists) {
      return target.uri;
    }
    const downloaded = await File.downloadFileAsync(track.uri, target);
    return downloaded.uri;
  } catch {
    return null;
  }
}

export async function cacheArtwork(track: Track): Promise<string | null> {
  if (!isNetworkUri(track.artworkUri ?? '')) {
    return null;
  }
  try {
    const dir = new Directory(Paths.document, 'artwork');
    if (!dir.exists) {
      dir.create();
    }
    const target = new File(dir, fileNameFor(track));
    if (target.exists) {
      return target.uri;
    }
    const downloaded = await File.downloadFileAsync(track.artworkUri as string, target);
    return downloaded.uri;
  } catch {
    return null;
  }
}
