import { EqualizerSettings, SettingsScreen } from '@/components/settings';

export default function EqualizerScreen() {
  return (
    <SettingsScreen
      title="Equalizer"
      subtitle="10-band equalizer and engine-dependent effects"
      route="/settings/audio/equalizer"
      section="audio">
      <EqualizerSettings />
    </SettingsScreen>
  );
}
