# Uniwind migration — PR groups

The full Unistyles → Uniwind migration is split into **10 small, independently reviewable PRs**.
Each PR has a scoped file below listing files, dependencies, and acceptance criteria.

| PR | Branch | Scope |
|----|--------|-------|
| 1 | `cursor/uniwind-pr-01-foundation-5279` | CSS tokens + `withUniwind` wrappers |
| 2 | `cursor/uniwind-pr-02-universal-lists-5279` | Universal form/list primitives |
| 3 | `cursor/uniwind-pr-03-universal-inputs-5279` | Universal inputs, icons, pickers |
| 4 | `cursor/uniwind-pr-04-rows-error-5279` | Rows + Error components |
| 5 | `cursor/uniwind-pr-05-layout-shell-5279` | Tab bars, splash, root layout |
| 6 | `cursor/uniwind-pr-06-settings-screens-5279` | Settings + simple stack screens |
| 7 | `cursor/uniwind-pr-07-dashboard-cards-5279` | Cards, Dashboard, Theme, Home |
| 8 | `cursor/uniwind-pr-08-member-flow-5279` | Member area + login/onboarding |
| 9 | `cursor/uniwind-pr-09-events-food-5279` | Events, Calendar, Food |
| 10 | `cursor/uniwind-pr-10-timetable-map-cleanup-5279` | Timetable, Map, Unistyles removal |

**Merge order:** 1 → 2 → 3 → … → 10 (each PR may rebase on the previous).

**Reference:** migrated example [`src/app/(screens)/version.tsx`](../../src/app/(screens)/version.tsx), rules in [`.cursor/rules/styling.mdc`](../../.cursor/rules/styling.mdc).
