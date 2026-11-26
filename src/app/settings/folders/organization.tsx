import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Organization',
  subtitle: 'Sorting and empty-folder visibility',
  route: '/settings/folders/organization',
  section: 'folders',
});
