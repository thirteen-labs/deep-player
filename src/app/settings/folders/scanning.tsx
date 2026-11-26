import { settingsScreen } from '@/components/settings/route-factories';

export default settingsScreen({
  title: 'Scanning',
  subtitle: 'Auto-scan, thumbnails and duplicate detection',
  route: '/settings/folders/scanning',
  section: 'folders',
});
