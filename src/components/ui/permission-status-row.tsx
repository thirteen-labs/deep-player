import { StyleSheet, View } from 'react-native';

import { AppButton } from './app-button';
import { InfoRow } from './info-row';

const LABELS: Record<string, string> = {
  granted: 'Granted',
  limited: 'Limited access',
  denied: 'Denied',
  restricted: 'Restricted',
  unavailable: 'Unavailable',
  undetermined: 'Not requested',
};

type PermissionRowProps = {
  label: string;
  status: string;
  onRequest: () => void | Promise<void>;
  disabled?: boolean;
};

/** Label + humanized status + request button for any system permission. */
export function PermissionRow({
  label,
  status,
  onRequest,
  disabled = false,
}: PermissionRowProps) {
  const isGranted = status === 'granted' || status === 'limited';
  const value = LABELS[status] ?? status;

  return (
    <View style={styles.row}>
      <InfoRow
        label={label}
        value={value}
        valueColor={disabled ? 'textSecondary' : isGranted ? 'tint' : 'textSecondary'}
      />
      <AppButton
        label={isGranted ? 'Granted' : 'Request'}
        variant="ghost"
        size="small"
        disabled={disabled || isGranted}
        onPress={() => void onRequest()}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 4,
  },
  button: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
});
