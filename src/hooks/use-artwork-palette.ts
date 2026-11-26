import { useEffect, useMemo, useState } from 'react';
import type { ImageColorsResult } from 'react-native-image-colors';

import { THEME_CONFIG, type ThemePalette } from '@/constants/theme';
import { useSettingsStore } from '@/features/settings/store/settings.store';
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
 * its primary color when there is no artwork or color extraction fails.
 */
export function useArtworkPalette(uri?: string | null): ThemePalette | null {
  const { theme: baseTheme } = useResolvedTheme();
  const [state, setState] = useState<ColorState>(EMPTY_STATE);
  const dynamicColors = useSettingsStore((s) => s.settings.appearance.dynamicColors);
  const dynamicSource = useSettingsStore((s) => s.settings.appearance.dynamicColorSource);
  const hideSensitive = useSettingsStore((s) => s.settings.privacy.hideSensitiveThumbnails);
  const enabled =
    THEME_CONFIG.settings.dynamicAlbumArtTheme &&
    dynamicColors &&
    dynamicSource === 'album-art' &&
    !hideSensitive;

  useEffect(() => {
    let cancelled = false;
    if (!enabled || !uri) return;

    void extractImageColors(uri, {
      fallback: baseTheme.primary,
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
  }, [enabled, uri, baseTheme.primary]);

  return useMemo(() => {
    if (!enabled || !uri) return null;
    const colors = state.uri === uri ? state.colors : null;
    return buildArtworkPalette(pickSourceColor(colors, baseTheme.primary), baseTheme, uri);
  }, [enabled, uri, state, baseTheme]);
}
