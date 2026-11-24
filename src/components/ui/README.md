# UI component library

Import everything from the barrel:

```tsx
import { AppButton, EmptyState, Screen, SectionCard } from '@/components/ui';
```

## Principles

- All components read the active palette from `useTheme()` — no hardcoded light/dark colors.
- All screens use `Screen`, which provides the themed background, ScrollView, safe-area padding and a centered max-width page.
- All pressable components use `PressableScale` for consistent pressed feedback.
- Presentational components live in `src/components/ui`. Components that read stores are thin wrappers elsewhere (see `src/components/track-row.tsx`).

## Layout

| Component | Use |
| --- | --- |
| `Screen` | Root of every tab/stack screen. Props: `title`, `description`, `headerAction`, `header`, `contentContainerStyle`, `pageStyle`. |
| `ScreenHeader` | Standalone title + description when `Screen`'s automatic header is not enough. |
| `TopBar` | Shared app bar: logo at far start, title, sort triggers, search/bell/profile actions. |
| `AppLogo` | Brand mark + wordmark; optionally pressable (navigates home from `TopBar`). |
| `SortMenuButton` | Triggers the root-level universal or smart-list sort sheet. |
| `SectionCard` | Glass card with `title`, `subtitle`, `action`, `footer`, `padding`, `gap`, `radius`. |
| `GlassView` | Low-level glass surface (native liquid glass / blur / web backdrop filter). |

## Data display

| Component | Use |
| --- | --- |
| `InfoRow` | Label + value (+ subtitle/icon), optionally pressable (`onPress`). |
| `FolderRow` | Library folder/smartlist row built on `InfoRow`. |
| `TrackRow` | Presentational track row; pass `onPress` and `onFavoritePress`. |
| `TrackList` | Tracks + loading/empty states in one component. |
| `MediaArtwork` | Square artwork with themed fallback icon. |
| `EmptyState` / `LoadingState` | Consistent placeholders. |
| `Loader` | Branded animated spinner; props `size`, `label`, `color`, `trackColor`. |
| `LoadingOverlay` | Full-screen blocking loader; use with `visible` / `label`. |

## Controls

| Component | Use |
| --- | --- |
| `AppButton` | `variant="primary" \| "secondary" \| "ghost"`, `size="small" \| "medium"`, optional icon. |
| `IconButton` | Icon-only button; `variant`, `active`, `size`, `iconSize`. |
| `SegmentedControl` | Generic segmented selector: `<SegmentedControl options={[{value, label}]} value={...} onValueChange={...} />`. |
| `Scrubber` | Tap-to-seek progress bar with time labels. |
| `PressableScale` | Base pressable with scale + opacity feedback. |
| `ThemedIcon` | Iconoir icon with a palette key or explicit color. |
| `PermissionRow` | Label + status + request button for system permissions. |
| `NowPlayingCard` | Compact now-playing bar that opens `/player`. Reads the player store itself; no props needed. |
| `AppBottomSheet` | Themed `@gorhom/bottom-sheet` wrapper; starts closed, control via ref (`present()`, `snapToIndex()`, `close()`). |

## Hooks / utils

- `useScreenBottomInset()` — bottom padding for tab screens (used by `Screen`).
- `formatTime(seconds)` / `formatCount(value)` — display formatting.

## Adding a component

1. Create a kebab-case file in `src/components/ui/`.
2. Use `useTheme()` for colors and `Spacing` constants for dimensions.
3. Accept `style?: StyleProp<ViewStyle>` on layout components so callers can override.
4. Export it from `src/components/ui/index.ts`.
