import { StyleSheet, Text, View } from 'react-native';

import { useSetting } from '@/features/settings/hooks/use-setting';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SettingsPreviewProps {
  compact?: boolean;
}

/** Small live preview used by appearance and theme screens. */
export function SettingsPreview({ compact }: SettingsPreviewProps) {
  const theme = useTheme();
  const [accent] = useSetting<string>('appearance.accentColor');
  const [mode] = useSetting<string>('appearance.mode');
  const [themeId] = useSetting<string>('appearance.themeId');

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.art, { backgroundColor: accent ?? theme.accent }]} />
        <View style={styles.labels}>
          <Text style={[styles.title, { color: theme.text }]}>Preview</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {String(mode ?? 'system')} · {String(themeId ?? 'default')}
          </Text>
        </View>
        <View style={[styles.accentDot, { backgroundColor: accent ?? theme.accent }]} />
      </View>
      {!compact ? (
        <View style={styles.bars}>
          <View style={[styles.bar, { backgroundColor: accent ?? theme.accent, width: '72%' }]} />
          <View style={[styles.bar, { backgroundColor: theme.border, width: '45%' }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  art: { width: 44, height: 44, borderRadius: 10 },
  labels: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  accentDot: { width: 12, height: 12, borderRadius: 6 },
  bars: { gap: Spacing.one },
  bar: { height: 6, borderRadius: 3 },
});
