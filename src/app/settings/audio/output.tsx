import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Audio output',
  subtitle: 'Balance, normalization and mono audio',
  route: '/settings/audio/output',
  section: 'audio',
});
