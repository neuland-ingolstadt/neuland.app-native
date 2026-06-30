# PR 7 — Dashboard, Cards, Theme, Home, Library

## Goal

Migrate the home dashboard surface and reusable card primitives. **Depends on PR 2–4** (Universal + Rows).

## Files

### Cards (`src/components/Cards/`) — ~17 files

Including `base-card.tsx`, `announcement-card.tsx`, `calendar-card.tsx`, `news-card.tsx`, `login-card.tsx`, `link-card.tsx`, `sports-card.tsx`, `campus-life-events-card.tsx`, and `up-next/` subfolder (5 files).

**Note:** `up-next/` uses dynamic event colors — keep inline `style` for per-event `backgroundColor`.

### Dashboard (`src/components/Dashboard/`) — 5 files + `styles.ts`

- Migrate components, inline shared styles from [`styles.ts`](../../src/components/Dashboard/styles.ts), then **delete** `styles.ts`.

### Theme (`src/components/Theme/`) — 3 files

Accent picker previews rely on runtime accent sync (`useUniwindThemeSync`) — no extra work needed.

### Home + Library — 2 files

- [`home-header-right.tsx`](../../src/components/Home/home-header-right.tsx)
- [`library-card.tsx`](../../src/components/Library/library-card.tsx)

### Related screens (~8)

- [`dashboard.tsx`](../../src/app/(screens)/dashboard.tsx), [`dashboard.web.tsx`](../../src/app/(screens)/dashboard.web.tsx)
- [`(tabs)/index.tsx`](../../src/app/(tabs)/index.tsx) — uses `MasonryFlashList` (PR 1 wrapper)
- [`news.tsx`](../../src/app/(screens)/news.tsx), [`library.tsx`](../../src/app/(screens)/library.tsx)
- [`sports.tsx`](../../src/app/(screens)/sports.tsx), [`grades.tsx`](../../src/app/(screens)/grades.tsx)
- [`calendar.tsx`](../../src/app/(screens)/calendar.tsx)

## Acceptance criteria

- [ ] Dashboard card reorder still works
- [ ] Up-next card progress colors correct
- [ ] `Dashboard/styles.ts` deleted

## Estimated size

~35 files, ~1200 lines changed
