# Neuland Outline — reference

## MCP

| Field | Value |
|-------|-------|
| Workspace URL | https://outline.neuland.ing |
| MCP endpoint | https://outline.neuland.ing/mcp |
| Config key (`.cursor/mcp.json`) | `neuland-outline` |
| `CallMcpTool` server (this repo) | `project-0-neuland.app-native-neuland-outline` |

## Collections (snapshot)

Re-fetch with `list_collections` if this list is stale.

| Name | ID | Notes |
|------|-----|-------|
| **Projekte** | `e4bd5bfe-56f1-41cd-be97-16d6fe927e20` | **Default for Neuland Next app docs** |
| Neuland App | `d4ba97c1-28c8-4679-98ec-ba68359c362f` | Internal team handbook — not app tech docs |
| Organisation | `36b8855a-f0d0-4ed5-89cf-36d464e7963f` | Verein Organisation |
| Events | `628603a5-db12-4f68-9465-6adacd407113` | Event Ressort |
| Design & PR | `cc89dc2f-b84e-4e67-9938-d70a13e178b8` | Design Ressort |
| HR | `3c63ede6-3971-45ff-bc07-1924b4123b24` | HR Ressort |
| Finanzen | `e8484436-25c3-4eee-9547-3611323e3d26` | Finanzen Ressort |
| Vorstand | `9aeeac47-f8e8-4390-9f9c-095d30f3df80` | Vorstand |
| Willkommen | `33e5e4d5-49a7-40a5-aa59-c45c72a1529e` | Public onboarding |
| Sonstiges | `150351df-4e64-406a-a602-08699e8cbf0e` | Misc (read_write) |

## Projekte → Neuland Next document tree

**Root:** `cb8cef85-81b2-4b13-8be7-ecfc5940e2e5` — https://outline.neuland.ing/doc/neuland-next-i3UbTFCp4B

## Outline markdown constraints

- Title is a separate field — **no `#` H1 in document body**
- `@mentions`: `@[Name](mention://user/<userId>)`
- Attachments: use `fetch` with `resource: "attachment"`

## Schreibstil (Kurzfassung)

- **Sprache:** Deutsch (Standard)
- **Ton:** klar, verständlich, professionell
- **Vermeiden:** Versionsnummern, lange Code-/Config-Blöcke, Dependency-Listen
- **Bevorzugen:** Konzept, Zweck, Ablauf; Verweise auf Repo oder Tech Stack für Details
