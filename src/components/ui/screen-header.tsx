import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Consistent page title + description used at the top of tab screens. */
export function ScreenHeader({ title, description, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <ThemedText type="title">{title}</ThemedText>
        {description ? (
          <ThemedText type="body" themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  copy: {
    flexShrink: 1,
    gap: Spacing.one,
  },
  description: {
    maxWidth: 520,
  },
});
