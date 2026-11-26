import { User } from 'iconoir-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { IconSize } from '@/constants/typography';

import { ThemedIcon } from './themed-icon';

/** Settings tab header: account icon followed by the profile name. */
export function ProfileTopBar() {
  return (
    <View style={styles.bar} accessible accessibilityLabel="Settings">
      <ThemedIcon icon={User} size={IconSize.lg} color="tint" />
      <ThemedText type="title">Me</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
