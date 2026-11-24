import AppTabs from '@/components/app-tabs';

/**
 * Tab navigator for the main app sections. The platform-specific AppTabs
 * component uses native tabs on Android/iOS and headless tabs on web.
 */
export default function TabsLayout() {
  return <AppTabs />;
}
