import { useMemo } from 'react';

import { queryMedia } from '../services';
import type { MediaItem, MediaListContext, MediaQuery, MediaQueryResult } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

export interface UseMediaQueryOptions extends MediaQuery {
  context?: MediaListContext;
  debounceMs?: number;
}

/** Runs the shared query engine with a debounced contextual search term. */
export function useMediaQuery(
  items: MediaItem[],
  options: UseMediaQueryOptions = {},
): MediaQueryResult {
  const {
    search = '',
    filter,
    sort,
    offset = 0,
    limit,
    context,
    debounceMs = 250,
  } = options;
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  return useMemo(
    () => queryMedia(items, { search: debouncedSearch, filter, sort, offset, limit }, context),
    [items, debouncedSearch, filter, sort, offset, limit, context],
  );
}
