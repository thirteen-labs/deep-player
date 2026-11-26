import { create } from 'zustand';

import { TRACK_SORT_OPTIONS, type TrackSortKey } from '@/utils/track-sorting';

export type UniversalSort = TrackSortKey;
export type SmartListSort = 'name' | 'recent' | 'type';

export type SortOption<T extends string> = { value: T; label: string };

/** The universal sort uses the app's existing track-sorting options. */
export const UNIVERSAL_SORT_OPTIONS: SortOption<UniversalSort>[] = TRACK_SORT_OPTIONS.map(
  (option) => ({ value: option.key, label: option.label }),
);

export const SMART_LIST_SORT_OPTIONS: SortOption<SmartListSort>[] = [
  { value: 'name', label: 'Name' },
  { value: 'recent', label: 'Recently added' },
  { value: 'type', label: 'Type' },
];

/** Compact options for the Music tab's dedicated sort bar. */
export const MUSIC_SORT_OPTIONS: SortOption<UniversalSort>[] = [
  { value: 'title-asc', label: 'Title' },
  { value: 'duration-desc', label: 'Duration' },
  { value: 'artist-asc', label: 'Artist' },
  { value: 'size-desc', label: 'Size' },
  { value: 'album-asc', label: 'Album' },
  { value: 'recently-added', label: 'Age' },
];

type SortStore = {
  universalSort: UniversalSort;
  smartListSort: SmartListSort;
  /** Music tab sort, kept separate so Videos keeps its own selection. */
  musicSort: UniversalSort;
  setUniversalSort: (value: UniversalSort) => void;
  setSmartListSort: (value: SmartListSort) => void;
  setMusicSort: (value: UniversalSort) => void;
};

export const useSortStore = create<SortStore>((set) => ({
  universalSort: 'recently-added',
  smartListSort: 'name',
  musicSort: 'title-asc',
  setUniversalSort: (universalSort) => set({ universalSort }),
  setSmartListSort: (smartListSort) => set({ smartListSort }),
  setMusicSort: (musicSort) => set({ musicSort }),
}));
