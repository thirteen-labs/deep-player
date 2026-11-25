import { StyleSheet, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { ContinueWatchingFab } from '@/components/continue-watching-fab';

/**
 * Tab navigator for the main app sections. AppTabs renders a floating,
 * frosted tab pill on every platform; the resume button is layered above it.
 */
export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <AppTabs />
      <ContinueWatchingFab />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
