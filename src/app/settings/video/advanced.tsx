import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Video advanced',
  subtitle: 'Decoder and frame-rate options',
  route: '/settings/video/advanced',
  section: 'video',
});
