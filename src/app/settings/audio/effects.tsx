import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Audio effects',
  subtitle: 'Crossfade, bass boost and visualizer',
  route: '/settings/audio/effects',
  section: 'audio',
});
