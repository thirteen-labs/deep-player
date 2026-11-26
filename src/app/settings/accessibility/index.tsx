import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Accessibility',
  subtitle: 'Text, motion and interaction preferences',
  route: '/settings/accessibility',
  section: 'accessibility',
});
