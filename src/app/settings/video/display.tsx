import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Video display',
  subtitle: 'Aspect ratio, orientation and controls',
  route: '/settings/video/display',
  section: 'video',
});
