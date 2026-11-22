import type { AppIconName } from '@/config/app-icons';

export const supportsAlternateIcons = false;

export function getActiveAppIcon(): AppIconName | null {
  return null;
}

export async function setActiveAppIcon(_name: AppIconName | null): Promise<void> {
  void _name;
}

export async function resetToDefaultAppIcon(): Promise<void> {
  // Alternate app icons are not available on the web.
}
