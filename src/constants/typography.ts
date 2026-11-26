import { Platform, type TextStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

/** Font sizes used by the app, from dense metadata up to hero headings. */
export const FontSize = {
  caption: 12,
  footnote: 13,
  small: 14,
  body: 16,
  callout: 18,
  headline: 20,
  title3: 24,
  title2: 28,
  title1: 32,
  largeTitle: 40,
  display: 48,
} as const;

/**
 * User-selectable text size steps. Each multiplier is applied to the semantic
 * styles below so every screen scales together.
 */
export const FONT_SCALES = {
  small: { label: 'S', accessibilityLabel: 'Small text', multiplier: 0.9 },
  medium: { label: 'M', accessibilityLabel: 'Medium text', multiplier: 1 },
  large: { label: 'L', accessibilityLabel: 'Large text', multiplier: 1.15 },
  xlarge: { label: 'XL', accessibilityLabel: 'Extra large text', multiplier: 1.3 },
} as const satisfies Record<string, { label: string; accessibilityLabel: string; multiplier: number }>;

export type FontScale = keyof typeof FONT_SCALES;

export const FONT_SCALE_OPTIONS: {
  value: FontScale;
  label: string;
  accessibilityLabel: string;
}[] = (Object.keys(FONT_SCALES) as FontScale[]).map((value) => ({
  value,
  label: FONT_SCALES[value].label,
  accessibilityLabel: FONT_SCALES[value].accessibilityLabel,
}));

/**
 * Semantic text levels. Each entry is a complete text style so callers do not
 * have to pair a font size with a guessed line height or weight.
 */
export type TextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'callout'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'footnote'
  | 'caption'
  | 'eyebrow'
  | 'numeric'
  | 'link'
  | 'code';

export const Typography: Record<TextVariant, TextStyle> = {
  display: {
    fontSize: FontSize.display,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  title: {
    fontSize: FontSize.title1,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FontSize.title3,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: FontSize.headline,
    lineHeight: 28,
    fontWeight: '600',
  },
  callout: {
    fontSize: FontSize.callout,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 24,
    fontWeight: '500',
  },
  bodySmall: {
    fontSize: FontSize.small,
    lineHeight: 20,
    fontWeight: '500',
  },
  label: {
    fontSize: FontSize.small,
    lineHeight: 20,
    fontWeight: '700',
  },
  footnote: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
    fontWeight: '500',
  },
  caption: {
    fontSize: FontSize.caption,
    lineHeight: 16,
    fontWeight: '500',
  },
  eyebrow: {
    fontSize: FontSize.caption,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  numeric: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  link: {
    fontSize: FontSize.small,
    lineHeight: 20,
    fontWeight: '500',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.caption,
    lineHeight: 18,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
  },
};

const scaledTypographyCache = new Map<FontScale, Record<TextVariant, TextStyle>>();

/** Scaled text styles for the selected font size, cached per step. */
export function getTypographyStyles(fontScale: FontScale): Record<TextVariant, TextStyle> {
  const cached = scaledTypographyCache.get(fontScale);
  if (cached) return cached;

  const multiplier = FONT_SCALES[fontScale].multiplier;
  const styles = {} as Record<TextVariant, TextStyle>;
  for (const variant of Object.keys(Typography) as TextVariant[]) {
    const style = Typography[variant];
    const fontSize = style.fontSize ?? FontSize.body;
    styles[variant] = {
      ...style,
      fontSize: Math.round(fontSize * multiplier),
      lineHeight: Math.round((style.lineHeight ?? fontSize) * multiplier),
    };
  }
  scaledTypographyCache.set(fontScale, styles);
  return styles;
}

/** Ring sizes for icon-only controls, aligned with the spacing scale. */
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

/** Corner radii shared by cards, controls and badges. */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 28,
  pill: 999,
} as const;
