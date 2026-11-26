import type { AppIcon } from './themed-icon';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useLargeControls } from '@/features/settings/hooks/use-accessibility';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './pressable-scale';
import { ThemedIcon } from './themed-icon';

type IconButtonVariant = 'plain' | 'primary' | 'secondary';

type IconButtonProps = {
  icon: AppIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Outer button size in pixels. Defaults to 44. */
  size?: number;
  /** Icon size in pixels. Defaults to roughly half the button size. */
  iconSize?: number;
  variant?: IconButtonVariant;
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Square/circular icon-only button used for player transport and list actions. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  iconSize,
  variant = 'plain',
  active = false,
  disabled = false,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const largeControls = useLargeControls();
  const effectiveSize = largeControls ? Math.max(size, 56) : size;
  const background =
    variant === 'primary'
      ? theme.tint
      : variant === 'secondary' || active
        ? theme.backgroundSelected
        : 'transparent';
  const color =
    variant === 'primary' ? 'background' : active || variant === 'secondary' ? 'tint' : 'text';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          width: effectiveSize,
          height: effectiveSize,
          borderRadius: effectiveSize / 2,
          backgroundColor: background,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      <ThemedIcon icon={icon} size={iconSize ?? Math.round(effectiveSize * 0.5)} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
