import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { env } from '@/config/env';

let initialized = false;

export function isNotificationSupported(): boolean {
  return env.enableNotifications && Platform.OS !== 'web';
}

export async function initializeNotifications(): Promise<void> {
  if (initialized || !isNotificationSupported()) return;
  initialized = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      // eslint-disable-next-line import/namespace -- AndroidImportance is re-exported through `export *` from expo-notifications' root.
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync('playback', {
      name: 'Playback',
      // eslint-disable-next-line import/namespace -- AndroidImportance is re-exported through `export *` from expo-notifications' root.
      importance: Notifications.AndroidImportance.LOW,
      sound: undefined,
    });
  }
}
