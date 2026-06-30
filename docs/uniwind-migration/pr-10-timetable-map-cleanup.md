# PR 10 — Timetable, Map, and Unistyles removal

## Goal

Migrate the two heaviest feature surfaces and remove Unistyles from the codebase entirely. **Depends on all prior PRs.**

## Files

### Timetable (`src/components/Timetable/`) — ~15 files

Including week grid, list, animations, `details-*.tsx` (plain `StyleSheet.create` today).

**Critical:** [`week-event-component.tsx`](../../src/components/Timetable/week-event-component.tsx) — per-event dynamic colors stay as inline `style`, not Tailwind string interpolation.

### Map (`src/components/Map/`) — ~14 files + `room-search-styles.ts`

- Native [`map-screen.tsx`](../../src/components/Map/map-screen.tsx) + web [`map-screen.web.tsx`](../../src/components/Map/map-screen.web.tsx) **in sync**
- Bottom sheet stack uses PR 1 `@gorhom/bottom-sheet` wrappers
- Web: keep HTML `<div className="map-container">` for MapLibre; migrate RN tree only
- Delete [`room-search-styles.ts`](../../src/components/Map/room-search-styles.ts)

### Remaining app routes (~10)

- [`(tabs)/map.tsx`](../../src/app/(tabs)/map.tsx), [`(tabs)/timetable.tsx`](../../src/app/(tabs)/timetable.tsx)
- [`room-search.tsx`](../../src/app/(screens)/room-search.tsx) + [`.ios.tsx`](../../src/app/(screens)/room-search.ios.tsx)
- [`room-report.tsx`](../../src/app/(screens)/room-report.tsx)
- [`app-icon.ios.tsx`](../../src/app/(screens)/app-icon.ios.tsx) — use PR 1 `expo-image` wrapper
- Any other screens still importing Unistyles

### Cleanup

| Action | File |
|--------|------|
| Remove import | [`app/_layout.tsx`](../../src/app/_layout.tsx) — drop `@/styles/unistyles` |
| Remove sync | [`provider.tsx`](../../src/components/provider.tsx) — Unistyles theme sync only |
| Delete | [`src/styles/unistyles.ts`](../../src/styles/unistyles.ts) |
| Remove dep | `package.json` — `react-native-unistyles` |
| Update docs | [`AGENTS.md`](../../AGENTS.md), [`.cursor/rules/styling.mdc`](../../.cursor/rules/styling.mdc) |

Keep [`themes.ts`](../../src/styles/themes.ts) until no JS code reads it directly.

## Acceptance criteria

- [ ] Zero `react-native-unistyles` imports under `src/`
- [ ] Map works on web + native
- [ ] Timetable week view colors correct per event type
- [ ] CI passes: `tsc`, `biome`, `i18n:check`, `test`
- [ ] Light/dark + all accent colors verified

## Estimated size

~40 files, ~2000 lines changed + dependency removal
