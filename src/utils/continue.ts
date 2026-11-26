import type { FolderMediaType, Track } from '@/lib/db/schema';

export type ContinueItem = {
  track: Track;
  /** Position in seconds. */
  position: number;
  /** Duration in seconds. */
  duration: number;
  /** 0–1 playback progress. */
  progress: number;
  lastPlayedAt: number;
};

const MIN_POSITION_SECONDS = 10;
const END_GUARD_SECONDS = 10;

/** Returns a resumable item for a track, or null when it is not in progress. */
function toContinueItem(
  track: Track,
  positions: Record<string, number>,
  lastPlayedAt: Record<string, number>,
  mediaType: FolderMediaType,
): ContinueItem | null {
  if ((track.mediaType === 'video') !== (mediaType === 'video')) return null;

  const position = positions[track.id] ?? 0;
  if (position < MIN_POSITION_SECONDS) return null;

  const duration = track.durationMs > 0 ? track.durationMs / 1000 : 0;
  if (duration > 0 && position >= duration - END_GUARD_SECONDS) return null;
  if (duration <= 0 && position > 60 * 60 * 12) return null;

  return {
    track,
    position,
    duration,
    progress: duration > 0 ? Math.min(1, position / duration) : 0,
    lastPlayedAt: lastPlayedAt[track.id] ?? 0,
  };
}

/** Newer items come first, with track age as the tie-breaker. */
function isNewer(candidate: ContinueItem, current: ContinueItem | null) {
  if (!current) return true;
  return (
    candidate.lastPlayedAt > current.lastPlayedAt ||
    (candidate.lastPlayedAt === current.lastPlayedAt &&
      (candidate.track.addedAt ?? 0) > (current.track.addedAt ?? 0))
  );
}

/**
 * Tracks the user can meaningfully resume: started, not finished, ordered by
 * most recent playback. Pure so screens can memoize it from store slices.
 */
export function getContinueItems(
  tracks: Track[],
  positions: Record<string, number>,
  lastPlayedAt: Record<string, number>,
  mediaType: FolderMediaType,
  limit = 8,
): ContinueItem[] {
  const items: ContinueItem[] = [];

  for (const track of tracks) {
    const item = toContinueItem(track, positions, lastPlayedAt, mediaType);
    if (item) items.push(item);
  }

  return items
    .sort(
      (a, b) =>
        b.lastPlayedAt - a.lastPlayedAt ||
        (b.track.addedAt ?? 0) - (a.track.addedAt ?? 0),
    )
    .slice(0, limit);
}

/** Finds the latest resumable item without sorting the whole library. */
export function getLatestContinueItem(
  tracks: Track[],
  positions: Record<string, number>,
  lastPlayedAt: Record<string, number>,
  mediaType: FolderMediaType,
): ContinueItem | null {
  let latest: ContinueItem | null = null;

  for (const track of tracks) {
    const item = toContinueItem(track, positions, lastPlayedAt, mediaType);
    if (item && isNewer(item, latest)) latest = item;
  }

  return latest;
}
