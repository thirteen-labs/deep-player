import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingsCategoryCardProps {
  title: string;
  description?: string;
  /** Optional secondary label showing active configuration, e.g. "Dark Pulse". */
  value?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export function SettingsCategoryCard({ title, description, value, icon, onPress }: SettingsCategoryCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      {icon ? <View style={[styles.icon, { backgroundColor: theme.backgroundSelected }]}>{icon}</View> : null}
      <View style={styles.labels}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          {value ? (
            <Text style={[styles.value, { color: theme.textSecondary }]} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
        </View>
        {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      </View>
      <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  labels: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  value: { fontSize: 13 },
  description: { fontSize: 13, lineHeight: 18 },
  chevron: { fontSize: 20 },
});
