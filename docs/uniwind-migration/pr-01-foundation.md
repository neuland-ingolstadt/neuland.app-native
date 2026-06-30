# PR 1 — Foundation: tokens and third-party wrappers

## Goal

Extend the Uniwind design-token surface and add shared `withUniwind` wrappers so later PRs can migrate components without re-introducing infrastructure.

## Files to change

| File | Action |
|------|--------|
| [`src/global.css`](../../src/global.css) | Add missing `--color-*` tokens from [`src/styles/themes.ts`](../../src/styles/themes.ts) |
| [`src/uniwind-types.d.ts`](../../src/uniwind-types.d.ts) | Regenerate via `bun uniwind:types` |
| `src/components/Universal/styled/` (new) | One-time `withUniwind` exports |

## Tokens to add (light + dark variants)

- `--color-date-picker-background`
- `--color-plate-outer`, `--color-plate-outer-border`, `--color-plate-rim`, `--color-plate-rim-border`
- `--color-plate-inner`, `--color-plate-inner-border`, `--color-plate-shadow`, `--color-plate-inner-shadow`
- `--color-calendar-item`, `--color-completed-dot`, `--color-soon-dot`, `--color-white`

## Wrappers to create

| Module | Wraps |
|--------|-------|
| `styled/flash-list.tsx` | `@shopify/flash-list` `FlashList` |
| `styled/masonry-flash-list.tsx` | `MasonryFlashList` |
| `styled/bottom-sheet.tsx` | `@gorhom/bottom-sheet` exports |
| `styled/expo-image.tsx` | `expo-image` `Image` |
| `styled/index.ts` | Re-exports |

## Out of scope

- Migrating any screen or feature component
- Removing Unistyles

## Acceptance criteria

- [ ] All new tokens mirrored in both `@variant light` and `@variant dark`
- [ ] `bun uniwind:types` run and committed
- [ ] `bun tsc --noEmit` passes
- [ ] No `createStyleSheet` removals in this PR

## Estimated size

~6 files, ~120 lines
