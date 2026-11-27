import { useCallback } from 'react';

import { useMediaListStore } from '../store';
import { DEFAULT_SORT } from '../types';
import type { MediaSection, SortConfig } from '../types';

/** Read/write a persisted sort choice scoped to one list. */
export function useMediaSort(listKey: string, section: MediaSection) {
  const sort = useMediaListStore((state) => state.sortsByList[listKey] ?? DEFAULT_SORT[section]);
  const setSortAction = useMediaListStore((state) => state.setSort);

  const setSort = useCallback(
    (field: SortConfig['field'], direction?: SortConfig['direction']) => {
      setSortAction(listKey, { field, direction: direction ?? 'asc' });
    },
    [listKey, setSortAction],
  );

  const toggleDirection = useCallback(() => {
    setSortAction(listKey, { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
  }, [listKey, setSortAction, sort]);

  const setSortConfig = useCallback(
    (next: SortConfig) => setSortAction(listKey, next),
    [listKey, setSortAction],
  );

  return { sort, setSort, setSortConfig, toggleDirection };
}
