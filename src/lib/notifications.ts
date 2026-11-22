import Constants from 'expo-constants';
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

export async function scheduleLocalNotification(params: {
  title: string;
  body: string;
  seconds?: number;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  if (!isNotificationSupported()) return null;

  const { title, body, seconds = 1, data } = params;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {} },
      trigger:
        seconds <= 0
          ? null
          : {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
            },
    });
  } catch {
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // no-op
  }
}

export function getExpoProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId
  );
}