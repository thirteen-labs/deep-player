import { Switch } from 'react-native';

import { useSettingCapability } from '@/features/settings/hooks/use-setting-capability';
import { useSettingHaptics } from '@/features/settings/hooks/use-setting-haptics';
import { useTheme } from '@/hooks/use-theme';

import { SettingRow } from './SettingRow';

export interface SettingSwitchProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Setting id used to check engine capability. */
  settingId?: string;
  disabled?: boolean;
}

/** Boolean preferences. Unsupported engine features are disabled + explained. */
export function SettingSwitch({
  title,
  description,
  value,
  onValueChange,
  settingId,
  disabled,
}: SettingSwitchProps) {
  const theme = useTheme();
  const haptic = useSettingHaptics();
  const capability = useSettingCapability(settingId ?? '');
  const capabilityKnown = !!settingId;
  const supported = !capabilityKnown || capability.supported;
  const isDisabled = disabled || !supported;

  return (
    <SettingRow
      title={title}
      description={description}
      disabled={isDisabled}
      disabledReason={supported ? undefined : capability.reason}
      value={
        <Switch
          value={value && supported}
          onValueChange={(next) => {
            haptic();
            onValueChange(next);
          }}
          disabled={isDisabled}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={theme.text}
          accessibilityLabel={title}
        />
      }
    />
  );
}
