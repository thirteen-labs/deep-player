import { clearVideoCacheAsync, setVideoCacheSizeAsync } from 'expo-video';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { Spacing } from '@/constants/theme';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useTheme } from '@/hooks/use-theme';

/** Cache preferences plus an explicit cache-only clear action. */
export default function CacheSettingsScreen() {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const clearCache = async () => {
    const maxMB = Math.max(1, useSettingsStore.getState().settings.storage.maxCacheSizeMB);
    setBusy(true);
    try {
      // The native API clears the LRU cache; media files are untouched.
      await clearVideoCacheAsync();
      await setVideoCacheSizeAsync(maxMB * 1024 * 1024);
      Alert.alert('Cache cleared', 'Cached video was removed. Your media files are untouched.');
    } catch {
      Alert.alert(
        'Could not clear cache',
        'Close any open video player and try again. Your media files were not changed.',
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmClear = () => {
    Alert.alert('Clear video cache?', 'This removes cached video only. It never deletes media files.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => void clearCache() },
    ]);
  };

  return (
    <SettingsScreen
      title="Cache"
      subtitle="Cache size, cleanup and cached assets"
      route="/settings/storage/cache"
      section="storage">
      <View style={[styles.card, { borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Clear video cache</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Removes only the video player cache. Library files and downloads are never deleted. Close
          open videos first.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear video cache"
          disabled={busy}
          onPress={confirmClear}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}>
          <Text style={[styles.buttonLabel, { color: theme.background }]}>
            {busy ? 'Clearing…' : 'Clear cache'}
          </Text>
        </Pressable>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 18 },
  button: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
  buttonLabel: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
