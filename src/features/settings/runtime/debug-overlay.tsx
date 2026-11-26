/** Small non-interactive overlay enabled by advanced.debugOverlay. */
import { usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useCapabilityStore } from '@/features/settings/capabilities/capability.registry';
import { usePlayerStore } from '@/stores/player-store';

import { useSettingsStore } from '../store/settings.store';

export function DebugOverlay() {
  const theme = useTheme();
  const pathname = usePathname();
  const enabled = useSettingsStore((s) => s.settings.advanced.debugOverlay);
  const showEngineInfo = useSettingsStore((s) => s.settings.advanced.showEngineInfo);
  const experimental = useSettingsStore((s) => s.settings.advanced.enableExperimental);
  const speed = usePlayerStore((s) => s.speed);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queueLength = usePlayerStore((s) => s.queue.length);
  const capabilities = useCapabilityStore((s) => s.capabilities);

  if (!enabled) return null;

  const lines = [
    `route ${pathname}`,
    `player ${isPlaying ? 'playing' : 'paused'} · ${speed.toFixed(2)}x · queue ${queueLength}`,
    `experimental ${experimental ? 'on' : 'off'}`,
  ];
  if (showEngineInfo) {
    lines.push(
      `engine EQ ${capabilities.audio.equalizer ? 'on' : 'off'} · PiP ${capabilities.video.pictureInPicture ? 'on' : 'off'}`,
      `capabilities audio ${Object.values(capabilities.audio).filter(Boolean).length}/${Object.keys(capabilities.audio).length} · video ${Object.values(capabilities.video).filter(Boolean).length}/${Object.keys(capabilities.video).length}`,
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.panel, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
      {lines.map((line) => (
        <Text key={line} style={[styles.line, { color: theme.textSecondary }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 1500,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  line: { fontSize: 10, fontFamily: 'monospace' },
});
