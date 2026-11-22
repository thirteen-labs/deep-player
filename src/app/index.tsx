import { Redirect } from 'expo-router';

/** Initial route: the dashboard. */
export default function Index() {
  return <Redirect href="/home" />;
}
