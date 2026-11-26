import { SettingsPreview, SettingsScreen } from '@/components/settings';
import { ThemePicker } from '@/components/theme-picker';

export default function AppearanceThemesScreen() {
  return (
    <SettingsScreen
      title="Themes"
      subtitle="Choose a catalog theme and appearance mode"
      route="/settings/appearance/themes"
      section="appearance">
      <SettingsPreview />
      <ThemePicker />
    </SettingsScreen>
  );
}
