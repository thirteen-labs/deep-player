import { useMemo } from 'react';

import type { Track } from '@/lib/db/schema';
import { useSortStore } from '@/stores/sort-store';
import { sortTracks } from '@/utils/track-sorting';

/** Applies the user's universal sort to an already-filtered track collection. */
export function useSortedTracks(tracks: Track[]) {
  const universalSort = useSortStore((s) => s.universalSort);
  return useMemo(() => sortTracks(tracks, universalSort), [tracks, universalSort]);
}
