import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LoaderProps = {
  /** Diameter of the spinner in pixels. Defaults to 40. */
  size?: number;
  /** Optional caption shown below the spinner. */
  label?: string;
  /** Overrides the active palette's tint. */
  color?: string;
  /** Overrides the active palette's backgroundSelected. */
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
};

/** Branded, theme-aware loading spinner with a pulsing core. */
export function Loader({
  size = 40,
  label,
  color,
  trackColor,
  style,
}: LoaderProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [rotation, pulse]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const accent = color ?? theme.tint;
  const dotSize = Math.max(6, Math.round(size * 0.22));
  const stroke = Math.max(2, Math.round(size / 10));

  return (
    <View style={[styles.container, style]} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Loading'}>
      <View style={[styles.indicator, { width: size, height: size }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.ring,
            {
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: trackColor ?? theme.backgroundSelected,
              borderTopColor: accent,
            },
            spinnerStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.core,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: accent,
            },
            coreStyle,
          ]}
        />
      </View>
      {label ? (
        <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

type LoadingOverlayProps = {
  visible?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Full-screen blocking loader. Render above the app tree while starting up. */
export function LoadingOverlay({
  visible = true,
  label = 'Loading…',
  style,
}: LoadingOverlayProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View
      pointerEvents="auto"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
      style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: theme.overlay }, style]}>
      <Loader size={56} label={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },
  core: {},
  label: {
    textAlign: 'center',
  },
  overlay: {
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
