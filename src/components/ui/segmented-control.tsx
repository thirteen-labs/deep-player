import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './pressable-scale';

export type Segment<T extends string | number> = {
  label: string;
  value: T;
  /** Spoken label when the visible label is compact. */
  accessibilityLabel?: string;
};

type SegmentedControlProps<T extends string | number> = {
  options: Segment<T>[];
  value: T;
  onValueChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  segmentStyle?: StyleProp<ViewStyle>;
};

/** Generic themed segmented control (playback speed, filters, etc.). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onValueChange,
  style,
  segmentStyle,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            onPress={() => onValueChange(option.value)}
            style={[styles.segment, segmentStyle, selected && { backgroundColor: theme.tint }]}>
            <ThemedText type="label" themeColor={selected ? 'background' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.half,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  segment: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderCurve: 'continuous',
  },
});
