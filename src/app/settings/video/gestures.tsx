import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Video gestures',
  subtitle: 'Brightness, volume and seek gestures',
  route: '/settings/video/gestures',
  section: 'video',
});
