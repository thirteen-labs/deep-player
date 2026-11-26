import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Background playback',
  subtitle: 'Background audio, video audio and notifications',
  route: '/settings/playback/background',
  section: 'playback',
});
