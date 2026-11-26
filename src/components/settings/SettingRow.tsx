import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  useLargeControls,
  useScreenReaderOptimized,
} from '@/features/settings/hooks/use-accessibility';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingRowProps {
  title: string;
  description?: string;
  /** Right-aligned control or value. */
  value?: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Capability/unavailable explanation. */
  disabledReason?: string;
  accessibilityLabel?: string;
}

/** Standard settings item. */
export function SettingRow({
  title,
  description,
  value,
  icon,
  onPress,
  disabled,
  disabledReason,
  accessibilityLabel,
}: SettingRowProps) {
  const theme = useTheme();
  const largeControls = useLargeControls();
  const screenReaderOptimized = useScreenReaderOptimized();
  const body = (
    <View style={styles.row}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.labels}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        ) : null}
        {disabled && disabledReason ? (
          <Text style={[styles.disabledReason, { color: theme.textSecondary }]}>{disabledReason}</Text>
        ) : null}
      </View>
      {value ? <View style={styles.value}>{value}</View> : null}
    </View>
  );

  if (!onPress) {
    return <View style={[styles.container, largeControls && styles.largeControls]}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={
        screenReaderOptimized ? description ?? disabledReason ?? undefined : undefined
      }
      importantForAccessibility={screenReaderOptimized ? 'yes' : 'auto'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        largeControls && styles.largeControls,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three },
  largeControls: { paddingVertical: Spacing.four, minHeight: 64 },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  icon: { width: 24, alignItems: 'center' },
  labels: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '500' },
  description: { fontSize: 13, lineHeight: 18 },
  disabledReason: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  value: { marginLeft: Spacing.two },
});
