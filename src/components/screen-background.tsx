import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function ScreenBackground({ children, style }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {theme.backgroundImage ? (
        <Image
          source={{ uri: theme.backgroundImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      ) : null}
      <LinearGradient
        colors={
          theme.backgroundImage
            ? theme.isDark
              ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', theme.background + 'CC']
              : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.25)', theme.background + 'D9']
            : [theme.backgroundElement, theme.background]
        }
        locations={theme.backgroundImage ? [0, 0.45, 1] : [0, 0.7]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});