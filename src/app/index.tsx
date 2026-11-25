import { Redirect } from 'expo-router';

/** Initial route: the library tabs. */
export default function Index() {
  return <Redirect href="/folders" />;
}
