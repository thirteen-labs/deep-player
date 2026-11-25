import { BlurView } from 'expo-blur';
import { GlassView as ExpoGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Radius } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

type GlassViewProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  /** Use interactive glass on supported platforms (iOS 26+). */
  interactive?: boolean;
}>;

export function GlassView({ children, style, intensity = 55, interactive = false }: GlassViewProps) {
  const theme = useTheme();
  const flattened = StyleSheet.flatten(style) || {};
  const borderRadius = (flattened.borderRadius as number | undefined) ?? Radius.xl;

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <ExpoGlassView isInteractive={interactive} style={[styles.base, { borderRadius }, style]}>
        {children}
      </ExpoGlassView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.base,
          {
            borderRadius,
            backgroundColor: theme.glassBackground,
            borderColor: theme.glassBorder,
            borderWidth: 1,
            backdropFilter: 'blur(16px)',
          },
          style,
        ]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView
      tint={theme.blurTint}
      intensity={intensity}
      style={[
        styles.base,
        {
          borderRadius,
          borderColor: theme.glassBorder,
          borderWidth: 1,
          backgroundColor: theme.glassBackground,
        },
        style,
      ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});