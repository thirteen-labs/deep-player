/** Haptic feedback gated by accessibility.hapticFeedback. */
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useSettingsStore } from '../store/settings.store';

export function useSettingHaptics(): () => void {
  const enabled = useSettingsStore((s) => s.settings.accessibility.hapticFeedback);

  return useCallback(() => {
    if (!enabled) return;
    void Haptics.selectionAsync().catch(() => {
      // Haptics are a nicety; unsupported devices must not block a setting change.
    });
  }, [enabled]);
}
