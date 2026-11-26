import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Notifications',
  subtitle: 'Playback notification and lock-screen controls',
  route: '/settings/notifications',
  section: 'notifications',
});
