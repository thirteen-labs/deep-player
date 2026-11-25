import { Safe } from 'iconoir-react-native';

import { SettingsPlaceholder } from '@/components/settings/settings-placeholder';

export default function PrivateVaultScreen() {
  return <SettingsPlaceholder title="Private Vault" icon={Safe} message="Your vault is empty" />;
}
