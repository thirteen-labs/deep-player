import { Stack } from 'expo-router';

/** Settings sub-screens render their own themed TopBar with a back button. */
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
