import { create } from 'zustand';

import type { FontScale } from '@/constants/typography';

const DEFAULT_FONT_SCALE: FontScale = 'medium';

type FontSizeStore = {
  fontScale: FontScale;
  hydrated: boolean;
  setFontScale: (value: FontScale) => void;
  hydrate: (value: FontScale) => void;
};

export const useFontSizeStore = create<FontSizeStore>((set) => ({
  fontScale: DEFAULT_FONT_SCALE,
  hydrated: false,
  setFontScale: (fontScale) => set({ fontScale }),
  hydrate: (fontScale) => set({ fontScale, hydrated: true }),
}));

/** App-wide text size step, mirrored by ThemedText. */
export function useFontScale(): FontScale {
  return useFontSizeStore((s) => s.fontScale);
}

export type { FontScale };
