import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Developer',
  subtitle: 'Experimental and debug controls',
  route: '/settings/advanced/developer',
  section: 'advanced',
});
