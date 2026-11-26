import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import { THEME_COLOR_KEYS, type ThemeColor } from '@/constants/theme';
import { IconSize } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

/** Any SVG icon component. `color` is a plain string for Solar compatibility. */
export type AppIcon = ComponentType<Omit<SvgProps, 'color'> & { color?: string }>;

type ThemedIconProps = {
  icon: AppIcon;
  size?: number;
  /** A palette key (e.g. "tint") or any explicit color string. */
  color?: ThemeColor | string;
  /** SVG fill. Use a palette key or 'none' for outline-only icons. */
  fill?: ThemeColor | string;
  strokeWidth?: number;
  style?: SvgProps['style'];
};

/** Iconoir icon that follows the active theme palette. */
export function ThemedIcon({
  icon: Icon,
  size = IconSize.md,
  color,
  fill,
  strokeWidth = 1.75,
  style,
}: ThemedIconProps) {
  const theme = useTheme();
  const isPaletteKey =
    color != null && THEME_COLOR_KEYS.some((key) => key === color);
  const resolved =
    color == null
      ? theme.text
      : isPaletteKey
        ? theme[color as ThemeColor]
        : color;
  const resolvedFill =
    fill == null
      ? 'none'
      : THEME_COLOR_KEYS.some((key) => key === fill)
        ? theme[fill as ThemeColor]
        : fill;

  return (
    <Icon
      width={size}
      height={size}
      color={resolved}
      fill={resolvedFill}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}
