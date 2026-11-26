import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

import type { SettingSearchEntry } from '@/features/settings/search/settings.registry';

export interface SettingsSearchResultProps {
  entry: SettingSearchEntry;
  onPress: (entry: SettingSearchEntry) => void;
  /** Current value label where useful. */
  valueLabel?: string;
}

export function SettingsSearchResult({ entry, onPress, valueLabel }: SettingsSearchResultProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.title}, ${entry.category}`}
      onPress={() => onPress(entry)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.labels}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={[styles.breadcrumb, { color: theme.textSecondary }]} numberOfLines={1}>
          {entry.category} › {entry.description}
        </Text>
      </View>
      {valueLabel ? <Text style={[styles.value, { color: theme.textSecondary }]}>{valueLabel}</Text> : null}
      <Text style={{ color: theme.textSecondary, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three },
  pressed: { opacity: 0.6 },
  labels: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  breadcrumb: { fontSize: 12 },
  value: { fontSize: 12 },
});
