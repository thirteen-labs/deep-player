import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './pressable-scale';

type ToggleChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Small pill used for repeat/shuffle and other boolean player options. */
export function ToggleChip({ label, active, onPress, style }: ToggleChipProps) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.tint : theme.backgroundElement,
          borderColor: active ? theme.tint : theme.border,
        },
        style,
      ]}>
      <ThemedText type="smallBold" themeColor={active ? 'background' : 'textSecondary'}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
});
