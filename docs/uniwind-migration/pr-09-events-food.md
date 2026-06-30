# PR 9 — Events, Calendar, and Food

## Goal

Migrate medium-complexity feature areas with domain-specific tokens (food plates from PR 1). **Depends on PR 1, 4, 7**.

## Files

### Events (`src/components/Events/`) — 6 files

- `campus-life-events-screen.tsx`, `cl-events-page.tsx`, `cl-sports-page.tsx`
- `campus-life-organizers-list.tsx`, `calendar-animation.tsx`, `empty-events-animation.tsx`
- Use PR 1 `FlashList` wrapper where applicable

### Calendar (`src/components/Calendar/`) — 2 files

- `calendar-events-page.tsx`, `exams-page.tsx`

### Food (`src/components/Food/`) — 15 files

All food components including plate UI (`shared-plate.tsx`, `plate-animation.tsx`, `meal-entry.tsx`, etc.).

**Tokens:** `--color-plate-*`, `--color-veg-green`

**Keep inline `style`:** `curved-text.tsx`, shadow stacks on plates, Reanimated in `plate-animation.tsx`

### Screens (~10)

- [`food/[id].tsx`](../../src/app/(screens)/food/[id].tsx)
- Event detail routes: `events/cl/[id].tsx`, `events/sports/[id].tsx`, `events/organiser/[id].tsx`
- [`lecturer.tsx`](../../src/app/(screens)/lecturer.tsx), [`lecturers.tsx`](../../src/app/(screens)/lecturers.tsx)
- [`lecture.tsx`](../../src/app/(screens)/lecture.tsx), [`exam.tsx`](../../src/app/(screens)/exam.tsx)
- Thin tab [`food.tsx`](../../src/app/(tabs)/food.tsx) if it imports Unistyles

## Acceptance criteria

- [ ] Cafeteria plate renders in light/dark
- [ ] Event list scrolling performant (`FlashList`)
- [ ] Exam/calendar pages unchanged functionally

## Estimated size

~33 files, ~1500 lines changed
