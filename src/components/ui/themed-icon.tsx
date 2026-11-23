import type { LucideIcon } from 'lucide-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { THEME_COLOR_KEYS, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ThemedIconProps = {
  icon: LucideIcon;
  size?: number;
  /** A palette key (e.g. "tint") or any explicit color string. */
  color?: ThemeColor | string;
  /** SVG fill. Use a palette key or 'none' for outline-only icons. */
  fill?: ThemeColor | string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/** Lucide icon that follows the active theme palette. */
export function ThemedIcon({
  icon: Icon,
  size = 20,
  color,
  fill,
  strokeWidth = 2,
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

  return <Icon size={size} color={resolved} fill={resolvedFill} strokeWidth={strokeWidth} style={style} />;
}
