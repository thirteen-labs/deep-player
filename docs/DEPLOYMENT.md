# Deployment — Deep Player

Builds, staging, OTA updates and backup notes. Run from this directory with `npx` (no Bun in this repo, so `npx eas-cli@latest` is the documented EAS CLI form).

## EAS profiles (`eas.json`)

| Profile | Command |
| --- | --- |
| development | `npx eas-cli@latest build --profile development --platform ios` |
| preview (internal) | `npx eas-cli@latest build --profile preview --platform ios,android` |
| production (store) | `npx eas-cli@latest build --profile production` |

Notes:
- The project is linked to EAS (`@cadmus_labs/deep-player`, project id in `app.json` under `expo.eas.projectId`).
- Latest successful development Android build: https://expo.dev/accounts/cadmus_labs/projects/deep-player/builds/1c354f04-302e-433b-89b4-62e618a0e665
  - Earlier verification build: https://expo.dev/accounts/cadmus_labs/projects/deep-player/builds/d9731296-52aa-4fc0-8e6c-5419cda8b4af
- `expo-dev-client` is installed and required for the `development` profile.
- EAS managed credentials are configured automatically when unset — configure Apple + Google credentials in the Expo dashboard first if you see credential errors.
- Simulator dev builds run locally via `npx expo run:ios` / `npx expo run:android`.

## Submitting

`npx eas-cli@latest submit --profile production` — submits the latest production build to TestFlight / Play Console.

## OTA updates (Expo Update)

- Push to a branch: `npx eas-cli@latest update --branch production --message "New playlist picker"`.
- Users receive updates on next launch (only when the app's runtime version is compatible — rebuild the app binary when native changes happen).
- Roll back by pushing a new update to the same branch (e.g. `npx eas-cli@latest update --branch production --message "Revert: song browser"`) and pointing the channel at it; delete the broken update with `npx eas-cli@latest update:delete` if needed.

## Backup & restore

- User data (folders, playlists, favorites, playback positions, recently played) lives in the app's SQLite database (`deep-player.db`).
- To inspect or export it during development, use the built-in SQLite inspector: devtools menu → *Open expo-sqlite* → export tables.
- For production incident recovery, back up the users' `deep-player.db` file before any destructive migration and verify a restore by re-running the app and re-scanning the library.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on pushes to `main`/`master`, pull requests and manual dispatch:

- `verify` job: `npm ci` → `npm run lint` → `npm run typecheck`.
- `build-apk` job (after `verify`): sets up Node 24, JDK 17 and Android SDK 36, runs `npx expo prebuild --platform android --clean`, then `./gradlew :app:assembleRelease` and uploads `android/app/build/outputs/apk/release/*.apk` as the `deep-player-apk` artifact.

The generated `android/` directory is not committed; CI regenerates it with Continuous Native Generation.

## Maestro smoke tests

- Run: `npx maestro test .maestro/smoke-tabs.yaml` and `npx maestro test .maestro/smoke-folders.yaml` on a device or emulator connected via adb/Xcode.
- The Android application id is `com.deep.player` (set in `app.json` as `android.package`). Update the `appId` in the flows if this changes.

## Recommended flow

1. `npx expo lint && npx tsc --noEmit` — run before every push.
2. Push OTA update: `npx eas-cli@latest update --branch preview --message "..."`.
3. Test on a connected device (`npx expo run:ios` — or download the preview build from the Expo dashboard).
4. On green: `npx eas-cli@latest build --profile production` → `npx eas-cli@latest submit --profile production` (TestFlight / Play).
5. On release: bump `version` in `app.json` → `eas update` → submit.
