import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function SettingDivider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
