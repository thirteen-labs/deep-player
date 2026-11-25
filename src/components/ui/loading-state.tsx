import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { Loader } from './loader';

type LoadingStateProps = {
  message?: string;
  /** Inline (small) or centered block. Defaults to inline. */
  variant?: 'inline' | 'block';
};

/** Consistent loading indicator used by library and folder lists. */
export function LoadingState({ message = 'Loading…', variant = 'inline' }: LoadingStateProps) {
  if (variant === 'block') {
    return (
      <View style={styles.block}>
        <Loader size={36} label={message} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <Loader size={18} />
      <ThemedText type="bodySmall" themeColor="textSecondary">
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
});
