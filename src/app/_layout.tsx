import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PermissionRequests } from '@/components/permission-requests';
import { PlayerEngine } from '@/components/player-engine';
import { SortSheetHost } from '@/components/sort-sheet-host';
import { ThemePersistence } from '@/components/theme-persistence';
import { LoadingOverlay } from '@/components/ui';
import { initAudioSession } from '@/lib/audio/init';
import { initThemeDb, THEME_DB_NAME } from '@/db/theme-preference';
import { useResolvedTheme } from '@/hooks/use-theme';

// Reanimated 4 ignores dependency arrays on native. @gorhom/bottom-sheet still
// passes them, so keep those compatibility warnings out of the Expo Go log.
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, hydrated } = useResolvedTheme();

  const navTheme = useMemo(() => {
    const base = theme.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: theme.isDark,
      colors: {
        ...base.colors,
        primary: theme.tint,
        background: theme.background,
        card: theme.tabBarBackground,
        text: theme.text,
        border: theme.border,
        notification: theme.accent,
      },
    };
  }, [theme]);

  useEffect(() => {
    void initAudioSession().catch((error) => {
      console.warn('Audio session init failed', error);
    });
  }, []);

  return (
    <SQLiteProvider
      databaseName={THEME_DB_NAME}
      onInit={initThemeDb}
      onError={(error) => {
        console.warn('Theme DB init failed', error);
      }}>
      <ThemePersistence />
      <PermissionRequests />
      <PlayerEngine />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <StatusBar style={theme.statusBarStyle} />
            <AnimatedSplashOverlay />
            <SortSheetHost />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="folders/[id]" />
              <Stack.Screen name="playlists/[id]" />
              <Stack.Screen name="albums/[artist]/[album]" />
              <Stack.Screen name="artists/[name]" />
              <Stack.Screen name="player" options={{ presentation: 'modal' }} />
              <Stack.Screen name="videos/[id]" options={{ presentation: 'fullScreenModal' }} />
            </Stack>
            <LoadingOverlay visible={!hydrated} label="Preparing your library…" />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}