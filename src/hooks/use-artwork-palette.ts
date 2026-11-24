import { useEffect, useMemo, useState } from 'react';
import type { ImageColorsResult } from 'react-native-image-colors';

import type { ThemePalette } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/use-theme-store';
import { extractImageColors } from '@/lib/image-colors';
import { buildArtworkPalette, pickSourceColor } from '@/utils/color';

type ColorState = {
  uri: string;
  colors: ImageColorsResult | null;
};

const EMPTY_STATE: ColorState = { uri: '', colors: null };

/**
 * Derives a full theme palette from the current track's artwork. Uses the
 * resolved app theme as the light/dark and contrast baseline, and falls back to
 * its tint when there is no artwork or color extraction fails.
 */
export function useArtworkPalette(uri?: string | null): ThemePalette | null {
  const { theme: baseTheme } = useResolvedTheme();
  const [state, setState] = useState<ColorState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;
    if (!uri) return;

    void extractImageColors(uri, {
      fallback: baseTheme.tint,
      cache: true,
      key: uri,
      quality: 'low',
    }).then((colors) => {
      // `null` keeps the resolved app theme as the palette fallback.
      if (!cancelled && colors) setState({ uri, colors });
    });

    return () => {
      cancelled = true;
    };
  }, [uri, baseTheme.tint]);

  return useMemo(() => {
    if (!uri) return null;
    const colors = state.uri === uri ? state.colors : null;
    return buildArtworkPalette(pickSourceColor(colors, baseTheme.tint), baseTheme, uri);
  }, [uri, state, baseTheme]);
}
