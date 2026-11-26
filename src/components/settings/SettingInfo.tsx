import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingInfoProps {
  title?: string;
  message: string;
  /** 'info' | 'warning' | 'unavailable' */
  tone?: 'info' | 'warning' | 'unavailable';
}

/** Non-interactive explanatory text. */
export function SettingInfo({ title, message, tone = 'info' }: SettingInfoProps) {
  const theme = useTheme();
  const color =
    tone === 'warning' ? theme.accent : tone === 'unavailable' ? theme.textSecondary : theme.textSecondary;
  return (
    <View style={styles.container}>
      {title ? <Text style={[styles.title, { color: theme.text }]}>{title}</Text> : null}
      <Text style={[styles.message, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, gap: 4 },
  title: { fontSize: 15, fontWeight: '600' },
  message: { fontSize: 13, lineHeight: 18 },
});
