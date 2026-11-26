import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'App lock',
  subtitle: 'Authentication and settings protection',
  route: '/settings/privacy/app-lock',
  section: 'privacy',
});
