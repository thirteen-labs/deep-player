import Constants from 'expo-constants';

type AppEnv = 'development' | 'preview' | 'production';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function readString(key: string, fallback = ''): string {
  // eslint-disable-next-line expo/no-dynamic-env-var -- app reads env keys dynamically from its config.
  const value = process.env[key];
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const extraValue = extra?.[key];
  return typeof extraValue === 'string' ? extraValue : fallback;
}

function readBool(key: string, fallback: boolean): boolean {
  const raw = readString(key, fallback ? 'true' : 'false').toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}

function readAppEnv(): AppEnv {
  const raw = readString('EXPO_PUBLIC_APP_ENV', __DEV__ ? 'development' : 'production');
  if (raw === 'development' || raw === 'preview' || raw === 'production') return raw;
  return __DEV__ ? 'development' : 'production';
}

function readLogLevel(): LogLevel {
  const raw = readString('EXPO_PUBLIC_LOG_LEVEL', __DEV__ ? 'debug' : 'info');
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return __DEV__ ? 'debug' : 'info';
}

export const env = {
  appEnv: readAppEnv(),
  apiUrl: readString('EXPO_PUBLIC_API_URL', ''),
  enableNotifications: readBool('EXPO_PUBLIC_ENABLE_NOTIFICATIONS', true),
  enableAnalytics: readBool('EXPO_PUBLIC_ENABLE_ANALYTICS', false),
  logLevel: readLogLevel(),
  isDev: __DEV__,
} as const;

export type Env = typeof env;