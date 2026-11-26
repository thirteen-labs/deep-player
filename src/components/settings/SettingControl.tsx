import { router } from 'expo-router';
import type { Ref } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';

import { useSetting } from '@/features/settings/hooks/use-setting';
import { useSettingCapability } from '@/features/settings/hooks/use-setting-capability';
import { getControlConfig, labelize } from '@/features/settings/ui/control-config';
import { SETTINGS_BY_ID, SETTINGS_ROUTES } from '@/features/settings/search/settings.registry';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

import { SettingColorPicker } from './SettingColorPicker';
import { SettingRow } from './SettingRow';
import { SettingSelector, type SettingSelectorOption } from './SettingSelector';
import { SettingSlider } from './SettingSlider';
import { SettingSwitch } from './SettingSwitch';
import { SettingTextInput } from './SettingTextInput';

export interface SettingControlProps {
  id: string;
  /** Marks a search-result destination with a subtle highlight. */
  focused?: boolean;
  /** Attached to the focused row so the screen can scroll it into view. */
  focusedRef?: Ref<ViewInstance>;
}

/** Renders a registry setting with the correct control, constraints and capability state. */
export function SettingControl({ id, focused, focusedRef }: SettingControlProps) {
  const theme = useTheme();
  const entry = SETTINGS_BY_ID[id];
  const [value, setValue] = useSetting<unknown>(id);
  const capability = useSettingCapability(id);

  if (!entry) return null;

  const supported = capability.supported;
  // Switches render the reason separately; other controls include it here.
  const description = entry.description;
  const describedDescription = supported
    ? description
    : `${description}\n${capability.reason ?? 'Unavailable on this build.'}`;
  const config = getControlConfig(id, entry.type);

  const control = (() => {
    switch (entry.type) {
      case 'boolean':
        return (
          <SettingSwitch
            title={entry.title}
            description={description}
            value={Boolean(value)}
            onValueChange={(next) => setValue(next)}
            settingId={id}
          />
        );

      case 'enum': {
        const options: SettingSelectorOption[] = (config.options ?? []).map((option) => ({
          value: String(option),
          label: labelize(option),
        }));
        if (!options.length) return null;
        return (
          <SettingSelector
            title={entry.title}
            description={describedDescription}
            value={String(value ?? '')}
            options={options}
            disabled={!supported}
            onValueChange={(next) => {
              const original = config.options?.find((o) => String(o) === next);
              setValue(original ?? next);
            }}
          />
        );
      }

      case 'number':
      case 'slider':
        return (
          <SettingSlider
            title={entry.title}
            description={describedDescription}
            value={typeof value === 'number' ? value : 0}
            minimumValue={config.min ?? 0}
            maximumValue={config.max ?? 100}
            step={config.step}
            formatValue={config.format}
            disabled={!supported}
            onValueChange={(next) => setValue(next)}
          />
        );

      case 'color':
        return (
          <SettingColorPicker
            title={entry.title}
            description={describedDescription}
            value={typeof value === 'string' ? value : '#FFFFFF'}
            disabled={!supported}
            onValueChange={setValue}
            presets={['#B7F34B', '#7887FF', '#48DDEB', '#FF6B6B', '#FFFFFF']}
          />
        );

      case 'string': {
        if (config.options?.length) {
          const options: SettingSelectorOption[] = config.options.map((option) => ({
            value: String(option),
            label: labelize(option),
          }));
          return (
            <SettingSelector
              title={entry.title}
              description={describedDescription}
              value={String(value ?? '')}
              options={options}
              disabled={!supported}
              onValueChange={setValue}
            />
          );
        }
        return (
          <SettingTextInput
            title={entry.title}
            description={describedDescription}
            value={typeof value === 'string' ? value : ''}
            disabled={!supported}
            onValueChange={setValue}
          />
        );
      }

      case 'equalizer':
        return (
          <SettingRow
            title={entry.title}
            description={describedDescription}
            value="10-band"
            disabled={!supported}
            disabledReason={supported ? undefined : capability.reason}
            onPress={() => router.push(SETTINGS_ROUTES.audioEqualizer as never)}
          />
        );

      case 'action':
        return (
          <SettingRow
            title={entry.title}
            description={describedDescription}
            disabled={!supported}
            disabledReason={supported ? undefined : capability.reason}
            onPress={() => undefined}
          />
        );

      default:
        return null;
    }
  })();

  if (!control) return null;
  return (
    <View ref={focused ? focusedRef : undefined} style={[focused && styles.focused, { borderColor: theme.accent }]}>
      {control}
    </View>
  );
}

const styles = StyleSheet.create({
  focused: { borderWidth: 1, borderRadius: 12, marginHorizontal: Spacing.one },
});
