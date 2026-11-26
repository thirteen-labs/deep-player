import { StyleSheet, Text, View } from 'react-native';

import { useSetting } from '@/features/settings/hooks/use-setting';
import { useSettingCapability } from '@/features/settings/hooks/use-setting-capability';
import {
  EQUALIZER_BAND_FREQUENCIES,
  EQUALIZER_BAND_MAX,
  EQUALIZER_BAND_MIN,
} from '@/features/settings/types/settings.enums';
import {
  EQUALIZER_PRESET_GAINS,
  EQUALIZER_PRESET_OPTIONS,
} from '@/features/settings/ui/equalizer-presets';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { SettingInfo } from './SettingInfo';
import { SettingSelector, type SettingSelectorOption } from './SettingSelector';
import { SettingSlider } from './SettingSlider';
import { SettingsSection } from './SettingsSection';

/** Dedicated 10-band equalizer configuration (spec §4.5). */
export function EqualizerSettings() {
  const theme = useTheme();
  const capability = useSettingCapability('audio.equalizerEnabled');
  const [enabled] = useSetting<boolean>('audio.equalizerEnabled');
  const [preset, setPreset] = useSetting<string>('audio.equalizerPreset');
  const [bands, setBands] = useSetting<number[]>('audio.equalizerBands');

  const active = capability.supported && Boolean(enabled);
  const gains = bands?.length === EQUALIZER_BAND_FREQUENCIES.length ? bands : EQUALIZER_PRESET_GAINS.flat;

  const applyPreset = (next: string) => {
    setPreset(next);
    if (next !== 'custom') setBands([...(EQUALIZER_PRESET_GAINS[next] ?? EQUALIZER_PRESET_GAINS.flat)]);
  };

  const updateBand = (index: number, value: number) => {
    const next = [...gains];
    next[index] = value;
    setPreset('custom');
    setBands(next);
  };

  return (
    <>
      {!capability.supported ? (
        <SettingInfo tone="warning" message={capability.reason ?? 'Equalizer is unavailable on this build.'} />
      ) : null}
      <SettingsSection title="Preset">
        <SettingSelector
          title="Equalizer preset"
          description="Choose a starting curve, then fine-tune any band."
          value={String(preset ?? 'flat')}
          options={EQUALIZER_PRESET_OPTIONS as SettingSelectorOption[]}
          disabled={!active}
          onValueChange={applyPreset}
        />
      </SettingsSection>
      <SettingsSection title="10-band gains">
        <View style={styles.bandList}>
          {EQUALIZER_BAND_FREQUENCIES.map((frequency, index) => (
            <SettingSlider
              key={frequency}
              title={`${frequency >= 1000 ? `${frequency / 1000}k` : frequency} Hz`}
              value={gains[index] ?? 0}
              minimumValue={EQUALIZER_BAND_MIN}
              maximumValue={EQUALIZER_BAND_MAX}
              step={1}
              disabled={!active}
              formatValue={(v) => `${v > 0 ? '+' : ''}${Math.round(v)} dB`}
              onValueChange={(value) => updateBand(index, value)}
            />
          ))}
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Changing a band switches the preset to Custom. Durations and effects are applied immediately.
        </Text>
      </SettingsSection>
    </>
  );
}

const styles = StyleSheet.create({
  bandList: { gap: Spacing.one },
  hint: { fontSize: 12, lineHeight: 17, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
});
