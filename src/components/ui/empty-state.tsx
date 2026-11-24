import type { AppIcon } from './themed-icon';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { ThemedIcon } from './themed-icon';

type EmptyStateProps = {
  message: string;
  description?: string;
  icon?: AppIcon;
  action?: ReactNode;
};

/** Centered placeholder for empty lists and unavailable content. */
export function EmptyState({ message, description, icon, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <ThemedIcon icon={icon} size={36} color="textSecondary" strokeWidth={1.5} /> : null}
      <ThemedText type="smallBold" style={styles.message}>
        {message}
      </ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  message: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
