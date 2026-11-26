import { SettingsScreen } from '@/components/settings';
import { FontSizePicker } from '@/components/font-size-picker';
import { ListLayoutPicker } from '@/components/list-layout-picker';
import { AppIconPicker } from '@/components/app-icon-picker';

export default function AppearanceInterfaceScreen() {
  return (
    <SettingsScreen
      title="Interface"
      subtitle="Density, motion, text size and layout"
      route="/settings/appearance/interface"
      section="appearance">
      <FontSizePicker />
      <ListLayoutPicker />
      <AppIconPicker />
    </SettingsScreen>
  );
}
