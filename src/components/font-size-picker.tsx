import { StyleSheet } from 'react-native';

import { SectionCard, SegmentedControl } from '@/components/ui';
import { FONT_SCALE_FACTORS } from '@/features/settings/bridges/font-scale';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { FONT_SCALE_OPTIONS, type FontScale } from '@/constants/typography';
import { useFontSizeStore } from '@/stores/font-size-store';

/** Appearance control for the app-wide text size. */
export function FontSizePicker() {
  const fontScale = useFontSizeStore((s) => s.fontScale);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <SectionCard title="Font size" subtitle="Scales text across the app">
      <SegmentedControl
        options={FONT_SCALE_OPTIONS}
        value={fontScale}
        onValueChange={(step: FontScale) => {
          // Settings is the source of truth; the runtime mirrors the discrete step.
          setSetting('appearance.fontScale', FONT_SCALE_FACTORS[step]);
        }}
        segmentStyle={styles.segment}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
