/** Per-setting hook returning [value, setValue, reset]. */
import { useCallback } from 'react';

import { useSettingsStore } from '../store/settings.store';
import { settingSelector } from '../store/settings.selectors';

export function useSetting<T = unknown>(id: string): [T | undefined, (value: T) => void, () => void] {
  const value = useSettingsStore(settingSelector(id)) as T | undefined;
  const setSetting = useSettingsStore((s) => s.setSetting);
  const resetSetting = useSettingsStore((s) => s.resetSetting);

  const set = useCallback((next: T) => setSetting(id, next), [id, setSetting]);
  const reset = useCallback(() => resetSetting(id), [id, resetSetting]);

  return [value, set, reset];
}
