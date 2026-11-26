/**
 * Bridges the settings numeric font scale (0.5-2) to the app's discrete
 * typography steps. The settings store is the source of truth; the legacy
 * font-size store mirrors the result for existing text components.
 */
import { FONT_SCALES, type FontScale } from '@/constants/typography';

export const FONT_SCALE_FACTORS: Record<FontScale, number> = {
  small: FONT_SCALES.small.multiplier,
  medium: FONT_SCALES.medium.multiplier,
  large: FONT_SCALES.large.multiplier,
  xlarge: FONT_SCALES.xlarge.multiplier,
};

/** Nearest discrete step for a continuous factor. */
export function factorToFontScale(factor: number): FontScale {
  if (!Number.isFinite(factor)) return 'medium';
  const entries = Object.entries(FONT_SCALE_FACTORS) as [FontScale, number][];
  return entries.reduce<FontScale>(
    (best, [step, value]) =>
      Math.abs(value - factor) < Math.abs(FONT_SCALE_FACTORS[best] - factor) ? step : best,
    'medium',
  );
}

/** Accessibility "large text" overrides the manual factor. */
export function resolveFontScaleStep(factor: number, largeText: boolean): FontScale {
  return largeText ? 'xlarge' : factorToFontScale(factor);
}
