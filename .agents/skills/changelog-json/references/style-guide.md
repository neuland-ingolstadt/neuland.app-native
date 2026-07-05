# Changelog style guide

Derived from `src/data/changelog.json`. Use as a checklist when drafting new entries.

## Title patterns

| Pattern | DE examples | EN examples |
|---------|-------------|-------------|
| Feature name | Hochschulsport, Quick Links, Neues Design | University Sports, Quick Links, New Design |
| Feature + area | Karten Darkmode, Profil Tab | Map Darkmode, Profile Tab |
| Category | Fehlerbehebungen, Verbesserungen, Performance Verbesserungen | Bug Fixes, Improvements, Performance Improvements |
| Extended feature | Weitere Quick Links, Native Karten, Event Details | More Quick Links, Native Map, Event Details |

**Rules:**

- No trailing period on titles.
- Proper nouns stay as-is (`Quick Links`, `Dashboard` in descriptions).
- German compound nouns: no hyphen unless standard (`Hochschulsport`, not `Hochschul-Sport`).

## Description patterns

### Feature announcement (single sentence)

| DE | EN |
|----|-----|
| Aktiviere den Darkmode, um eine dunkle Kartenansicht zu erhalten. Zudem wurde auch die helle Ansicht komplett erneuert und optimiert. | Enable dark mode to get a dark map view. In addition, the light view has also been completely renewed and optimized. |
| Eine neue Dashboard Karte liefert dir schnellen Zugriff auf wichtige Links. | A new dashboard card provides quick access to important links. |
| Tippe auf ein Event, um mehr Informationen zu erhalten, wie zum Ort oder der Beschreibung. | Tap on an event to get more information, such as the location or description. |
| Finde alle Hochschulsport Angebote auf einen Blick in der neuen Events & Sport Ansicht. | Find all university sports offers at a glance in the new Events & Sports view. |

### Feature + action hint

| DE | EN |
|----|-----|
| Klicke auf die Karte, um weitere Quick Links aufzurufen und deine Lieblingslinks anzupassen. | Click on the card to access more quick links and customize your favorite links. |
| Erreiche deine persönlichen Informationen und Einstellungen schneller über den neuen Profil Tab. | Access your personal information and settings faster through the new profile tab. |

### Larger redesign

| DE | EN |
|----|-----|
| Das Dashboard und die gesamte App wurden mit einem frischen, modernen Design überarbeitet. | The dashboard and the entire app have been redesigned with a fresh, modern look. |
| Die Karte komplett neu geschrieben und verfügt nun über natives Rendering, Gesten und noch mehr Informationen. | The map has been completely rewritten and now has native rendering, gestures and even more information. |

## Length targets

Measured from existing entries:

| Field | Typical range |
|-------|----------------|
| Title `de` / `en` | 8–28 characters |
| Description `de` / `en` | 70–150 characters (up to ~180 for two-sentence map release notes) |

If your draft is longer than the longest 0.13 entry, shorten it.

## Bilingual parity

- **Same meaning** in both languages — not word-for-word translation, but same user takeaway.
- DE and EN titles often identical for loanwords (`Quick Links`, `Event Details`, `Campus Widget`).
- DE uses **du**; EN uses implicit **you** — never formal Sie in DE for this app.

## What not to write

- Internal-only changes (refactors, dependency bumps, CI) unless user-visible.
- "Fixed crash in TimetableViewModel" → instead: user symptom or omit (use standard bug-fix card).
- Multiple features crammed into one entry — split into separate cards.
- Emoji in titles or descriptions.

## Entry ordering within a version

Observed order (when multiple entries):

1. Headline new features (biggest UX change first)
2. Secondary features / extensions
3. Performance (if notable)
4. Bug fixes (often last, standard copy)

Single-entry releases typically use `Verbesserungen` / `Improvements` for minor mixed releases.
