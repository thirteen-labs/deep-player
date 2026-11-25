import { NavArrowRight } from 'iconoir-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView, PressableScale, ThemedIcon, type AppIcon } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { IconSize, Radius } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

type SettingsTileProps = {
  label: string;
  icon: AppIcon;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Compact glass tile used by the settings quick-access grid. */
export function SettingsTile({ label, icon, onPress, style }: SettingsTileProps) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.pressable, style]}>
      <GlassView style={styles.tile}>
        <View style={[styles.iconBadge, { backgroundColor: withAlpha(theme.tint, 0.16) }]}>
          <ThemedIcon icon={icon} size={IconSize.xl} color="tint" />
        </View>
        <ThemedText type="label" numberOfLines={1} style={styles.label}>
          {label}
        </ThemedText>
        <ThemedIcon icon={NavArrowRight} size={IconSize.md} color="textSecondary" />
      </GlassView>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  tile: {
    flex: 1,
    minHeight: 72,
    padding: Spacing.three,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
