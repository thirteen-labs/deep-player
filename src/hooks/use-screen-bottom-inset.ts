import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';

/** Bottom padding shared by every tab screen (safe area + tab bar + breathing room). */
export function useScreenBottomInset() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BottomTabInset + Spacing.four;
}
