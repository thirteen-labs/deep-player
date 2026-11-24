import type { AppIcon } from './themed-icon';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './pressable-scale';
import { ThemedIcon } from './themed-icon';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  icon?: AppIcon;
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Themed action button. Use for primary, secondary and quiet inline actions. */
export function AppButton({
  label,
  onPress,
  variant = 'secondary',
  icon,
  size = 'medium',
  disabled = false,
  fullWidth = false,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  const background =
    variant === 'primary'
      ? theme.tint
      : variant === 'secondary'
        ? theme.backgroundElement
        : 'transparent';
  const textColor = variant === 'primary' ? 'background' : variant === 'ghost' ? 'tint' : 'text';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        size === 'small' ? styles.small : styles.medium,
        { backgroundColor: background, alignSelf: fullWidth ? 'stretch' : 'flex-start', opacity: disabled ? 0.5 : 1 },
        style,
      ]}>
      {icon ? (
        <ThemedIcon
          icon={icon}
          size={size === 'small' ? 16 : 18}
          color={variant === 'primary' ? 'background' : variant === 'ghost' ? 'tint' : 'text'}
        />
      ) : null}
      <ThemedText type="smallBold" themeColor={textColor}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    borderCurve: 'continuous',
  },
  small: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  medium: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
