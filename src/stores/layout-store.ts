import { create } from 'zustand';

export type ListLayout = 'flex' | 'grid';

export const LIST_LAYOUT_OPTIONS: { value: ListLayout; label: string }[] = [
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
];

type LayoutStore = {
  listLayout: ListLayout;
  hydrated: boolean;
  setListLayout: (value: ListLayout) => void;
  hydrate: (value: ListLayout) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  listLayout: 'flex',
  hydrated: false,
  setListLayout: (listLayout) => set({ listLayout }),
  hydrate: (listLayout) => set({ listLayout, hydrated: true }),
}));
