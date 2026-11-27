import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { EqualizerPersistence } from '@/components/equalizer-persistence';
import { FontSizePersistence } from '@/components/font-size-persistence';
import { LayoutPersistence } from '@/components/layout-persistence';
import { LibraryCacheWarmer } from '@/components/library-cache-warmer';
import { PermissionRequests } from '@/components/permission-requests';
import { PlayerEngine } from '@/components/player-engine';
import { SortSheetHost } from '@/components/sort-sheet-host';
import { ThemePersistence } from '@/components/theme-persistence';
import { TrackSheetHost } from '@/components/track-sheet-host';
import { LoadingOverlay } from '@/components/ui';
import { initAudioSession } from '@/lib/audio/init';
import { initThemeDb, THEME_DB_NAME } from '@/db/theme-preference';
import { THEME_CONFIG } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/use-theme';
import { AppLockGate } from '@/features/settings/runtime/app-lock';
import { DebugOverlay } from '@/features/settings/runtime/debug-overlay';
import { SettingsRuntime } from '@/features/settings/runtime/settings-runtime';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useFontSizeStore } from '@/stores/font-size-store';

// Reanimated 4 ignores dependency arrays on native. @gorhom/bottom-sheet still
// passes them, so keep those compatibility warnings out of the Expo Go log.
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, hydrated } = useResolvedTheme();
  const fontScaleHydrated = useFontSizeStore((s) => s.hydrated);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  const navTheme = useMemo(() => {
    const base = theme.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: theme.isDark,
      colors: {
        ...base.colors,
        primary: theme.primary,
        background: theme.background,
        card: theme.tabBarBackground,
        text: theme.textPrimary,
        border: theme.border,
        notification: theme.secondary,
      },
    };
  }, [theme]);

  useEffect(() => {
    void initAudioSession().catch((error) => {
      console.warn('Audio session init failed', error);
    });
  }, []);

  useEffect(() => {
    if (!THEME_CONFIG.settings.applyToSystemBars) return;
    void SystemUI.setBackgroundColorAsync(theme.background).catch((error) => {
      console.warn('System UI background update failed', error);
    });
  }, [theme.background]);

  return (
    <SQLiteProvider
      databaseName={THEME_DB_NAME}
      onInit={initThemeDb}
      onError={(error) => {
        console.warn('Theme DB init failed', error);
      }}>
      <ThemePersistence />
      <FontSizePersistence />
      <LayoutPersistence />
      <EqualizerPersistence />
      <SettingsRuntime />
      <LibraryCacheWarmer />
      <PermissionRequests />
      <PlayerEngine />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navTheme}>
            <AppLockGate>
              {THEME_CONFIG.settings.applyToSystemBars ? (
                <StatusBar style={theme.statusBarStyle} animated />
              ) : null}
              {settingsHydrated ? <AnimatedSplashOverlay /> : null}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="search" />
                <Stack.Screen name="folders/[id]" />
                <Stack.Screen name="smart-lists/[id]" />
                <Stack.Screen name="playlists/[id]" />
                <Stack.Screen name="albums/[artist]/[album]" />
                <Stack.Screen name="artists/[name]" />
                <Stack.Screen name="player" options={{ presentation: 'modal' }} />
                <Stack.Screen name="videos/[id]" options={{ presentation: 'fullScreenModal' }} />
              </Stack>
              <LoadingOverlay
                visible={!hydrated || !fontScaleHydrated || !settingsHydrated}
                label="Preparing your library…"
              />
              <SortSheetHost />
              <TrackSheetHost />
              <DebugOverlay />
            </AppLockGate>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}