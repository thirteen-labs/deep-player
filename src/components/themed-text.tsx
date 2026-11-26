import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { getTypographyStyles, type TextVariant } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { useFontScale } from '@/stores/font-size-store';

export type ThemedTextProps = TextProps & {
  type?: TextVariant;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const fontScale = useFontScale();
  const color = theme[themeColor ?? 'text'];

  return <Text style={[{ color }, getTypographyStyles(fontScale)[type], style]} {...rest} />;
}
