import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { SettingInfo, SettingsScreen, SettingsSection } from '@/components/settings';
import { Spacing } from '@/constants/theme';
import { useCapabilityStore } from '@/features/settings/capabilities/capability.registry';
import { SETTINGS_SCHEMA_VERSION } from '@/features/settings/types/settings.types';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useTheme } from '@/hooks/use-theme';
import { useDbStore } from '@/lib/db/store';
import { usePlayerStore } from '@/stores/player-store';

/** Shows the opt-in diagnostic snapshot and shares it as a local JSON file. */
export default function AdvancedDiagnosticsScreen() {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const enabled = useSettingsStore((s) => s.settings.advanced.collectDiagnostics);
  const loggingLevel = useSettingsStore((s) => s.settings.advanced.loggingLevel);
  const experimental = useSettingsStore((s) => s.settings.advanced.enableExperimental);
  const capabilities = useCapabilityStore((s) => s.capabilities);
  const player = usePlayerStore();
  const tracks = useDbStore((s) => s.tracks.length);
  const folders = useDbStore((s) => s.folders.length);
  const hidden = useDbStore((s) => s.hiddenTracks.length);

  const buildReport = () => ({
    app: {
      version: Constants.expoConfig?.version ?? 'unknown',
      platform: Platform.OS,
      osVersion: Platform.Version,
    },
    settings: { schemaVersion: SETTINGS_SCHEMA_VERSION, loggingLevel, experimental },
    library: { tracks, folders, hidden },
    player: {
      playing: player.isPlaying,
      speed: player.speed,
      queueLength: player.queue.length,
      sleepTimer: player.sleepTimer,
    },
    capabilities,
    collectedAt: new Date().toISOString(),
  });

  const shareReport = async () => {
    setBusy(true);
    try {
      const file = new File(Paths.cache, 'deep-player-diagnostics.json');
      if (file.exists) file.delete();
      file.create();
      await file.write(JSON.stringify(buildReport(), null, 2));
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Diagnostics saved', `Saved to ${file.uri}`);
        return;
      }
      await Sharing.shareAsync(file.uri, {
        dialogTitle: 'Deep Player diagnostics',
        mimeType: 'application/json',
      });
    } catch (error) {
      console.warn('Could not share diagnostics', error);
      Alert.alert('Diagnostics unavailable', 'The report could not be created on this device.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsScreen
      title="Diagnostics"
      subtitle="Logging and diagnostic collection"
      route="/settings/advanced/diagnostics"
      section="advanced">
      <SettingsSection title="Collection">
        <SettingInfo
          tone={enabled ? 'info' : 'warning'}
          message={
            enabled
              ? `Diagnostic collection is on. Log level: ${loggingLevel}.`
              : 'Diagnostic collection is off. Turn it on to create a shareable report.'
          }
        />
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Reports contain app version, engine capabilities, library totals and player state. They
          never include media files, secrets or credentials.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share diagnostics report"
          disabled={!enabled || busy}
          onPress={() => void shareReport()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
            (!enabled || busy) && styles.disabled,
          ]}>
          <Text style={[styles.buttonLabel, { color: theme.background }]}>
            {busy ? 'Preparing…' : 'Share report'}
          </Text>
        </Pressable>
      </SettingsSection>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  description: { fontSize: 13, lineHeight: 18, paddingHorizontal: Spacing.three },
  button: {
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  buttonLabel: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
