import type { MediaListStateKind } from '../types';

export interface MediaListStateInput {
  isLoading?: boolean;
  error?: string | null;
  count: number;
  search?: string;
  permissionDenied?: boolean;
  /** Number of visible items whose local files are unavailable. */
  missingCount?: number;
}

/** Resolve the highest-priority list-level state to show. */
export function useMediaListState({
  isLoading,
  error,
  count,
  search,
  permissionDenied,
  missingCount = 0,
}: MediaListStateInput): MediaListStateKind | null {
  if (isLoading) return 'loading';
  if (permissionDenied) return 'permission';
  if (error) return 'error';
  if (count === 0 && search?.trim()) return 'search';
  if (count === 0) return 'empty';
  if (missingCount > 0 && missingCount >= count) return 'missing';
  return null;
}
