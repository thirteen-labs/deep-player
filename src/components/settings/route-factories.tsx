import type { ComponentType, ReactNode } from 'react';

import { categoryForRoute, type SettingsCategoryLink } from '@/features/settings/ui/categories';
import type { SettingsSection } from '@/features/settings/types/settings.types';

import { SettingsCategoryScreen } from './SettingsCategoryScreen';
import { SettingsScreen } from './SettingsScreen';

/** Create a static Expo Router screen from shared settings screen props. */
export function settingsScreen(options: {
  title: string;
  subtitle?: string;
  route: string;
  section: SettingsSection;
  children?: ReactNode;
}): ComponentType {
  return function RegistrySettingsScreen() {
    return <SettingsScreen {...options} />;
  };
}

/** Create a static category landing screen from shared props. */
export function categoryScreen(options: {
  title: string;
  description?: string;
  cards: SettingsCategoryLink[];
  section?: SettingsSection;
  route?: string;
  children?: ReactNode;
}): ComponentType {
  return function RegistryCategoryScreen() {
    return <SettingsCategoryScreen {...options} />;
  };
}

/** Build a category landing screen directly from the shared category registry. */
export function categoryScreenForRoute(route: string): ComponentType {
  const category = categoryForRoute(route);
  return categoryScreen(
    category
      ? {
          title: category.title,
          description: category.description,
          cards: category.cards,
          section: category.section,
          route,
        }
      : { title: 'Settings', cards: [] },
  );
}
