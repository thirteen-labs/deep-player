import { useCallback } from 'react';

import { useMediaListStore } from '../store';
import type { MediaFilter } from '../types';

/** Read/write a persisted filter scoped to one list. */
export function useMediaFilter(listKey: string) {
  const filter = useMediaListStore((state) => state.filtersByList[listKey]);
  const setFilterAction = useMediaListStore((state) => state.setFilter);

  const setFilter = useCallback(
    (next: MediaFilter) => setFilterAction(listKey, next),
    [listKey, setFilterAction],
  );

  const clearFilter = useCallback(() => setFilterAction(listKey, {}), [listKey, setFilterAction]);

  return { filter, setFilter, clearFilter };
}
