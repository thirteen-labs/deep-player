import { AppIconPicker } from '@/components/app-icon-picker';
import { ListLayoutPicker } from '@/components/list-layout-picker';
import { ThemePicker } from '@/components/theme-picker';
import { Screen, TopBar } from '@/components/ui';

export default function AppearanceSettingsScreen() {
  return (
    <Screen header={<TopBar title="Appearance" showBack />}>
      <ThemePicker />
      <ListLayoutPicker />
      <AppIconPicker />
    </Screen>
  );
}
