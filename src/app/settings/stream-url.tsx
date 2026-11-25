import { Link } from 'iconoir-react-native';

import { SettingsPlaceholder } from '@/components/settings/settings-placeholder';

export default function StreamUrlScreen() {
  return <SettingsPlaceholder title="Stream URL" icon={Link} message="No stream added" />;
}
