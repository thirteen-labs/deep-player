import type { ImageColorsResult } from 'react-native-image-colors';

import type { ThemePalette } from '@/constants/theme';

type RGB = [number, number, number];
type HSL = [number, number, number];

type HslOverrides = {
  h?: number;
  s?: number;
  l?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Accepts #rgb / #rrggbb and tolerates missing or invalid values. */
export function normalizeColor(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')}`.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toLowerCase()}`;
  return fallback;
}

function hexToRgb(value: string): RGB {
  const hex = normalizeColor(value, '#000000').slice(1);
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]: RGB): string {
  const part = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

function rgbToHsl([r, g, b]: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return [hue, saturation, lightness];
}

function hslToRgb([h, s, l]: HSL): RGB {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = l - chroma / 2;
  let rgb: RGB;

  if (hue < 60) rgb = [chroma, second, 0];
  else if (hue < 120) rgb = [second, chroma, 0];
  else if (hue < 180) rgb = [0, chroma, second];
  else if (hue < 240) rgb = [0, second, chroma];
  else if (hue < 300) rgb = [second, 0, chroma];
  else rgb = [chroma, 0, second];

  return rgb.map((channel) => (channel + match) * 255) as RGB;
}

/** Shifts a color in HSL space while keeping its hue unless overridden. */
export function withHsl(color: string, overrides: HslOverrides, fallback = '#0A7EA4'): string {
  const [h, s, l] = rgbToHsl(hexToRgb(normalizeColor(color, fallback)));
  return rgbToHex(
    hslToRgb([overrides.h ?? h, clamp(overrides.s ?? s, 0, 1), clamp(overrides.l ?? l, 0, 1)]),
  );
}

/** Blends `second` into `first`; weight 0 = first, 1 = second. */
export function mixHex(
  first: string,
  second: string,
  weight: number,
  fallback = '#000000',
): string {
  const a = hexToRgb(normalizeColor(first, fallback));
  const b = hexToRgb(normalizeColor(second, fallback));
  const ratio = clamp(weight, 0, 1);
  return rgbToHex(a.map((channel, index) => channel + (b[index] - channel) * ratio) as RGB);
}

export function rgba(color: string, alpha: number, fallback = '#000000'): string {
  const [r, g, b] = hexToRgb(normalizeColor(color, fallback));
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** Picks the most useful swatch from the platform-specific color result. */
export function pickSourceColor(result: ImageColorsResult | null, fallback: string): string {
  if (!result) return fallback;
  if (result.platform === 'ios') {
    return normalizeColor(result.primary || result.background, fallback);
  }
  return normalizeColor(
    result.vibrant || result.lightVibrant || result.dominant || result.muted,
    fallback,
  );
}

/**
 * Builds a complete palette from one artwork swatch. Contrast is enforced by
 * pushing the accent toward a readable lightness and mixing the backdrop far
 * toward the theme's light/dark endpoint.
 */
export function buildArtworkPalette(
  sourceColor: string,
  base: ThemePalette,
  artworkUri?: string | null,
): ThemePalette {
  const source = normalizeColor(sourceColor, base.tint);
  const [, saturation] = rgbToHsl(hexToRgb(source));
  const vivid = clamp(saturation, 0.32, 0.85);

  const tint = withHsl(source, { s: vivid, l: base.isDark ? 0.66 : 0.4 }, base.tint);
  const accent = withHsl(
    source,
    { s: clamp(vivid + 0.06, 0, 1), l: base.isDark ? 0.74 : 0.46 },
    base.accent,
  );
  const background = mixHex(
    source,
    base.isDark ? '#05070B' : '#FFFFFF',
    base.isDark ? 0.88 : 0.92,
    base.background,
  );
  const backgroundElement = mixHex(
    source,
    base.isDark ? '#0B0F16' : '#FFFFFF',
    base.isDark ? 0.78 : 0.86,
    base.backgroundElement,
  );
  const backgroundSelected = mixHex(
    source,
    base.isDark ? '#161C26' : '#FFFFFF',
    base.isDark ? 0.68 : 0.76,
    base.backgroundSelected,
  );
  const text = mixHex(source, base.isDark ? '#FFFFFF' : '#000000', 0.94, base.text);

  return {
    ...base,
    background,
    backgroundElement,
    backgroundSelected,
    tint,
    accent,
    text,
    textSecondary: mixHex(text, background, 0.34, base.textSecondary),
    border: rgba(source, 0.22, base.border),
    glassBackground: base.isDark
      ? rgba(backgroundElement, 0.6, base.glassBackground)
      : 'rgba(255,255,255,0.62)',
    glassBorder: base.isDark
      ? rgba(text, 0.14, base.glassBorder)
      : rgba(source, 0.18, base.glassBorder),
    gradient: `linear-gradient(180deg, ${backgroundElement} 0%, ${background} 55%, ${background} 100%)`,
    backgroundImage: artworkUri ?? undefined,
    blurTint: base.isDark ? 'systemMaterialDark' : 'systemMaterialLight',
    statusBarStyle: base.isDark ? 'light' : 'dark',
    tabBarBackground: background,
  };
}
