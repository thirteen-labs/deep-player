import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { MusicSortBar } from './music-sort-bar';
import { MusicTabs, type MusicSection } from './music-tabs';

type MusicTopBarProps = {
  value: MusicSection;
  onValueChange: (section: MusicSection) => void;
};

/** Music tab header: section tabs with a dedicated sort bar underneath. */
export function MusicTopBar({ value, onValueChange }: MusicTopBarProps) {
  return (
    <View style={styles.container}>
      <MusicTabs value={value} onValueChange={onValueChange} />
      <MusicSortBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
