import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** Blur applied to the background image; useful for artwork backdrops. */
  backdropBlur?: number;
}>;

export function ScreenBackground({ children, style, backdropBlur }: Props) {
  const theme = useTheme();
  const background = theme.playerBackground ?? theme.background;

  return (
    <View style={[styles.container, { backgroundColor: background }, style]}>
      {theme.backgroundImage ? (
        <Image
          source={{ uri: theme.backgroundImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          blurRadius={backdropBlur}
        />
      ) : null}
      <LinearGradient
        colors={
          theme.backgroundImage
            ? theme.isDark
              ? [
                  withAlpha(background, 0.15),
                  withAlpha(background, 0.35),
                  withAlpha(background, 0.8),
                ]
              : [
                  withAlpha(background, 0.1),
                  withAlpha(background, 0.25),
                  withAlpha(background, 0.85),
                ]
            : [theme.surface, background]
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
