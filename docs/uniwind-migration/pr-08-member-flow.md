# PR 8 — Member area and login/onboarding flow

## Goal

Migrate Neuland member UI and the login/onboarding flow. **Depends on PR 2–3** (forms, buttons).

## Files

### Member (`src/components/Member/`) — ~10 files + `styles.ts`

- `logged-in-view.tsx`, `logged-out-view.tsx`, `id-card.tsx`
- `benefit-card.tsx`, `member-area-button.tsx`, `office-presence-section.tsx`
- `qr-code-modal.tsx`, `security-warning-modal.tsx`
- Delete [`styles.ts`](../../src/components/Member/styles.ts) after inlining

### Flow (`src/components/Flow/`) — ~9 styled files

- `login.tsx`, `login.web.tsx`, `login-animated-text.tsx`
- `onboarding-box.tsx`, `whats-new-box.tsx`, `home-bottom-sheet.tsx`

**Out of scope:** `svgs/` (Illustrator `className="cls-*"`), `context-menu.web.tsx` passthrough

### Screens (~5)

- [`onboarding.tsx`](../../src/app/(screens)/onboarding.tsx)
- [`member/office-toggle.tsx`](../../src/app/(screens)/member/office-toggle.tsx)
- Thin wrappers: `login.tsx`, `member/index.tsx` (only if they import Unistyles directly)

## Acceptance criteria

- [ ] Login flow works on web and native
- [ ] Member OIDC screens render QR modal correctly
- [ ] `Member/styles.ts` deleted

## Estimated size

~20 files, ~700 lines changed
