import { StyleSheet } from 'react-native';

import { SectionCard, SegmentedControl } from '@/components/ui';
import { LIST_LAYOUT_OPTIONS, useLayoutStore } from '@/stores/layout-store';

/** Appearance control for flex rows vs. a two-column tile grid. */
export function ListLayoutPicker() {
  const listLayout = useLayoutStore((s) => s.listLayout);
  const setListLayout = useLayoutStore((s) => s.setListLayout);

  return (
    <SectionCard title="List layout">
      <SegmentedControl
        options={LIST_LAYOUT_OPTIONS}
        value={listLayout}
        onValueChange={setListLayout}
        segmentStyle={styles.segment}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  segment: {
    width: 88,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
