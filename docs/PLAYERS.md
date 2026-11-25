# Player design

Deep Player uses one engine per media type: `expo-audio` for music and `expo-video`
for video. Both are first-party Expo modules that work across iOS, Android and
web. Because they use native plugins and foreground services, a development
build is required on devices. The player UIs borrow mpv's interaction model
(direct seeking, speed cycling, an on-screen display that gets out of the way,
and keyboard shortcuts) without trying to embed mpv itself.

## Why not libmpv?

[mpv](https://github.com/mpv-player/mpv) is an excellent desktop C player, but
it is not a good fit for this app:

- libmpv ships desktop binaries (and an Android library that requires a custom
  native module and JNI wrapper). Wiring it into an Expo app would mean
  maintaining two native integrations by hand, which is incompatible with the
  repo's Continuous Native Generation setup (`android/` is generated).
- `mpv.js` is a WebAssembly port for browsers only. It needs large WASM assets
  and a custom bundler setup, and would give us a second, duplicate engine on
  web while leaving native playback untouched.
- On mobile, media comes from `expo-media-library` URIs and the app's document
  directory. `expo-audio`/`expo-video` already know how to open those URIs,
  expose lock-screen/media-session controls, and handle background playback.

So the design keeps the native engines and adopts the parts of mpv that make a
player feel powerful: predictable shortcuts, 10-second seek steps, a playback
speed control, and controls that auto-hide while watching.

## Audio player

| Piece | Location | Responsibility |
| --- | --- | --- |
| Engine | `src/lib/audio/player.ts`, `src/components/player-engine.tsx` | One `expo-audio` player for the app lifetime; status ticks at 250 ms. |
| State | `src/stores/player-store.ts` | Track, queue, repeat, shuffle, speed, volume, progress persistence. |
| Mini bar | `src/components/ui/now-playing-card.tsx` | Compact now-playing row on the Music tab; taps open the full player. |
| Full player | `src/app/player.tsx` | Artwork, transport, scrubber, speed/volume, queue, favorites. |
| Adaptive color | `src/hooks/use-artwork-palette.ts`, `src/utils/color.ts`, `src/components/theme-override.tsx` | Extracts artwork colors and scopes them to the player surfaces. |

Key behaviors:

- Progress is written to SQLite at most every 5 seconds, plus on pause, skip,
  switch and unmount. Resuming more than 5 seconds in (and more than 10 seconds
  before the end) restores the saved position.
- `repeat: one` replays the current track; `repeat: all` wraps the queue.
- Shuffle reorders the upcoming queue while keeping the current track first.
- The lock screen / notification is updated with title, artist, album and
  artwork for the active track, and background playback stays active.
- The full player and mini bar derive their tint, accents, text and blurred
  backdrop from the active artwork. Extraction uses `react-native-image-colors`
  and is scoped with a theme override, so the rest of the app keeps the user's
  selected theme. Missing artwork or a failed extraction falls back to the
  active theme's tint.

## Video player

`src/app/videos/[id].tsx` is an immersive, dark player screen:

- Tap the frame to toggle the control overlay. While playing it auto-hides after
  3.5 seconds; while paused it stays visible.
- Transport: play/pause, back 10s, forward 10s, tap-to-seek progress, speed
  (0.5×–2×), mute, fullscreen and Picture-in-Picture (when supported).
- The player pauses other audio (`audioMixingMode: 'doNotMix'`), keeps a media
  notification, keeps the screen on, and preserves pitch when speed changes.
- Resume position and "watched" state are stored in the `playbackPositions`
  table used by the bottom-right Continue watching button.

## Configuration

`app.json` enables the native capabilities that cannot be changed at runtime:

| Plugin | Option | Effect |
| --- | --- | --- |
| `expo-audio` | `enableBackgroundPlayback: true` | Media foreground service (Android), `audio` background mode (iOS). |
| `expo-audio` | `recordAudioAndroid: false`, `microphonePermission: false` | No microphone permission for a playback-only app. |
| `expo-video` | `supportsBackgroundPlayback: true` | Video foreground service / iOS background audio. |
| `expo-video` | `supportsPictureInPicture: true` | PiP on Android and iOS. |

`src/lib/audio/init.ts` configures the audio session at startup
(`playsInSilentMode`, `shouldPlayInBackground`, `interruptionMode: 'doNotMix'`),
which is required for lock-screen controls to stay attached to the player.

## Keyboard shortcuts (web / desktop)

| Key | Action |
| --- | --- |
| `Space` / `K` | Play or pause |
| `←` / `J` | Back 10 seconds |
| `→` / `L` | Forward 10 seconds |
| `↑` / `↓` | Forward / back 30 seconds |
| `N` / `>` | Next track |
| `B` / `<` | Previous track |
| `9` / `0` | Volume down / up |
| `M` | Mute |
| `S` | Cycle playback speed |
| `F` | Toggle fullscreen (video) |
| `I` | Toggle Picture-in-Picture (video) |
| `H` | Toggle the control overlay (video) |
| `Esc` | Close the player |

Shortcuts are ignored while typing in text fields and when a modifier key is
held. Native builds use the touch controls instead.

## Verification

```bash
npx expo lint
npx tsc --noEmit
npx expo-doctor
```

Device checklist: start a track and confirm the mini bar opens `/player`;
seek, change speed, mute and cycle repeat/shuffle; lock the screen and verify
the media notification; open a video and confirm resume, auto-hide, ±10s,
fullscreen and PiP; rotate to check the fullscreen layout.
