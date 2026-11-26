/**
 * Enforces privacy.appLockEnabled and privacy.requireAuthForSettings (spec §4.10).
 * Authentication state is per foreground session: backgrounding the app locks
 * it again, so a random app switcher snapshot cannot reopen the library.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { usePathname } from 'expo-router';
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { useSettingsStore } from '../store/settings.store';

type AuthScope = 'app' | 'settings';

export function AppLockGate({ children }: PropsWithChildren) {
  const theme = useTheme();
  const hydrated = useSettingsStore((s) => s.hydrated);
  const privacy = useSettingsStore((s) => s.settings.privacy);
  const pathname = usePathname();
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const attempted = useRef<AuthScope | null>(null);
  const inSettings = pathname.startsWith('/settings');

  const locked =
    hydrated &&
    ((privacy.appLockEnabled && !appUnlocked) ||
      (privacy.requireAuthForSettings && inSettings && !settingsUnlocked));

  const authenticate = useCallback(
    async (scope: AuthScope) => {
      setBusy(true);
      try {
        // No enrolled biometrics still permits the OS passcode fallback.
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: scope === 'settings' ? 'Unlock settings' : 'Unlock Deep Player',
          fallbackLabel: 'Use passcode',
          // Device passcode remains a valid fallback when biometrics are enabled.
          disableDeviceFallback: false,
        });
        if (result.success) {
          if (scope === 'app') setAppUnlocked(true);
          else setSettingsUnlocked(true);
        }
      } catch {
        // Keep the gate visible; the user can retry from the button.
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!hydrated) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') return;
      setAppUnlocked(false);
      setSettingsUnlocked(false);
      attempted.current = null;
    });
    return () => subscription.remove();
  }, [hydrated]);

  // Turning the lock on must take effect immediately, including in Settings.
  // Defer the reset so React can flush the setting update before re-locking.
  useEffect(() => {
    if (!privacy.appLockEnabled) return;
    void Promise.resolve().then(() => {
      setAppUnlocked(false);
      setSettingsUnlocked(false);
      attempted.current = null;
    });
  }, [privacy.appLockEnabled]);

  useEffect(() => {
    if (!locked) {
      attempted.current = null;
      return;
    }
    const scope: AuthScope = inSettings ? 'settings' : 'app';
    if (attempted.current === scope) return;
    attempted.current = scope;
    void authenticate(scope);
  }, [locked, inSettings, authenticate]);

  return (
    <View style={styles.root}>
      <View style={[styles.content, locked && styles.pointerEventsNone]}>{children}</View>
      {locked ? (
        <View style={[StyleSheet.absoluteFill, styles.gate, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>Deep Player is locked</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Authenticate to open your library.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Unlock Deep Player"
            disabled={busy}
            onPress={() => void authenticate(inSettings ? 'settings' : 'app')}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}>
            <Text style={[styles.buttonLabel, { color: theme.background }]}>
              {busy ? 'Unlocking…' : 'Unlock'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  pointerEventsNone: { pointerEvents: 'none' } as const,
  gate: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, zIndex: 2000 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center' },
  button: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 999 },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
