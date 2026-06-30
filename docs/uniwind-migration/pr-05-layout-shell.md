# PR 5 — Layout shell: tabs, splash, root navigation

## Goal

Migrate app chrome that wraps every screen — native tabs (3 platforms), splash, and root stack layout. **Depends on PR 2–3** (Universal primitives for tab icons if needed).

## Files (~7)

| File | Notes |
|------|-------|
| [`tab-bar.tsx`](../../src/components/Layout/tab-bar.tsx) | iOS native tabs |
| [`tab-bar.android.tsx`](../../src/components/Layout/tab-bar.android.tsx) | **Migrate all three together** |
| [`tab-bar.web.tsx`](../../src/components/Layout/tab-bar.web.tsx) | |
| [`splash.tsx`](../../src/components/splash.tsx) | Boot screen |
| [`app/_layout.tsx`](../../src/app/_layout.tsx) | Root stack registration |
| [`usePresentationMode.ts`](../../src/hooks/usePresentationMode.ts) | Header styles → `useResolveClassNames` or CSS variables |

## Platform notes

- Tab inactive tint: `text-tabbar-inactive` or `accent-*` props
- Test iOS, Android, and web tab bars after migration

## Out of scope

- Individual stack screen bodies
- Removing `@/styles/unistyles` import from `_layout.tsx` (final PR)

## Acceptance criteria

- [ ] All three tab-bar variants visually aligned
- [ ] Splash → app transition unchanged
- [ ] Stack headers correct on iOS (transparent / modal presentations)

## Estimated size

~7 files, ~350 lines changed
