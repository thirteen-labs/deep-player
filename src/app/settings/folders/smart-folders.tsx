import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Smart folders',
  subtitle: 'Series, seasons and confidence thresholds',
  route: '/settings/folders/smart-folders',
  section: 'folders',
});
