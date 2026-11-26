import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingsEmptyStateProps {
  title?: string;
  message?: string;
}

export function SettingsEmptyState({ title = 'Nothing here', message = 'No settings match.' }: SettingsEmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing.five, gap: Spacing.two },
  title: { fontSize: 16, fontWeight: '600' },
  message: { fontSize: 14, textAlign: 'center' },
});
