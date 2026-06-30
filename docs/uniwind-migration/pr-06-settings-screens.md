# PR 6 — Settings cluster and simple stack screens

## Goal

Migrate the settings UI and low-complexity stack screens that compose `FormList`. **Depends on PR 2** (`form-list`) and ideally PR 5 (layout).

## Component files (~14)

All of [`src/components/Settings/`](../../src/components/Settings/):

- `settings-screen.tsx`, `settings-header.tsx`, `settings-logo.tsx`
- `avatar-circle.tsx`, `name-box.tsx`, `info-box.tsx`, `neuland-box.tsx`
- `tab-button.tsx`, `grades-button.tsx`
- `student-info-section.tsx`, `employee-info-section.tsx`, `guest-info-section.tsx`

## Screen files (~15)

| Screen | Path |
|--------|------|
| About | [`about.tsx`](../../src/app/(screens)/about.tsx) |
| Legal | [`legal.tsx`](../../src/app/(screens)/legal.tsx) |
| Licenses | [`licenses.tsx`](../../src/app/(screens)/licenses.tsx), [`license.tsx`](../../src/app/(screens)/license.tsx) |
| Changelog | [`changelog.tsx`](../../src/app/(screens)/changelog.tsx) |
| Links | [`links.tsx`](../../src/app/(screens)/links.tsx) |
| Profile | [`profile.tsx`](../../src/app/(screens)/profile.tsx) |
| Theme | [`theme.tsx`](../../src/app/(screens)/theme.tsx) |
| Version | [`version.tsx`](../../src/app/(screens)/version.tsx) — finish hybrid migration |
| Webview | [`webview.tsx`](../../src/app/(screens)/webview.tsx) |
| Dots | [`dots.tsx`](../../src/app/(screens)/dots.tsx) |
| Food prefs | [`food-preferences.tsx`](../../src/app/(screens)/food-preferences.tsx) |
| Timetable prefs | [`timetable-preferences.tsx`](../../src/app/(screens)/timetable-preferences.tsx) |
| What's new | [`whatsnew.tsx`](../../src/app/(screens)/whatsnew.tsx) |
| THI departments | [`thi-departments.tsx`](../../src/app/(screens)/thi-departments.tsx) |

## Acceptance criteria

- [ ] Settings tab fully Uniwind
- [ ] All listed screens pass visual check in light/dark
- [ ] `FormList` sheet mode still works in modals

## Estimated size

~29 files, ~900 lines changed
