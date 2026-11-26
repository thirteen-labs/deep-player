import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Subtitles',
  subtitle: 'Language, appearance and timing',
  route: '/settings/video/subtitles',
  section: 'video',
});
