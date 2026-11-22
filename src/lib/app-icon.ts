import {
  getAppIconName as getNativeAppIconName,
  resetAppIcon as resetNativeAppIcon,
  setAlternateAppIcon as setNativeAlternateAppIcon,
  supportsAlternateIcons,
} from 'expo-alternate-app-icons';

import type { AppIconName } from '@/config/app-icons';

export { supportsAlternateIcons };

export function getActiveAppIcon(): AppIconName | null {
  return getNativeAppIconName();
}

export async function setActiveAppIcon(name: AppIconName | null): Promise<void> {
  await setNativeAlternateAppIcon(name);
}

export async function resetToDefaultAppIcon(): Promise<void> {
  await resetNativeAppIcon();
}
