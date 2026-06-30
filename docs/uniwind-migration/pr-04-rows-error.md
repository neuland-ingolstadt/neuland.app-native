# PR 4 — Rows and Error components

## Goal

Migrate shared row and error-state components used across timetable, events, grades, and API failure screens. **Depends on PR 2** (`row-entry`, `badge`, `divider`).

## Files (10)

### Rows (`src/components/Rows/`)

| File |
|------|
| [`calendar-row.tsx`](../../src/components/Rows/calendar-row.tsx) |
| [`event-row.tsx`](../../src/components/Rows/event-row.tsx) |
| [`grades-row.tsx`](../../src/components/Rows/grades-row.tsx) |
| [`lecturer-row.tsx`](../../src/components/Rows/lecturer-row.tsx) |
| [`sports-row.tsx`](../../src/components/Rows/sports-row.tsx) |

### Error (`src/components/Error/`)

| File |
|------|
| [`action-box.tsx`](../../src/components/Error/action-box.tsx) |
| [`action-buttons.tsx`](../../src/components/Error/action-buttons.tsx) |
| [`crash-view.tsx`](../../src/components/Error/crash-view.tsx) |
| [`error-view.tsx`](../../src/components/Error/error-view.tsx) |
| [`event-error-view.tsx`](../../src/components/Error/event-error-view.tsx) |

## Acceptance criteria

- [ ] No Unistyles in `Rows/` or `Error/`
- [ ] Error screens still render on web and native
- [ ] Row press/href navigation unchanged

## Estimated size

10 files, ~400 lines changed
