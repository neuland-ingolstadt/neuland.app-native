---
name: neuland-outline-docs
description: Stores and updates Neuland team documentation in Outline via the neuland-outline MCP. Writes clear, professional German prose without version numbers or excessive technical detail. Use when the user asks to document something in Outline, capture architecture or workflow knowledge, or when a session produces durable docs worth persisting. Always discover placement and get explicit user approval before writing.
---

# Neuland Outline Documentation

Persist relevant documentation to [Outline](https://outline.neuland.ing) through the project's MCP server. **Never create or update Outline documents without explicit user approval.**

## When to offer documentation

Offer to store docs when a session produces knowledge that outlives the chat:

- Architecture decisions, feature design notes, or migration plans
- Setup guides, runbooks, or troubleshooting steps
- Workflow or tooling documentation for the Neuland Next app
- Meeting summaries or discovery notes (when the user wants them recorded)

Skip ephemeral chat answers, code-only changes already covered by PRs/commits, or content the user did not ask to document.

## MCP discovery (always first)

1. Read tool schemas under the Outline MCP folder before calling tools.
2. **Configured server key** (`.cursor/mcp.json`): `neuland-outline`
3. **`CallMcpTool` server parameter** in this repo: `project-0-neuland.app-native-neuland-outline`
4. If calls fail with auth errors, tell the user to connect OAuth in **Cursor Settings → MCP** and retry.

### Tools to use

| Goal | Tool |
|------|------|
| Find collections | `list_collections` |
| Browse a collection's tree | `list_collection_documents` |
| Search existing docs | `list_documents` (with `query` and/or `collectionId`) |
| Create new doc | `create_document` |
| Update existing doc | `update_document` (prefer `editMode: "patch"`) |
| Read a doc | `fetch` |

## Where to place app documentation

Default target for **Neuland Next / neuland.app-native** content:

| Item | Value |
|------|-------|
| Collection | **Projekte** |
| Collection ID | `e4bd5bfe-56f1-41cd-be97-16d6fe927e20` |
| Collection URL | https://outline.neuland.ing/collection/projekte-X5mkT7Mynb |
| Parent folder | **Neuland Next** |
| Parent document ID | `cb8cef85-81b2-4b13-8be7-ecfc5940e2e5` |
| Parent URL | https://outline.neuland.ing/doc/neuland-next-i3UbTFCp4B |

**Do not** use the separate **Neuland App** collection — that is an internal team handbook (meetings, onboarding), not project technical docs.

Re-verify IDs with `list_collection_documents` on the Projekte collection if placement fails.

### Neuland Next structure (placement guide)

Re-verify with `list_collection_documents` on the Projekte collection. Nest new pages under the matching **section**, not directly under Neuland Next.

| Section | Document ID | Use for |
|---------|-------------|---------|
| Überblick | `c54d0cb5-0eba-4c91-96cd-254862ce7061` | Einstieg, Links (direkt unter Neuland Next) |
| **Entwicklung** | `cc1c2754-74b2-4504-a203-06928ffe8bca` | Workflow, Dev Client, Tests, Patches |
| **Architektur** | `17db90d0-558c-406c-882e-5a930604835c` | Tech Stack, Feature Flags |
| **Schnittstellen & Features** | `bb5a9137-1aaf-438d-b626-947728c5e07c` | THI-API, Mitgliedsausweis, Campus-Karte, NDA |
| **Release & Betrieb** | `3fcbd9a6-3571-4e2f-a1a2-aee195295fa3` | Stores, Analytics, Kosten |
| **Rechtliches & Compliance** | `ae738e7f-1f39-4405-817e-686cdc800c64` | Meldepflichten, THI-Korrespondenz |

**Placement rules**

1. Run `list_documents` with `query` + `collectionId` (Projekte) — **update** an existing page instead of duplicating.
2. New topics: `parentDocumentId` = passende Sektion (z. B. Entwicklung), nicht die Neuland-Next-Rootseite.
3. Other Neuland projects (Kubernetes, Campus Life Events, …) live as siblings in Projekte — only use those when the doc is not app-specific.

## Workflow (mandatory)

```
- [ ] 1. Draft content (title + markdown body)
- [ ] 2. Discover MCP tools + verify Projekte → Neuland Next tree
- [ ] 3. Search for existing related documents
- [ ] 4. Propose placement to user (see template below)
- [ ] 5. Wait for explicit approval
- [ ] 6. create_document or update_document
- [ ] 7. Return the Outline URL to the user
```

### Step 4 — proposal template

Present this before any write:

```markdown
## Outline doc proposal

**Action:** create | update (patch | append)
**Title:** …
**Placement:** Projekte → Neuland Next [→ sibling if nested]
**parentDocumentId:** cb8cef85-81b2-4b13-8be7-ecfc5940e2e5 (or sibling ID)
**Summary:** 1–2 sentences on what will be stored
**Existing doc:** none | [title](url) — reason to update vs create

Proceed with publishing to Outline?
```

Use `AskQuestion` or a direct question — user must clearly approve.

### Step 6 — writing rules

**Create** (`create_document`):

- `title` — required; do not repeat as H1 in body
- `text` — markdown; start with body text or `##` heading, **never `#` (H1)**
- `parentDocumentId` — Neuland Next folder ID (preferred) or a specific sibling
- `collectionId` — only if not using `parentDocumentId`; Projekte ID otherwise
- `publish: true` only after user approval (default is fine once approved)

**Update** (`update_document`):

- Prefer `editMode: "patch"` with exact `findText` copied from existing content
- Use `append` for additive sections; avoid `replace` unless replacing the whole doc is intentional
- Fetch/read the doc first when patching

**Mentions:** `@[Display Name](mention://user/userId)` — resolve IDs via `list_users`.

## Schreibstil (Content quality)

**Sprache:** Schreibe auf **Deutsch** — Titel und Fließtext. Nur wenn der Nutzer ausdrücklich Englisch will oder die bestehende Seite durchgängig englisch ist, abweichen.

**Ton:** Klar, verständlich und professionell — für Vereinsmitglieder und Mitentwickler, nicht für ein Modell-Log. Vollständige Sätze, sinnvolle Zwischenüberschriften (`##`, `###`).

**Weniger Technik-Noise:**

- Keine Versionsnummern (z. B. `Expo SDK 54`, `React 19.1`) — verweist stattdessen auf Repo, `package.json` oder die Seite Tech Stack
- Keine langen Dependency-Listen, Config-Snippets oder Copy-Paste aus `AGENTS.md`
- Keine internen Pfade, Dateinamen oder API-Endpunkte, wenn ein Satz das Konzept reicht
- Fokus auf **Was**, **Warum** und **Wie im Alltag** — nicht auf Implementierungsdetails, die sich schnell veralten

**Stattdessen:**

- Kurze Einleitung: Worum geht es, für wen ist die Seite?
- Konkrete Schritte oder Entscheidungen in verständlicher Sprache
- Links zu GitHub, Outline-Schwesterseiten oder öffentlichen Docs für Details
- Beim Aktualisieren: Stil und Sprache der bestehenden Seite beibehalten

**Sicherheit:** Keine Secrets, Credentials, Tokens oder personenbezogene Daten.

**Technische Korrektheit:** Inhalt muss stimmen, aber lesbar bleiben — `AGENTS.md` als Quelle nutzen, nicht als Vorlage zum Abwandeln.

## Additional reference

Static IDs and the full document tree: [reference.md](reference.md)
