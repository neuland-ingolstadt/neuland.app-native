# PR 3 — Universal: inputs, icons, and pickers

## Goal

Finish [`src/components/Universal/`](../../src/components/Universal/) migration. **Depends on PR 2** (`form-list`, `divider`).

## Files (~11)

| File | Notes |
|------|-------|
| [`dropdown.tsx`](../../src/components/Universal/dropdown.tsx) | Needs `--color-date-picker-background` from PR 1 |
| [`icon.tsx`](../../src/components/Universal/icon.tsx) | Icon color via `style` / `useCSSVariable` |
| [`single-section-picker.tsx`](../../src/components/Universal/single-section-picker.tsx) | |
| [`single-section-picker.ios.tsx`](../../src/components/Universal/single-section-picker.ios.tsx) | Migrate together with default |
| [`multi-section-picker.tsx`](../../src/components/Universal/multi-section-picker.tsx) | |
| [`share-button.tsx`](../../src/components/Universal/share-button.tsx) | |
| [`share-header-button.tsx`](../../src/components/Universal/share-header-button.tsx) | |
| [`event-item.tsx`](../../src/components/Universal/event-item.tsx) | `color` prop → `useCSSVariable` |
| [`sections-view.tsx`](../../src/components/Universal/sections-view.tsx) | |
| [`login-form.tsx`](../../src/components/Universal/login-form.tsx) | |
| [`bottom-sheet-root-background.tsx`](../../src/components/Universal/bottom-sheet-root-background.tsx) | May use PR 1 bottom-sheet wrapper |
| [`workaround-stack.tsx`](../../src/components/Universal/workaround-stack.tsx) | |

## Out of scope

- `pulsing-dot.tsx` — no Unistyles today

## Acceptance criteria

- [ ] Entire `Universal/` folder free of `createStyleSheet` (except `styled/` wrappers)
- [ ] Pickers work on iOS and Android
- [ ] `bun tsc --noEmit` + `bun lint` pass

## Estimated size

~11 files, ~600 lines changed
