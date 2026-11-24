import type { ImageColorsResult } from 'react-native-image-colors';

type GetColors = typeof import('react-native-image-colors').getColors;
type ImageColorsConfig = Parameters<GetColors>[1];

let getColorsLoader: Promise<GetColors | null> | null = null;

/**
 * `react-native-image-colors` calls `requireNativeModule('ImageColors')` at
 * import time. That module is not bundled with Expo Go, so a static import
 * would throw while the route graph is loading (and make every route look
 * like it is missing a default export). Load it lazily and remember the
 * failure so callers can fall back to the app theme palette.
 */
function loadGetColors(): Promise<GetColors | null> {
  if (!getColorsLoader) {
    getColorsLoader = import('react-native-image-colors')
      .then((module) => module.getColors)
      .catch(() => null);
  }
  return getColorsLoader;
}

/** Extracts a palette, or returns `null` when native color extraction is unavailable. */
export async function extractImageColors(
  uri: string,
  config?: ImageColorsConfig,
): Promise<ImageColorsResult | null> {
  const getColors = await loadGetColors();
  if (!getColors) return null;

  try {
    return await getColors(uri, config);
  } catch {
    return null;
  }
}
