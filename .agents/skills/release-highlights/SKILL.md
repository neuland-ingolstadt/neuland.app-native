---
name: release-highlights
description: Build and maintain a human-readable Neuland Next changelog of stable GitHub releases (betas folded into the stable that shipped them), then publish it to Outline. Use when the user asks for release highlights, a user-facing release changelog, RELEASES.md-style notes, or to refresh the Outline Release Highlights page after a stable ship.
---

# Release Highlights (Outline)

Human-readable overview of **stable** Neuland Next releases for the team — not the in-app What's New JSON, and not the git-cliff `CHANGELOG.md`.

## Related (do not confuse)

| Artifact | Purpose | Skill / tool |
|----------|---------|--------------|
| Outline **Release Highlights** | Stable releases, student/team-readable | **this skill** |
| `src/data/changelog.json` | In-app What's New cards (de/en + icons) | `changelog-json` |
| `CHANGELOG.md` / GH release bodies | Commit-level history via git-cliff | `bun changelog` |

## Outline placement (canonical)

| Item | Value |
|------|-------|
| Document | **Release Highlights** |
| URL | https://outline.neuland.ing/doc/release-highlights-pcJtg9r7y7 |
| Document ID | `d80b2f27-c607-4724-9923-e609e37c6472` |
| Parent | **App** (directly under App, top of siblings) |
| Parent ID | `2d5ba011-4e51-419f-a1cb-2ec7e603ff1b` |
| Breadcrumb | Projekte → Neuland Next → App → Release Highlights |

Re-verify with `list_documents` / `list_collection_documents` if the ID is stale. Prefer **updating** this page; do not create a duplicate.

Use the `neuland-outline` MCP (`user-neuland-outline` / project server). Follow `neuland-outline-docs` for MCP auth and write rules (no H1 in body; title is a separate field).

## Voice and scope

- **Audience:** team members and curious students — clear, friendly English (match the existing Outline page unless asked otherwise).
- **Per stable release only.** Skip pure beta tags. Fold every beta into the next **stable** that includes it (e.g. 0.17 betas → 0.18.0).
- **Not too technical, not too detailed** — but do not drop anything interesting (new surfaces, member features, map UX, wallet, sports, redesigns, notable fixes users notice).
- **Omit:** CI, Renovate, Sonar, Maestro, dependency bumps, path-alias refactors, Xcode Cloud scripts, unless they change something users feel.
- **Structure:** newest first. Version heading + Outline date mention. Bullets; use `###` subgroups only for large releases (Map, App-wide, …).
- **No em dashes (`—`) or en dashes (`–`).** Use a plain hyphen (` - `), colon, or comma instead. Markdown `---` horizontal rules are fine.
- **Dates:** use Outline **native date mentions**, not plain text. MCP markdown form:

  ```markdown
  @[11.10.2026](mention://date/2026-10-11)
  ```

  - Label: German `DD.MM.YYYY` (zero-padded), matching how users type `@01.01.2020` in the editor
  - URL: `mention://date/YYYY-MM-DD` (ISO date-only; required for the chip)
  - Example heading: `## 0.18.1 - @[11.10.2026](mention://date/2026-10-11)`
- **Intro:** one short paragraph on what the page is + latest stable version/date mention. Mention in-progress betas only as “not listed yet”.

## Workflow

```
- [ ] 1. List GitHub releases (stable only)
- [ ] 2. For each stable tag, read the release body (includes folded beta sections)
- [ ] 3. Optionally skim commits between previous stable → this stable for gaps
- [ ] 4. Draft human bullets (features first, then notable fixes)
- [ ] 5. Fetch Outline doc; update (prefer replace/append of the highlights body)
- [ ] 6. Return the Outline URL — do not leave a local RELEASES.md unless asked
```

### 1–2. Gather releases

```bash
gh release list --limit 300 | awk -F'\t' '$2 != "Pre-release" {print $3 "\t" $4}'
gh release view <tag> --json tagName,publishedAt,body
```

Repo: `neuland-ingolstadt/neuland.app-native`.

If a minor line never shipped stable (e.g. only `0.17.0-beta.*`), attribute those changes to the next stable that contains them.

### 3. Fill gaps

When GH bodies are thin or auto-generated, check:

- `src/data/changelog.json` for that major.minor (tone hints, not a full source)
- `git log <prev-stable>..<stable> --oneline` for user-facing commits

### 4. Drafting rules

- Lead with what the user can **do** or **see** (tap lecturer → profile, swipe floors, member ID, …).
- One idea per bullet; bold the noun that matters (`**Quick Links**`, `**liquid glass**`).
- Tiny patch releases: 1–4 bullets or a single “layout / crash fix” line — do not pad.
- Large releases: short intro sentence + grouped bullets.
- Keep platform notes only when user-visible (iOS glass, Android tab ripple, web PWA).

### Template (Outline body — no H1)

```markdown
Human-readable overview of **stable** releases. Beta builds are folded into the stable version that shipped them. Internal tooling, CI, and dependency-only changes are left out.

Latest stable: **X.Y.Z** (@[DD.MM.YYYY](mention://date/YYYY-MM-DD)).
`X.Y.Z+1` is still in beta and not listed here yet.

---

## X.Y.Z - @[DD.MM.YYYY](mention://date/YYYY-MM-DD)

Intro sentence if useful.

- Bullet
- Bullet

---

## …

---

## Notes

- Patch releases often reuse the same in-app “What’s New” entry as their minor version.
- For commit-level detail, see the [GitHub Releases](https://github.com/neuland-ingolstadt/neuland.app-native/releases) pages.
```

### 5. Publish

**Update existing doc** (`update_document`):

- Prefer `editMode: "replace"` when refreshing the whole page after a new stable.
- Or `append` / `patch` when only adding the newest section at the top (after the intro).
- `title`: `Release Highlights`
- Do **not** nest under Release & Betrieb; parent must stay **App**.
- If recreating after deletion: `create_document` with `parentDocumentId` = App ID, `index: 0`, `publish: true`.

**Local files:** do not commit `RELEASES.md` by default — Outline is the source of truth. Only write a local markdown file if the user asks for one.

### 6. After a new stable ship

1. Pull the new stable + its betas.
2. Prepend a new `##` section; bump “Latest stable” in the intro.
3. Drop the “still in beta” line for that version (or point at the next beta line).
4. Patch/replace Outline; link the URL in the reply.

## Quality check

- [ ] Only stable versions as top-level headings
- [ ] Unshipped beta lines folded into the stable that shipped them
- [ ] No CI/deps noise; interesting product changes kept
- [ ] Newest first; Outline date mentions present
- [ ] No em dashes (`—`) or en dashes (`–`)
- [ ] Outline page updated (not a duplicate); lives under **App**
- [ ] No `#` H1 in Outline body
