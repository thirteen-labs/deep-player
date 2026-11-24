import { createContext, useContext, type PropsWithChildren } from 'react';

import type { ThemePalette } from '@/constants/theme';

const ThemeOverrideContext = createContext<ThemePalette | null>(null);

/** Scopes an alternate palette to a subtree without changing the app theme. */
export function ThemeOverrideProvider({
  theme,
  children,
}: PropsWithChildren<{ theme: ThemePalette }>) {
  return <ThemeOverrideContext.Provider value={theme}>{children}</ThemeOverrideContext.Provider>;
}

export function useThemeOverride(): ThemePalette | null {
  return useContext(ThemeOverrideContext);
}
