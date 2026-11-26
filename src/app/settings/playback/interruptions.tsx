import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Interruptions',
  subtitle: 'Calls, headphones and audio focus',
  route: '/settings/playback/interruptions',
  section: 'playback',
});
