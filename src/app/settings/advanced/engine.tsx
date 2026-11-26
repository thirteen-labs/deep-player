import { CapabilityList, SettingsScreen } from '@/components/settings';

export default function AdvancedEngineScreen() {
  return (
    <SettingsScreen
      title="Engine"
      subtitle="Capabilities reported by the active playback engine"
      route="/settings/advanced/engine"
      section="advanced">
      <CapabilityList />
    </SettingsScreen>
  );
}
