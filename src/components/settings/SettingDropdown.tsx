import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SettingRow } from './SettingRow';
import type { SettingSelectorOption } from './SettingSelector';

export interface SettingDropdownProps {
  title: string;
  description?: string;
  value: string;
  options: SettingSelectorOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  /** Opens a selection sheet in production; here cycles to next option. */
  onOpenSheet?: () => void;
}

/** Compact option selection. */
export function SettingDropdown({
  title,
  description,
  value,
  options,
  onValueChange,
  disabled,
  onOpenSheet,
}: SettingDropdownProps) {
  const theme = useTheme();
  const current = options.find((o) => o.value === value);
  const open = () => {
    if (onOpenSheet) {
      onOpenSheet();
      return;
    }
    // Fallback: cycle to next option.
    const idx = options.findIndex((o) => o.value === value);
    const next = options[(idx + 1) % options.length];
    if (next) onValueChange(next.value);
  };

  return (
    <SettingRow
      title={title}
      description={description}
      disabled={disabled}
      onPress={disabled ? undefined : open}
      value={
        <View style={styles.valueWrap}>
          <Text style={[styles.value, { color: theme.textSecondary }]} numberOfLines={1}>
            {current?.label ?? value}
          </Text>
          <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  valueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 14, maxWidth: 160 },
  chevron: { fontSize: 18 },
});
