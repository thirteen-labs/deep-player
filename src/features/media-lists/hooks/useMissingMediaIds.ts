import { useMemo } from 'react';

import { isMediaFileMissing } from '../services/media-file.service';
import type { MediaItem } from '../types';

/** Returns IDs whose local files are unavailable; artwork absence is separate. */
export function useMissingMediaIds(items: MediaItem[]): Set<string> {
  return useMemo(() => {
    const missing = new Set<string>();
    for (const item of items) {
      if (isMediaFileMissing(item)) missing.add(item.id);
    }
    return missing;
  }, [items]);
}
