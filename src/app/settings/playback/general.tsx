import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'General playback',
  subtitle: 'Speed, resume and history',
  route: '/settings/playback/general',
  section: 'playback',
});
