import { requireOptionalNativeModule } from 'expo-modules-core';

import type { AppIconName } from '@/config/app-icons';

type AlternateIconsModule = typeof import('expo-alternate-app-icons');

const NATIVE_MODULE_NAME = 'ExpoAlternateAppIcons';

let cachedModule: AlternateIconsModule | null | undefined;

/**
 * `expo-alternate-app-icons` resolves its native module at import time. Expo Go
 * does not include it, so detect it first and only load the JS wrapper when the
 * native module is present. This mirrors the no-op web shim in `app-icon.web.ts`.
 */
function getAlternateIconsModule(): AlternateIconsModule | null {
  if (cachedModule !== undefined) return cachedModule;

  if (!requireOptionalNativeModule(NATIVE_MODULE_NAME)) {
    cachedModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-alternate-app-icons') as AlternateIconsModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export const supportsAlternateIcons = Boolean(
  getAlternateIconsModule()?.supportsAlternateIcons,
);

export function getActiveAppIcon(): AppIconName | null {
  if (!supportsAlternateIcons) return null;
  return getAlternateIconsModule()?.getAppIconName() ?? null;
}

export async function setActiveAppIcon(name: AppIconName | null): Promise<void> {
  if (!supportsAlternateIcons) return;
  await getAlternateIconsModule()?.setAlternateAppIcon(name);
}

export async function resetToDefaultAppIcon(): Promise<void> {
  if (!supportsAlternateIcons) return;
  await getAlternateIconsModule()?.resetAppIcon();
}
