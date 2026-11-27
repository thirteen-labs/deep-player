import { useCallback } from 'react';

import { useMediaListStore } from '../store';
import { defaultSectionPreference } from '../types';
import type { ListLayout, ListPreference, MediaSection } from '../types';

/** Read/write a persisted layout choice scoped to one list. */
export function useMediaLayout(listKey: string, section: MediaSection) {
  const remember = useMediaListStore((state) => state.preferences.rememberCustomLayouts);
  const stored = useMediaListStore((state) => state.layoutsByList[listKey]);
  const setLayoutAction = useMediaListStore((state) => state.setLayout);

  const preference: ListPreference = remember
    ? stored ?? defaultSectionPreference(section)
    : defaultSectionPreference(section);

  const setLayout = useCallback(
    (layout: ListLayout, columns?: number) => setLayoutAction(listKey, section, { layout, columns }),
    [listKey, section, setLayoutAction],
  );

  return { preference, layout: preference.layout, setLayout };
}
