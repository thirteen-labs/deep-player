import { AudioLines } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale } from './pressable-scale';

type AppLogoProps = {
  /** Hide the wordmark, e.g. on narrow screens. */
  compact?: boolean;
  onPress?: () => void;
};

/** Brand mark used at the far start of the top bar. */
export function AppLogo({ compact = false, onPress }: AppLogoProps) {
  const theme = useTheme();

  const content = (
    <View style={styles.row}>
      <LinearGradient
        colors={[theme.tint, theme.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mark}>
        <AudioLines size={18} color={theme.background} strokeWidth={2.4} />
      </LinearGradient>
      {!compact ? (
        <ThemedText type="smallBold" style={styles.wordmark}>
          Deep Player
        </ThemedText>
      ) : null}
    </View>
  );

  return onPress ? (
    <PressableScale accessibilityRole="button" accessibilityLabel="Deep Player home" onPress={onPress} style={styles.tap}>
      {content}
    </PressableScale>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  tap: {
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 0,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    letterSpacing: 0.2,
  },
});
