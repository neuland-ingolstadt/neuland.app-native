# Proven icon triplets

Reuse these when the feature matches. All triplets are validated against the project's icon sources.

## From changelog.json

| Use case | ios | android | web |
|----------|-----|---------|-----|
| Dark mode / theme | `moon.stars` | `dark_mode` | `MoonStar` |
| Map | `map` | `map` | `Map` |
| Events / parties | `party.popper` | `event` | `PartyPopper` |
| Links / quick links | `link` | `captive_portal` | `Link` |
| Performance / speed | `bolt` | `bolt` | `CircleGauge` |
| Bug fixes | `hammer` | `bug_report` | `Bug` |
| Sports / fitness | `dumbbell` | `exercise` | `Dumbbell` |
| Design / UI refresh | `paintbrush` | `palette` | `Paintbrush` |
| Profile / account | `person` | `person` | `CircleUser` |
| General improvements | `sparkles` | `auto_awesome` | `Sparkles` |

## From src/components/icons.ts (cardIcons)

| Use case | ios | android | web |
|----------|-----|---------|-----|
| Timetable | `clock.fill` | `calendar_month` | `CalendarDays` |
| Calendar / academic | `graduationcap.fill` | `school` | `GraduationCap` |
| Events (dashboard) | `party.popper.fill` | `celebration` | `PartyPopper` |
| THI events | `building.columns.fill` | `account_balance` | `Building2` |
| Sports (dashboard) | `figure.run` | `sports_handball` | `Volleyball` |
| News | `newspaper.fill` | `newspaper` | `Newspaper` |
| Login / guest | `person.fill.questionmark` | `person` | `UserCheck` |
| Links (dashboard) | `safari.fill` | `link` | `Link` |

Changelog entries tend to use **un-filled** iOS symbols; card icons often use `.fill` — either works if the SF Symbol exists.

## Suggested triplets for common new features

Look up each name before use. These follow the same cross-platform mapping style:

| Use case | ios | android | web |
|----------|-----|---------|-----|
| Settings | `gearshape` | `settings` | `Settings` |
| Notifications | `bell` | `notifications` | `Bell` |
| Search | `magnifyingglass` | `search` | `Search` |
| Food / cafeteria | `fork.knife` | `restaurant` | `Utensils` |
| Grades | `chart.bar` | `bar_chart` | `ChartBar` |
| Exams | `doc.text` | `description` | `FileText` |
| Share | `square.and.arrow.up` | `share` | `Share2` |
| Library | `books.vertical` | `local_library` | `Library` |
| Campus / buildings | `building.2` | `domain` | `Building2` |
| Accessibility | `accessibility` | `accessibility` | `Accessibility` |

## Validation commands

Replace placeholders and run from repo root:

```bash
# Android
grep -F "'settings'" src/types/material-icons.ts

# Web
grep -F "exports.Settings =" node_modules/lucide-react-native/dist/cjs/icons/index.js

# iOS
grep -F "'gearshape'" node_modules/sf-symbols-typescript/dist/index.d.ts
```

All three must match. Then confirm TypeScript:

```bash
bun tsc --noEmit
```

## Web naming rule

Lucide file `circle-user.js` → export `CircleUser`. Multi-word icons are PascalCase concatenation. When unsure, search:

```bash
grep -i "circleuser\|circle-user" node_modules/lucide-react-native/dist/cjs/icons/index.js
```

## Android naming rule

Only snake_case identifiers from `src/types/material-icons.ts`. The custom font may not include every Google Material icon — if a glyph is missing from the union, **do not** use it.

## iOS naming rule

Use dotted names for multi-part symbols (`moon.stars`, `party.popper`). Verify in `sf-symbols-typescript`; invalid symbols break `SymbolView` at runtime.
