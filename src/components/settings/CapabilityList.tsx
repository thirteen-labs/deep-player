import { StyleSheet, Text, View } from 'react-native';

import { useCapabilityStore } from '@/features/settings/capabilities/capability.registry';
import type { CapabilityKey } from '@/features/settings/capabilities/capability.types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SettingDivider } from './SettingDivider';

const CAPABILITIES: { key: CapabilityKey; label: string }[] = [
  { key: 'audio.backgroundPlayback', label: 'Background audio' },
  { key: 'audio.gapless', label: 'Gapless playback' },
  { key: 'audio.crossfade', label: 'Crossfade' },
  { key: 'audio.equalizer', label: 'Equalizer' },
  { key: 'audio.replayGain', label: 'ReplayGain' },
  { key: 'audio.volumeNormalization', label: 'Volume normalization' },
  { key: 'audio.audioEffects', label: 'Audio effects' },
  { key: 'video.hardwareDecoding', label: 'Hardware decoding' },
  { key: 'video.softwareDecoding', label: 'Software decoding' },
  { key: 'video.pictureInPicture', label: 'Picture-in-Picture' },
  { key: 'video.subtitles', label: 'Subtitles' },
  { key: 'video.externalSubtitles', label: 'External subtitles' },
  { key: 'video.subtitleStyling', label: 'Subtitle styling' },
  { key: 'video.playbackSpeed', label: 'Playback speed' },
  { key: 'video.rotation', label: 'Rotation' },
  { key: 'video.gestureControls', label: 'Player gestures' },
  { key: 'system.foregroundService', label: 'Foreground service' },
  { key: 'system.mediaNotifications', label: 'Media notifications' },
  { key: 'system.lockScreenControls', label: 'Lock-screen controls' },
  { key: 'system.backgroundAudio', label: 'System background audio' },
  { key: 'system.navigationBar', label: 'System navigation bar' },
  { key: 'system.statusBar', label: 'System status bar' },
  { key: 'system.privateFolders', label: 'Private folders' },
  { key: 'system.thumbnailGeneration', label: 'Thumbnail generation' },
];

/** Read-only view of capability reporting for advanced/engine screens. */
export function CapabilityList() {
  const theme = useTheme();
  const capabilities = useCapabilityStore((s) => s.capabilities);

  return (
    <View style={styles.container}>
      {CAPABILITIES.map((item, index) => {
        const [section, name] = item.key.split('.') as [keyof typeof capabilities, string];
        const group = capabilities[section] as unknown as Record<string, boolean>;
        const supported = Boolean(group[name]);
        return (
          <View key={item.key}>
            {index > 0 ? <SettingDivider /> : null}
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.value, { color: supported ? theme.accent : theme.textSecondary }]}>
                {supported ? 'Supported' : 'Unavailable'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  label: { fontSize: 14, flex: 1 },
  value: { fontSize: 13, fontWeight: '600' },
});
