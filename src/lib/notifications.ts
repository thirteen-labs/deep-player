import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { env } from '@/config/env';

let initialization: Promise<void> | null = null;

export function isNotificationSupported(): boolean {
  return env.enableNotifications && Platform.OS !== 'web';
}

export function initializeNotifications(): Promise<void> {
  if (!isNotificationSupported()) return Promise.resolve();
  if (!initialization) {
    initialization = (async () => {
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
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}
