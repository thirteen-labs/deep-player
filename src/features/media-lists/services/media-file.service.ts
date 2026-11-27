/**
 * Lightweight local-file availability checks for list rows.
 *
 * The library keeps media rows even when the underlying file is removed or an
 * Android SAF permission is revoked. Checking `File.exists` is synchronous and
 * cached by URI; results are intentionally not persisted because device state
 * can change between launches.
 */
import { File } from 'expo-file-system';

import type { MediaItem } from '../types';

const existenceByUri = new Map<string, boolean>();
const MAX_CACHE_ENTRIES = 2000;

/** URIs that File cannot inspect locally (remote or platform-photo references). */
function inspectableUri(item: MediaItem): string | null {
  const uri = item.localUri ?? item.uri;
  if (!uri) return null;
  if (/^(https?:|ph:|assets-library:|asset:)/i.test(uri)) return null;
  return uri;
}

/** True only when a local file is known to be gone or unreadable. */
export function isMediaFileMissing(item: MediaItem): boolean {
  const uri = inspectableUri(item);
  if (!uri) return false;

  const cached = existenceByUri.get(uri);
  if (cached != null) return !cached;

  try {
    const exists = new File(uri).exists;
    if (existenceByUri.size >= MAX_CACHE_ENTRIES) {
      const oldest = existenceByUri.keys().next().value;
      if (oldest != null) existenceByUri.delete(oldest);
    }
    existenceByUri.set(uri, exists);
    return !exists;
  } catch {
    // Unknown URI schemes must not be reported as missing media.
    return false;
  }
}

/** Clears cached checks, for example after a rescan or permission change. */
export function clearMediaFileCache(): void {
  existenceByUri.clear();
}
