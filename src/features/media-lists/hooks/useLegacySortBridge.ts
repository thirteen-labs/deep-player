import { useEffect, useRef } from 'react';

import { useSortStore } from '@/stores/sort-store';

import { sortConfigToTrackSortKey, trackSortKeyToConfig } from '../adapters';
import { useMediaSort } from './useMediaSort';
import type { MediaSection } from '../types';

/**
 * Keeps the root sort sheet (legacy `universalSort`) in sync with a list's
 * persisted sort. The first run adopts the saved per-list value; later changes
 * are written back to that list only.
 */
export function useLegacySortBridge(listKey: string, section: MediaSection) {
  const { sort, setSortConfig } = useMediaSort(listKey, section);
  const universalSort = useSortStore((state) => state.universalSort);
  const setUniversalSort = useSortStore((state) => state.setUniversalSort);
  const didInitialize = useRef(false);
  const lastSynced = useRef(universalSort);

  useEffect(() => {
    if (!didInitialize.current) {
      didInitialize.current = true;
      const mapped = sortConfigToTrackSortKey(sort);
      lastSynced.current = mapped;
      if (mapped !== universalSort) setUniversalSort(mapped);
      return;
    }

    if (universalSort === lastSynced.current) return;
    lastSynced.current = universalSort;
    setSortConfig(trackSortKeyToConfig(universalSort));
  }, [setSortConfig, setUniversalSort, sort, universalSort]);
}
