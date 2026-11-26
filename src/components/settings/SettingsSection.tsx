import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SettingsSectionProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
}

/** Group related settings. */
export function SettingsSection({ title, description, footer, children }: PropsWithChildren<SettingsSectionProps>) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {title ? <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text> : null}
      {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {children}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  title: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: Spacing.three },
  description: { fontSize: 12, paddingHorizontal: Spacing.three },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden' },
  footer: { paddingHorizontal: Spacing.three },
});
