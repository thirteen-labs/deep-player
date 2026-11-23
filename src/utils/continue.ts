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
    if ((track.mediaType === 'video') !== (mediaType === 'video')) continue;
    const position = positions[track.id] ?? 0;
    if (position < MIN_POSITION_SECONDS) continue;

    const duration = track.durationMs > 0 ? track.durationMs / 1000 : 0;
    if (duration > 0 && position >= duration - END_GUARD_SECONDS) continue;
    if (duration <= 0 && position > 60 * 60 * 12) continue;

    items.push({
      track,
      position,
      duration,
      progress: duration > 0 ? Math.min(1, position / duration) : 0,
      lastPlayedAt: lastPlayedAt[track.id] ?? 0,
    });
  }

  return items
    .sort(
      (a, b) =>
        b.lastPlayedAt - a.lastPlayedAt ||
        (b.track.addedAt ?? 0) - (a.track.addedAt ?? 0),
    )
    .slice(0, limit);
}
