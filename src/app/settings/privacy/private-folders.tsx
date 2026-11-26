import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Private folders',
  subtitle: 'Hidden and sensitive media preferences',
  route: '/settings/privacy/private-folders',
  section: 'privacy',
});
