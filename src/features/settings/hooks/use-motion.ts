/** True only when app and accessibility settings allow motion animations. */
import { useSettingsStore } from '../store/settings.store';

export function useMotionEnabled(): boolean {
  const animations = useSettingsStore((s) => s.settings.appearance.animations);
  const reducedMotion = useSettingsStore((s) => s.settings.accessibility.reducedMotion);
  return animations === 'full' && !reducedMotion;
}
