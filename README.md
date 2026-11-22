# Deep Player

Deep Player is a local-first music and video player for iOS, Android, and web. It scans the device media library into an on-device SQLite database and provides browsing, playback, playlists, favorites, queue management, and offline playback without a backend.

## Features

- **Library scanning** — imports audio and video from the device media library into SQLite
- **Tabs** — Home, Folders, Music, Videos, and User (native tabs on iOS/Android, custom tab bar on web)
- **Music playback** — shared `expo-audio` player with lock-screen controls, background playback, seek, repeat, shuffle, speed, and volume
- **Browsing** — search, artists, albums, track lists, folders, and video smartlists (FlashList-backed)
- **Playlists** — create, rename, delete, and reorder collections; add tracks from any list
- **Favorites and history** — favorite tracks and recently played items
- **Queue** — play next, add to queue, and remove from queue
- **Videos** — video library and `expo-video` player with Picture-in-Picture and background playback config
- **Offline playback** — downloads tracks and artwork to the app document directory and persists local URIs
- **Theming and permissions** — theme picker, media-library and notification permission controls, file picker
- **CI** — lint, typecheck, and release APK build via GitHub Actions

## Tech stack

- Expo SDK 58 / React Native 0.88 / React 19
- Expo Router for file-based navigation
- `expo-sqlite` for local persistence
- `expo-media-library` for device scanning
- `expo-audio` and `expo-video` for playback
- Zustand for app and player state
- FlashList for long lists
- NativeWind / Expo UI components for theming

## Getting started

Prerequisites: Node 24 and npm. Android builds also require JDK 17 and Android SDK 36; iOS builds require Xcode.

```bash
npm ci
cp .env.example .env   # optional; see "Environment" below
npm start
```

Because the app uses native modules, full functionality requires a development build rather than Expo Go:

```bash
npm run android        # local Android dev build (expo run:android)
npm run ios            # local iOS dev build (expo run:ios)
```

Or use EAS to create a cloud development build:

```bash
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Install the build on a device or emulator, then start Metro with `npm start`.

## Scripts

| Script              | Command            | Purpose                  |
| ------------------- | ------------------ | ------------------------ |
| `npm start`         | `expo start`       | Start Metro              |
| `npm run android`   | `expo run:android` | Build and launch Android |
| `npm run ios`       | `expo run:ios`     | Build and launch iOS     |
| `npm run web`       | `expo start --web` | Run the web target       |
| `npm run lint`      | `expo lint`        | ESLint                   |
| `npm run typecheck` | `tsc --noEmit`     | TypeScript check         |

Run `npm run lint && npm run typecheck` before submitting changes.

## Environment

Public variables are bundled into the app. See `.env.example`:

| Variable                           | Default                      | Purpose                             |
| ---------------------------------- | ---------------------------- | ----------------------------------- |
| `EXPO_PUBLIC_APP_ENV`              | `development` / `production` | Environment shown on the User tab   |
| `EXPO_PUBLIC_API_URL`              | empty                        | Reserved for future remote services |
| `EXPO_PUBLIC_ENABLE_NOTIFICATIONS` | `true`                       | Notification feature flag           |
| `EXPO_PUBLIC_ENABLE_ANALYTICS`     | `false`                      | Analytics feature flag              |
| `EXPO_PUBLIC_LOG_LEVEL`            | `debug` / `info`             | Client log level                    |

## Permissions

The app requests media library access to scan audio/video, and optional notification permission for playback controls. On the User tab you can request permissions, pick individual files, open system settings, refresh the library, and change the theme.

## Data and offline behavior

All metadata lives in a local SQLite database (`deep-player.db`), including folders, tracks, playlists, favorites, playback positions, and recently played items. `Scan library` upserts device assets into the `tracks` table. Offline caching downloads track audio and artwork into `Paths.document` and stores their local URIs, so cached items keep playing without network access.

## Project structure

```text
src/app/                 Expo Router routes (screens and layouts)
src/components/          Shared components and connected rows
src/components/ui/       Presentational UI primitives
src/config/              Environment/config helpers
src/db/                  Local database helpers
src/hooks/               Reusable hooks
src/lib/audio/           Shared expo-audio engine
src/lib/db/              SQLite schema and Zustand-backed store
src/lib/library/         Media library scanning and offline cache
src/stores/              Player, sort, and UI state stores
src/utils/               Formatting and sorting helpers
```

Non-route code stays outside `src/app/`. Native `ios/` and `android/` directories are generated by Expo prebuild and are not committed.

## Builds and CI

The EAS project is `@cadmus_labs/deep-player` (`bf15c266-ce64-45e4-8d43-4e3832be8c67` in `app.json`). Profiles in `eas.json`:

| Profile       | Purpose                           |
| ------------- | --------------------------------- |
| `development` | Internal development client build |
| `preview`     | Internal distribution build       |
| `production`  | Store build                       |

`.github/workflows/ci.yml` runs on pushes to `main`/`master`, pull requests, and manual dispatch. It runs lint and typecheck, then regenerates the Android project with `npx expo prebuild --platform android --clean`, runs `./gradlew :app:assembleRelease`, and uploads the resulting APK as the `deep-player-apk` artifact. This APK is debug-signed so it is installable; a production-signed release needs keystore secrets.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for EAS build, submit, OTA update, backup, and Maestro instructions.

## Smoke tests

Maestro flows live in `.maestro/`:

```bash
npx maestro test .maestro/smoke-tabs.yaml
npx maestro test .maestro/smoke-folders.yaml
```

The flows use the Android application id `com.deep.player`.
