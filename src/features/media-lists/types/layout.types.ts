/** Per-section and per-list layout preferences. */
import type { MediaSection } from './media-list.types';

export type ListLayout = 'grid' | 'list';

export interface SectionLayoutPreference {
  layout: ListLayout;
  columns?: number;
}

/**
 * Defaults mirror the product decision: Smart Lists are cards, Music is rows,
 * Videos are a two-column grid on phones.
 */
export interface LayoutPreferences {
  smart: { layout: 'grid'; columns: number };
  music: { layout: 'list' };
  video: { layout: 'grid'; columns: number };
}

export interface MediaPreferences {
  layout: LayoutPreferences;
  rememberCustomLayouts: boolean;
  lastOpenedSection: MediaSection;
  defaultSort: Record<MediaSection, string>;
}

/** A user choice for one concrete list, e.g. `music:songs` or `video:folders`. */
export interface ListPreference {
  layout: ListLayout;
  columns?: number;
}

export const DEFAULT_LAYOUT_PREFERENCES: LayoutPreferences = {
  smart: { layout: 'grid', columns: 2 },
  music: { layout: 'list' },
  video: { layout: 'grid', columns: 2 },
};

export function defaultSectionPreference(section: MediaSection): ListPreference {
  if (section === 'music') return { layout: 'list' };
  return { layout: 'grid', columns: 2 };
}
