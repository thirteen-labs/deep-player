import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function SettingsHeader({ title, subtitle, onBack, action }: SettingsHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={[styles.back, { borderColor: theme.border }]}>
          <Text style={[styles.backLabel, { color: theme.text }]}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.labels}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backLabel: { fontSize: 24, lineHeight: 26 },
  labels: { flex: 1, gap: 2 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14 },
  action: { marginLeft: 'auto' },
});
