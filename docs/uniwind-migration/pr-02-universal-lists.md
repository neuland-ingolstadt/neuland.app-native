# PR 2 — Universal: form and list primitives

## Goal

Migrate the highest-reuse Universal components that power settings lists and row layouts. **Depends on PR 1** (tokens); does not require wrappers.

## Files (~12)

| File | Notes |
|------|-------|
| [`divider.tsx`](../../src/components/Universal/divider.tsx) | `useCSSVariable` for default border color |
| [`badge.tsx`](../../src/components/Universal/badge.tsx) | Keep dynamic `backgroundColor` inline where type-specific |
| [`button.tsx`](../../src/components/Universal/button.tsx) | `useColorScheme` + `useCSSVariable` for disabled primary states |
| [`row-entry.tsx`](../../src/components/Universal/row-entry.tsx) | `hairlineBorder` helper |
| [`toggle-row.tsx`](../../src/components/Universal/toggle-row.tsx) | `ios:rounded-ios android:rounded-md` |
| [`form-list.tsx`](../../src/components/Universal/form-list.tsx) | **Largest file** — conditional complete `className` strings for `sheet` mode |
| [`vertical-line.tsx`](../../src/components/Universal/vertical-line.tsx) | |
| [`time-display.tsx`](../../src/components/Universal/time-display.tsx) | |
| [`time-separator.tsx`](../../src/components/Universal/time-separator.tsx) | |
| [`color-band.tsx`](../../src/components/Universal/color-band.tsx) | |
| [`link-text.tsx`](../../src/components/Universal/link-text.tsx) | Plain `StyleSheet.create` today |
| [`loading-indicator.tsx`](../../src/components/Universal/loading-indicator.tsx) | |

## Patterns

- `theme.colors.labelColor` → `text-label`
- `theme.margins.page` → `p-page`
- `theme.radius.ios` → `ios:rounded-ios android:rounded-md`

## Acceptance criteria

- [ ] No `react-native-unistyles` imports in listed files
- [ ] `version.tsx` still renders correctly (uses `FormList`)
- [ ] Light/dark + blue/green/purple accents spot-checked on a settings screen

## Estimated size

~12 files, ~800 lines changed
