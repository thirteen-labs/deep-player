/**
 * Persisted UI state for the unified media-list architecture.
 *
 * Media metadata stays in SQLite; this store only owns presentation state:
 * per-list layout/sort/filter choices and user-created smart-list rules.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getSettingsStorage } from '@/features/settings/store/settings.persistence';

import { DEFAULT_LAYOUT_PREFERENCES, DEFAULT_SORT, defaultSectionPreference } from '../types';
import type {
  ListPreference,
  MediaFilter,
  MediaPreferences,
  MediaSection,
  SmartList,
  SortConfig,
} from '../types';
import {
  MEDIA_LIST_SCHEMA_VERSION,
  MEDIA_LIST_STORAGE_KEY,
  parsePersistedMediaLists,
  type PersistedMediaLists,
} from './media-list.schema';

function defaults(): PersistedMediaLists {
  return {
    preferences: {
      layout: {
        smart: { ...DEFAULT_LAYOUT_PREFERENCES.smart },
        music: { ...DEFAULT_LAYOUT_PREFERENCES.music },
        video: { ...DEFAULT_LAYOUT_PREFERENCES.video },
      },
      rememberCustomLayouts: true,
      lastOpenedSection: 'music',
      defaultSort: {
        smart: DEFAULT_SORT.smart.field,
        music: DEFAULT_SORT.music.field,
        video: DEFAULT_SORT.video.field,
      },
    },
    layoutsByList: {},
    sortsByList: {},
    filtersByList: {},
    customSmartLists: [],
    hiddenSmartListIds: [],
    pinnedSmartListIds: [],
    smartListOrder: [],
  };
}

export interface MediaListState extends PersistedMediaLists {
  setLayout: (listKey: string, section: MediaSection, preference: ListPreference) => void;
  clearLayout: (listKey: string) => void;
  setSort: (listKey: string, sort: SortConfig) => void;
  setFilter: (listKey: string, filter: MediaFilter) => void;
  clearListPreferences: (listKey: string) => void;
  setLastOpenedSection: (section: MediaSection) => void;
  setRememberCustomLayouts: (value: boolean) => void;

  createSmartList: (list: SmartList) => void;
  updateSmartList: (list: SmartList) => void;
  deleteSmartList: (id: string) => void;
  toggleSmartListHidden: (id: string) => void;
  toggleSmartListPinned: (id: string) => void;
  setSmartListOrder: (ids: string[]) => void;
}

export const useMediaListStore = create<MediaListState>()(
  persist(
    (set) => ({
      ...defaults(),

      setLayout: (listKey, section, preference) =>
        set((state) => ({
          layoutsByList: {
            ...state.layoutsByList,
            [listKey]: { ...defaultSectionPreference(section), ...preference },
          },
        })),

      clearLayout: (listKey) =>
        set((state) => {
          const layoutsByList = { ...state.layoutsByList };
          delete layoutsByList[listKey];
          return { layoutsByList };
        }),

      setSort: (listKey, sort) =>
        set((state) => ({ sortsByList: { ...state.sortsByList, [listKey]: sort } })),

      setFilter: (listKey, filter) =>
        set((state) => ({ filtersByList: { ...state.filtersByList, [listKey]: filter } })),

      clearListPreferences: (listKey) =>
        set((state) => {
          const layoutsByList = { ...state.layoutsByList };
          const sortsByList = { ...state.sortsByList };
          const filtersByList = { ...state.filtersByList };
          delete layoutsByList[listKey];
          delete sortsByList[listKey];
          delete filtersByList[listKey];
          return { layoutsByList, sortsByList, filtersByList };
        }),

      setLastOpenedSection: (lastOpenedSection) =>
        set((state) => ({ preferences: { ...state.preferences, lastOpenedSection } })),

      setRememberCustomLayouts: (rememberCustomLayouts) =>
        set((state) => ({ preferences: { ...state.preferences, rememberCustomLayouts } })),

      createSmartList: (list) =>
        set((state) => ({
          customSmartLists: [...state.customSmartLists.filter((item) => item.id !== list.id), list],
          smartListOrder: [...state.smartListOrder.filter((id) => id !== list.id), list.id],
        })),

      updateSmartList: (list) =>
        set((state) => ({
          customSmartLists: state.customSmartLists.map((item) => (item.id === list.id ? list : item)),
        })),

      deleteSmartList: (id) =>
        set((state) => ({
          customSmartLists: state.customSmartLists.filter((item) => item.id !== id || item.isSystem),
          hiddenSmartListIds: state.hiddenSmartListIds.filter((value) => value !== id),
          pinnedSmartListIds: state.pinnedSmartListIds.filter((value) => value !== id),
          smartListOrder: state.smartListOrder.filter((value) => value !== id),
        })),

      toggleSmartListHidden: (id) =>
        set((state) => ({
          hiddenSmartListIds: state.hiddenSmartListIds.includes(id)
            ? state.hiddenSmartListIds.filter((value) => value !== id)
            : [...state.hiddenSmartListIds, id],
        })),

      toggleSmartListPinned: (id) =>
        set((state) => ({
          pinnedSmartListIds: state.pinnedSmartListIds.includes(id)
            ? state.pinnedSmartListIds.filter((value) => value !== id)
            : [...state.pinnedSmartListIds, id],
        })),

      setSmartListOrder: (smartListOrder) => set({ smartListOrder }),
    }),
    {
      name: MEDIA_LIST_STORAGE_KEY,
      version: MEDIA_LIST_SCHEMA_VERSION,
      storage: createJSONStorage(() => getSettingsStorage()),
      partialize: (state): PersistedMediaLists => ({
        preferences: state.preferences,
        layoutsByList: state.layoutsByList,
        sortsByList: state.sortsByList,
        filtersByList: state.filtersByList,
        customSmartLists: state.customSmartLists,
        hiddenSmartListIds: state.hiddenSmartListIds,
        pinnedSmartListIds: state.pinnedSmartListIds,
        smartListOrder: state.smartListOrder,
      }),
      migrate: () => defaults(),
      merge: (persistedState, currentState) => {
        const parsed = parsePersistedMediaLists(persistedState);
        return parsed ? { ...currentState, ...parsed } : currentState;
      },
    },
  ),
);

/** Non-hook access for services and event handlers. */
export const mediaListStoreApi = useMediaListStore;

export function getListSort(listKey: string, section: MediaSection): SortConfig {
  return useMediaListStore.getState().sortsByList[listKey] ?? DEFAULT_SORT[section];
}

export function getListFilter(listKey: string): MediaFilter {
  return useMediaListStore.getState().filtersByList[listKey] ?? {};
}

export function getListLayout(listKey: string, section: MediaSection): ListPreference {
  const { layoutsByList, preferences } = useMediaListStore.getState();
  if (!preferences.rememberCustomLayouts) return defaultSectionPreference(section);
  return layoutsByList[listKey] ?? defaultSectionPreference(section);
}

export function getMediaPreferences(): MediaPreferences {
  return useMediaListStore.getState().preferences;
}
