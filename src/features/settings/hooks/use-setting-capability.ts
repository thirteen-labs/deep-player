/** Hook: capability info for a setting id; re-renders when capabilities change. */
import { capabilityForSetting, useCapabilityStore } from '../capabilities/capability.registry';
import type { CapabilityInfo } from '../capabilities/capability.types';

export function useSettingCapability(settingId: string): CapabilityInfo {
  const capabilities = useCapabilityStore((s) => s.capabilities);
  return capabilityForSetting(settingId, capabilities);
}
