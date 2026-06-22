# AGENTS.md

This file provides guidance for AI agents (Cursor, Claude, Codex, GitHub Copilot, etc.) working on
**Neuland Next** — the unofficial student app for Technische Hochschule Ingolstadt (THI),
maintained by [Neuland Ingolstadt e.V.](https://neuland-ingolstadt.de).

Read this file before making changes. It captures the conventions and pitfalls that are not
obvious from the code alone.

---

## Project Overview

Neuland Next is a cross-platform student companion app for **iOS, Android, and Web**, built from a
single React Native codebase. It is a privacy-first, open-source project. No personal data is
stored on our servers — credentials live in the OS keychain (mobile) or encrypted IndexedDB (web).

**Core features**: timetable, exams, grades, cafeteria menus, campus map, library code,
THI news, calendar, university sports, campus life events, quick links.

**Audience**: students and staff of THI. UI is bilingual (German / English).

---

## Tech Stack

| Area              | Tech                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| Runtime           | React Native `0.81.5`, React `19.1`, Expo SDK `54`                         |
| Language          | TypeScript `5.9` (strict mode)                                             |
| Package manager   | **Bun** (`bun.lock`) — use Bun for installs and script execution           |
| Routing           | **expo-router 6** (file-based, typed routes) — *not* React Navigation directly |
| Server state      | TanStack React Query 5 (persisted via MMKV)                                |
| Client state      | Zustand 5 (persisted via MMKV) + a few React Contexts                      |
| Storage           | `react-native-mmkv` (settings/cache), `expo-secure-store` (mobile creds), `idb` + WebCrypto (web creds) |
| Styling           | **`react-native-unistyles` 2.43** (legacy) + **Uniwind** / Tailwind CSS v4 (migration in progress) — see [Styling](#styling) |
| Lint / format     | **Biome 2.2.6** (tabs, single quotes, no semis, no trailing commas)        |
| Testing           | **Bun's built-in test runner** (`bun:test`) — no Jest                      |
| API               | Native `fetch` + GraphQL via `graphql-codegen` — *not* Axios               |
| i18n              | `i18next` + `react-i18next`, locales `de` and `en`                         |
| Analytics         | `@aptabase/react-native` — privacy-first, opt-in, self-hosted at `analytics.neuland.app` |
| Maps              | `@maplibre/maplibre-react-native` (native) + `maplibre-gl` / `@vis.gl/react-maplibre` (web) |
| Toasts / dialogs  | `burnt` for toasts / inline alerts (`Toaster` registered globally in `provider.tsx`) |
| Tabs / sheets     | Expo Router native tabs (iOS), `@bottom-tabs/react-navigation` (Android), Expo Router tabs (web), `@gorhom/bottom-sheet` + `@th3rdwave/react-navigation-bottom-sheet` |
| Dev client        | `expo-dev-client` — the app does **not** run in Expo Go                    |
| Compiler          | React Compiler is **enabled** (`reactCompiler: true` in `app.config.json`) |

---

## Commands

Run project scripts through Bun. The most relevant ones:

```bash
bun install                  # install dependencies (use --frozen-lockfile in CI)
bun licences                 # generate src/data/licenses.json once on fresh clones (generated, gitignored)

bun prebuild:ios             # generate ios/ from Expo config (required on fresh clone)
bun dev                      # start Expo dev server (with EXPO_USE_FAST_RESOLVER=1)
bun ios                      # run on a connected iOS device
bun android                  # run on a connected Android device
bun web                      # run web build on port 3000

bun lint                     # Biome check (read-only)
bun fmt                      # Biome check --fix (safe auto-fixes)
bun fmt:unsafe               # Biome check --fix --unsafe (use sparingly)
bun tsc --noEmit             # TypeScript check (matches CI)
bun i18n:check               # verify de/en locale files are complete and catch undefined keys (matches CI)

bun test                     # run all unit tests
bun test src/utils/tests/timetable-utils.test.ts   # run a single test file

bun codegen                  # regenerate GraphQL types from src/api/**/*.ts
bun pkgs                     # `expo install --check` for SDK-compatible deps
bun uniwind:types            # regenerate src/uniwind-types.d.ts after global.css changes
```

Release / tooling scripts (rarely needed during day-to-day dev — usually CI or a release
maintainer runs these):

```bash
bun start                    # production-like web preview (no dev tools, port 3000)
bun build:android            # local EAS build for Android
bun build:ios                # prebuild + xcodebuild archive for iOS
bun ship:ios                 # build + export + altool upload to App Store Connect
bun build:all                # iOS + Android sequentially
bun licences                 # regenerate src/data/licenses.json (generated, gitignored; never commit)
bun changelog                # regenerate CHANGELOG.md via git-cliff
bun atlas                    # Expo Atlas bundle analysis
```

CI runs `bun tsc --noEmit`, `bun biome ci .`, `bun i18n:check`, and `bun test --ci` on every PR.
Always make sure these pass locally before pushing.
PR titles are linted by `.github/workflows/pr-title.yml`; use a semantic title such as
`fix: handle guest login`, with a lowercase subject and no trailing period.

Do not introduce `package-lock.json`, `yarn.lock`, or a second package-manager workflow.
Some release / tooling scripts may invoke npm-ecosystem CLIs internally (for example
`npx expo export` or `npm-license-crawler`); keep calling them through `bun <script>`
unless you are explicitly updating the script itself.

---

## Repository Layout

```
src/
├── __generated__/        # GraphQL codegen output — NEVER edit by hand
├── api/                  # API clients (fetch + GraphQL)
│   ├── anonymous-api.ts        # THI REST API, no auth
│   ├── authenticated-api.ts    # THI REST API, with session
│   ├── neuland-api.ts          # Neuland GraphQL + Campus Life REST
│   ├── thi-session-handler.ts  # Session lifecycle
│   └── gql-documents.ts        # GraphQL query strings
├── app/                  # expo-router file-based routes
│   ├── _layout.tsx             # Root <Stack> with all screen registrations
│   ├── (tabs)/                 # Bottom-tab routes (index, timetable, food, map, settings)
│   └── (screens)/              # Stack-pushed screens (about, grades, profile, ...)
├── assets/               # Images, fonts, app icons, splash
├── components/           # Reusable UI grouped by feature
│   ├── Cards/                  # Dashboard cards
│   ├── Universal/              # Cross-feature primitives (Icon, FormList, …)
│   ├── Layout/                 # Navigators (native-bottom-tabs.tsx, bottom-sheet.tsx, tab-bar.tsx)
│   ├── Timetable/, Food/, Map/, Settings/, Member/, Calendar/, …
│   ├── contexts.ts             # React Contexts (UserKind, Dashboard)
│   └── provider.tsx            # Global Provider tree
├── contexts/             # Hook implementations behind the contexts above
├── data/                 # Static JSON (allergens, calendar, changelog, constants)
├── hooks/                # Reusable hooks AND Zustand stores (use*Store)
├── global.css            # Uniwind / Tailwind entry (theme tokens, scanned from src/)
├── localization/         # i18next setup + de/ + en/ JSON namespaces
├── styles/               # Unistyles registry, themes, breakpoints (legacy source of truth for tokens)
├── types/                # Shared TS types (THI API, GraphQL, components, ...)
└── utils/                # Pure functions, separated by domain (date, food, map, ...)
    └── tests/                  # *.test.ts — colocated with the utility being tested
config/                   # Build tooling (codegen, cliff, expo plugins, fonts, nginx)
metro.config.js           # Expo Metro config with withUniwindConfig (outermost wrapper)
patches/                  # Bun patch-package patches
android/                  # Native Android project (managed by Expo prebuild)
.github/                  # CI workflows, issue/PR templates, CODEOWNERS
```

The `ios/` directory is **gitignored** and generated locally via `bun prebuild:ios`. Xcode Cloud
needs `ios/ci_scripts/ci_post_clone.sh`; that path is a **symlink** to
`config/ios-artifacts/ci_scripts/` (recreated after prebuild by `withCiScriptsSymlink`). Other
iOS-only files that must survive prebuild (export options, TestFlight notes, …) also live under
`config/ios-artifacts/` and are copied by `withIosCiArtifacts`.

Path aliases (defined in `tsconfig.json`):

- `@/*` → `./src/*` — always use this for source imports, never deep relative paths
  like `../../../utils/storage`.

Generated and binary files:

- `src/__generated__/` is GraphQL output. Never edit it directly; run `bun codegen`.
- `src/data/licenses.json` is generated by `bun licences`, gitignored, and must not be committed.
  Run `bun licences` after a fresh clone before running `bun tsc --noEmit` locally.
- `src/uniwind-types.d.ts` is generated by `bun uniwind:types` (or Metro on dev start). Do not edit by hand.
- `CHANGELOG.md` is generated by `bun changelog`.
- Image, font, and SVG assets are tracked through Git LFS (`.gitattributes`). Make sure
  LFS assets are present before assuming an asset is missing or corrupt.

---

## Architecture Notes

### Routing (expo-router)

- Every file under `src/app/**` is a route. Files starting with `_` are layouts.
- Groups are wrapped in parentheses: `(tabs)` and `(screens)`. They do **not** appear in the URL.
- Register *every* new screen file in `src/app/_layout.tsx`'s `<Stack>` so it gets the right
  title, header style, and presentation. Otherwise the platform default leaks through.
- Use the typed `router` (`import { router } from 'expo-router'`) — typed routes are enabled.
- Web builds use `output: 'single'` (SPA). Some screens have a `*.web.tsx` variant
  (e.g. `map-screen.web.tsx`) for layout differences.

#### Native Tabs

- The `(tabs)` group is platform-specific. Always check the file that matches the
  platform you are changing:
  - iOS / default: `src/components/Layout/tab-bar.tsx` uses
    `expo-router/unstable-native-tabs`.
  - Android: `src/components/Layout/tab-bar.android.tsx` uses the
    `@bottom-tabs/react-navigation` wrapper from
    `src/components/Layout/native-bottom-tabs.tsx`.
  - Web: `src/components/Layout/tab-bar.web.tsx` uses Expo Router's regular JS tabs.
- When adding or removing a tab, keep all three implementations in sync unless the UX is
  intentionally platform-specific. Native tab options differ between these runtimes; copy
  the closest existing tab instead of mixing option shapes.

#### Bottom sheet routes

- `@gorhom/bottom-sheet` powers ad-hoc bottom sheets within a screen
  (`<BottomSheetModal>`). `BottomSheetModalProvider` is registered in
  `src/components/provider.tsx`.
- For sheets that should be a *route* (back button, deep-linkable, etc.), use the
  `BottomSheet` navigator from `src/components/Layout/bottom-sheet.tsx` (built on
  `@th3rdwave/react-navigation-bottom-sheet`). Register the screen in `_layout.tsx`
  exactly like a stack screen.

### State management

- **Server state** lives in React Query. Always wrap fetches with `useQuery` /
  `useMutation`. Use a stable, descriptive `queryKey` (e.g. `['announcements']`,
  `['timetable', date]`). Set `staleTime` and `gcTime` deliberately — the client is
  persisted across launches via `PersistQueryClientProvider`.
- **Persisted client state** lives in Zustand stores in `src/hooks/use*Store.ts`. They use
  `persist` + `zustandStorage` (MMKV-backed). Pattern: keep an `initialState`, expose a
  `reset()` action, and select with shallow selectors:
  `usePreferencesStore((s) => s.theme)`.
- **Lightweight per-key state** can use `useMMKVString` / `useMMKVBoolean` directly
  (see `src/contexts/userKind.ts` for an example).
- **Global mutable singletons** (`UserKindContext`, `DashboardContext`) are created in
  `src/components/contexts.ts` and provided by `src/components/provider.tsx`. Read them
  with `React.use(Context)`.
- **Auth / session stores** worth knowing about:
  - `useSessionStore` — THI session lifecycle and the `analyticsInitialized` flag
    (see "Analytics" below). Not persisted; reset on cold start.
  - `useMemberStore` — Neuland member identity (OIDC via `expo-auth-session`).
    Holds `idToken`, decoded `MemberInfo` (email, groups, …) and is persisted via
    `zustandStorage`. Tokens themselves go through `saveSecureAsync` —
    never put raw credentials into the persisted store.
  - `useFlowStore` — onboarding state, including `analyticsAllowed` (the user's
    opt-in to Aptabase). Always check this before assuming analytics are running.

### API layer

- Three clients live in `src/api/`. Pick one:
  - `AnonymousAPIClient` — public THI REST endpoints, no login.
  - `AuthenticatedAPIClient` — extends the anonymous client, wraps requests with
    `callWithSession`, throws `NoSessionError` / `UnavailableSessionError` /
    `APIError` with a status code. Always handle these in the caller.
  - `NeulandAPI` — our own GraphQL endpoint (Queries for Food Data and Announcements, Mutation to create Room Reports) plus Campus Life REST and asset endpoints.
    GraphQL queries live in `src/api/gql-documents.ts`, the schema is mirrored in
    `src/__generated__/schema.graphql`, and types are generated by `bun codegen`.
    The `@0no-co/graphqlsp` TS plugin (configured in `tsconfig.json`) gives inline
    GraphQL validation in the editor.
- Components must **not** call `fetch` directly. Add a method to the relevant client and
  consume it through React Query.
- Endpoints are configured via `EXPO_PUBLIC_*` env vars (see `.env.local.example`).
  Treat them as read-only at runtime.

### Feature flags (Flipt)

- Flags are defined in the [`neuland-ingolstadt/flags`](https://github.com/neuland-ingolstadt/flags)
  repo under `production/neuland-app/features.yaml`. Flipt polls that repo; server-side
  changes land within ~30s without a release. The app caches evaluations for **5 minutes**
  (`FEATURE_FLAG_STALE_TIME_MS` in `src/hooks/useFeatureFlag.ts`), with refetch on
  reconnect and window focus.
- Client setup uses `@flipt-io/flipt` directly (`src/lib/flipt.ts`,
  `src/lib/feature-flags.ts`) so evaluations work on iOS, Android, and web. The Flipt client is warmed up in `src/components/provider.tsx`.
- **Usage in components** — prefer the React Query hook:

  Register flags in `FeatureFlagKeys` before use:

  ```typescript
  export const FeatureFlagKeys = {
    myFlag: 'my-flag',
  } as const satisfies Record<string, string>
  ```

  ```tsx
  import { useFeatureFlag } from '@/hooks'
  import { FeatureFlagKeys } from '@/lib/feature-flags'

  const { data: enabled = false } = useFeatureFlag(FeatureFlagKeys.myFlag)
  ```

  Mirror each entry in `production/neuland-app/features.yaml`. For async checks
  outside React, call `evaluateBooleanFlag` from `@/lib/feature-flags`.
- **Evaluation context** sent to Flipt on every request:

  | Attribute      | Source                          | Example values        |
  |----------------|---------------------------------|-----------------------|
  | `targetingKey` | fixed                           | `anonymous`           |
  | `platform`     | `getEvaluationPlatform()`       | `ios`, `android`, `web`, `web-dev`, `web-local` |
  | `appVersion`   | `expo-application`              | `1.2.3`               |
  | `userKind`     | MMKV profile (`useUserKind`)    | `guest`, `student`, `employee` |

  On web, `platform` is overridden from hostname (`dev.neuland.app` → `web-dev`,
  `web.neuland.app` → `web`, else `web-local`) — same split as announcement `WEB_DEV`.

### Styling

The app is **migrating from Unistyles to Uniwind** (Tailwind CSS v4 for React Native). Both
systems run in parallel today. Match the styling approach of the file you are editing — do not
mix `createStyleSheet` and `className` in the same component unless you are actively migrating it.

#### Uniwind (preferred for new UI and migrated screens)

Setup lives at the project root and in `src/`:

- `metro.config.js` — `withUniwindConfig` must remain the **outermost** Metro wrapper
- `src/global.css` — `@import 'tailwindcss'` + `@import 'uniwind'`, design tokens in `@theme`,
  light/dark semantic colors in `@layer theme` + `@variant`
- `src/app/_layout.tsx` — imports `@/global.css` (not the Expo entry `index` file)
- `src/hooks/useUniwindThemeSync.ts` — mirrors `usePreferencesStore` theme / accent into
  `Uniwind.setTheme` and `Uniwind.updateCSSVariables`
- `src/utils/uniwind-utils.ts` — `hairlineBorder`, `toColor` helpers for RN edge cases
- `src/uniwind-types.d.ts` — generated class-name typings (`bun uniwind:types`)

**Conventions**

- Use `className` on React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, …).
  Metro resolves them through Uniwind automatically — no extra import.
- List props: `contentContainerClassName` on `ScrollView` / `FlatList`, etc.
- Theme tokens from `global.css` map to utilities without the `--color-` / `--spacing-` prefix:
  `--color-primary` → `text-primary`, `bg-primary`; `--spacing-page` → `p-page`.
- Platform variants: `ios:`, `android:`, `web:` (e.g. `ios:rounded-[28px] android:rounded-lg`).
- Default radius on cards: `rounded-lg`, with `ios:rounded-[28px]` where BaseCard does.
- Read runtime colors in JS with `useCSSVariable('--color-primary')` from `uniwind`.
- Pass resolved styles to children that still expect `style` via `useResolveClassNames('…')`.
- Keep **inline `style`** only for: Reanimated animations, dynamic widths/heights, hairline borders
  (`hairlineBorder` from `@/utils/uniwind-utils`), per-item dynamic colors, and props that require
  `ColorValue` strings (e.g. `Divider` `color`, `EventItem` `color`).
- When adding a token used in `className`, add it to **both** `@variant light` and `@variant dark`
  in `global.css`, mirroring values from `src/styles/themes.ts`. Then run `bun uniwind:types`.
- `global.css` uses Tailwind v4 syntax — Biome has `css.parser.tailwindDirectives` enabled.

**Already migrated** (use these as references): `src/app/(screens)/version.tsx`,
`src/app/(screens)/food-preferences.tsx`, `src/app/(screens)/food/[id].tsx`,
`src/app/(screens)/room-search.tsx`, `src/app/(screens)/room-report.tsx`, `src/app/(tabs)/map.tsx`,
`src/components/Universal/form-list.tsx`, `src/components/Cards/*` (all dashboard cards),
`src/components/Food/*` (all food tab components), `src/components/Map/*` (all map components).

After changing `global.css` or `metro.config.js`, restart Metro with `bun dev -- --clear`.

Docs: https://docs.uniwind.dev

#### Unistyles (legacy — remaining screens)

- Define styles with `createStyleSheet((theme) => ({ ... }))` and consume via
  `const { styles, theme } = useStyles(stylesheet)`.
- Themes are defined in `src/styles/themes.ts` with `colors`, `margins`, and `radius`
  keys. This file remains the **canonical palette** until a token is mirrored in `global.css`.
- The active theme follows the system unless the user pinned `light` / `dark`. The
  `themeColor` (blue / green / purple) is patched into the theme at runtime in
  `provider.tsx` (Unistyles) and synced to Uniwind via `useUniwindThemeSync`.
- Plain `StyleSheet.create` is fine for static, non-themed wrappers (e.g. flex containers);
  anything color-, size-, or radius-related should go through Unistyles **or** Uniwind
  depending on whether the component is migrated.

#### Migrating a screen to Uniwind

1. Replace `createStyleSheet` / `useStyles` with `className` utilities.
2. Port any new colors/spacing/radii into `src/global.css` (keep light/dark in sync).
3. Run `bun uniwind:types`, `bun fmt`, `bun tsc --noEmit`.
4. Verify light/dark mode and accent color (blue / green / purple) in settings.


### Cross-platform

- Use `Platform.OS` (`'ios' | 'android' | 'web'`) for runtime checks.
- App is also published in the Mac App Store (powered by the iPad Version)
- File-extension overrides are honored by Metro: `foo.ios.tsx`, `foo.web.tsx`. Use them
  for substantial divergence (e.g. `app-icon.ios.tsx`, `map-screen.web.tsx`).
- Icons go through `@/components/Universal/Icon` (`PlatformIcon`), which renders SF
  Symbols on iOS, Material Symbols (custom font) on Android, and Lucide on Web. Always
  pass all three variants when adding a new icon.
- For large, simple lists, prefer `@shopify/flash-list` (`FlashList` /
  `MasonryFlashList`) and provide `estimatedItemSize`. `FlatList` / `SectionList` are
  acceptable when grouping, APIs, or the surrounding code make them the better fit.
- **Maps are dual-runtime**: native uses `@maplibre/maplibre-react-native`, web uses
  `maplibre-gl` + `@vis.gl/react-maplibre`. The two render trees are completely
  different, so most map screens have a `*.web.tsx` counterpart (e.g.
  `map-screen.web.tsx`). Keep their UX in sync when changing one side.
- Toasts and inline alerts use **`burnt`** (`toast(...)` / `alert(...)`) so iOS,
  Android, and web behave consistently. Existing blocking native confirmation dialogs may
  use `Alert.alert`; do not replace or add them unless a modal confirmation is actually
  needed. Never use `ToastAndroid`.

### Storage

- `appStorage` (MMKV, id `user-settings-storage`) — Zustand persistence.
- `storage` (MMKV, id `query-client-storage`) — React Query persistence.
- `saveSecureAsync` / `loadSecureAsync` / `deleteSecure` from `@/utils/storage` —
  credentials. They transparently use `expo-secure-store` on native and the encrypted
  IndexedDB store on web. Always go through these helpers; never touch
  `SecureStore` / `localStorage` directly.

### Internationalization

- Two locales, `de` and `en`, in `src/localization/{de,en}/*.json`.
- Namespaces are split by area: `common`, `navigation`, `settings`, `food`, `flow`,
  `timetable`, `member`, `accessibility`, `api`, plus `ios.json` for iOS Info.plist
  strings.
- Add new strings to **both** `de` and `en`, in the namespace that matches the screen.
  Run `bun i18n:check` to catch missing, mismatched, or undefined keys (`en` is the source locale).
- Consume with `const { t } = useTranslation('navigation')` or
  `useTranslation(['navigation', 'common'])`. Reference cross-namespace keys with
  `t('foo.bar', { ns: 'common' })`.
- The active language is auto-detected via `expo-localization` and persisted in
  `usePreferencesStore` for users who override it (see `_layout.tsx`).

### Analytics (Aptabase)

We track **anonymous, opt-in usage analytics** via `@aptabase/react-native`, hosted on
our own infrastructure (`https://analytics.neuland.app`). This is the project's only
telemetry channel — there is no Sentry, PostHog, or Firebase. Treat analytics as a
first-class concern when adding user-facing features.

**Lifecycle**

- `Aptabase.init(...)` is called from `src/app/(tabs)/_layout.tsx` once the user has
  accepted analytics in onboarding (`useFlowStore.analyticsAllowed === true`). It
  flips `useSessionStore.analyticsInitialized` to `true`.
- If the user later opts out, `Aptabase.dispose()` is called from the same effect.
- The Aptabase write key comes from `EXPO_PUBLIC_APTABASE_KEY`. If it is missing
  (e.g. in a fresh local clone), analytics are silently disabled.

**Tracking events**

- Import directly: `import { trackEvent } from '@aptabase/react-native'`.
- **Always gate emission behind the user's consent**: in components, call `trackEvent`
  only inside an event handler — they're cheap no-ops when analytics aren't
  initialized. In hooks/effects that fire on mount, gate explicitly:

  ```ts
  const analyticsInitialized = useSessionStore((s) => s.analyticsInitialized)
  useEffect(() => {
    if (!analyticsInitialized) return
    trackEvent('MyFeature', { variant: 'A' })
  }, [analyticsInitialized])
  ```

- Event names are **PascalCase, short, action- or domain-shaped**:
  `Theme`, `Route`, `Share`, `Room`, `Quicklink`, `Dashboard`, `Language`,
  `TimetableMode`, `RoomNotFound`, `Unmatched`. Re-use an existing name when the
  semantics match — duplicates with slightly different spellings make the dashboard
  unusable.
- Properties must be **flat, primitive, and PII-free**: enums (`{ theme: 'dark' }`),
  origins (`{ origin: 'MapClick' }`), counters, language codes, room numbers — never
  emails, names, matrikel numbers, GPS coordinates, full URLs, or free-form input.
- Preference / persisted-state changes are tracked centrally in
  `usePreferenceTracking` (`src/hooks/usePreferenceTracking.ts`). When you add a new
  persisted preference, add a corresponding `useEffect` there instead of sprinkling
  `trackEvent` across the codebase.

**When to add tracking**

Add a `trackEvent` (or extend `usePreferenceTracking`) whenever a change introduces:

- A new top-level screen or tab (gets `Route` automatically via the segment effect — no
  manual call needed unless you want sub-page granularity, e.g. tabs inside a screen).
- A new user-facing setting or toggle that influences other behaviour.
- A share / export / open-external action (use the `Share` event with a `type` prop).
- A new entry-point into an existing flow (use an existing event with a new `origin`).
- A "not found" / fallback path users can hit (helps spot broken links / missing data).

If you're not sure, lean toward tracking — anonymous aggregate counts are how we
prioritise work — but keep the event surface tight and re-use existing names.

---

## Code Style

Biome enforces almost everything. The non-obvious rules:

- **Tabs** for indentation, **single quotes**, **no semicolons** (`asNeeded`), **no
  trailing commas**.
- Imports are sorted automatically by Biome (`assist.actions.source.organizeImports`).
- `noUnusedImports` and `noUnusedVariables` are **errors** — clean them up before
  committing.
- `useSelfClosingElements`, `useNumberNamespace`, `noInferrableTypes`, `noUselessElse`
  are enforced.
- Functional components only. Return type `React.JSX.Element` (not `JSX.Element`,
  not `FC<…>`).
- Component prop types are `interface` named `<Component>Props`.
- File naming: **kebab-case** for files (`timetable-list.tsx`, `home-header-right.tsx`).
  PascalCase is accepted for legacy `Universal/` primitives (`Icon.tsx`, `Badge.tsx`,
  `Divider.tsx`, `Dropdown.tsx`) — match the surrounding folder.
- Hooks live in `src/hooks/` and are named `use*`.
- Don't add comments that just narrate the code. Only comment non-obvious intent or
  workarounds (the codebase has examples of `// biome-ignore … TODO` for known
  trade-offs — keep them rare and labelled).

---

## Testing

- Tests live in `src/utils/tests/` and use `bun:test`:
  ```ts
  import { describe, expect, it, mock } from 'bun:test'
  ```
- Only **pure utilities** are unit-tested today. React Native modules, `expo-localization`,
  and `react-i18next` are mocked via `mock.module(...)` at the top of each file
  (see `timetable-utils.test.ts` for the canonical pattern).
- When adding a new pure utility, add tests next to the existing ones. Don't pull in Jest,
  Vitest, or Testing Library.

---

## Common Tasks

### Add a new screen

1. Create `src/app/(screens)/my-screen.tsx`. Default-export a component that returns
   `React.JSX.Element`.
2. Register it in `src/app/_layout.tsx` inside the `<Stack>`, copying the closest
   existing entry. Pick the right `presentation` and `headerShown` for the platform
   (use `transparentHeaderStyle` / `presentationMode` helpers if appropriate).
3. Add navigation titles to `src/localization/de/navigation.json` and `en/navigation.json`.
4. Navigate via `router.navigate('/my-screen')` (typed) from the calling screen.

### Add a new API endpoint

1. Add a method to the matching client in `src/api/` (REST → THI clients,
   GraphQL → `NeulandAPI`). For GraphQL, add the document in `src/api/gql-documents.ts`
   and run `bun codegen` to regenerate types.
2. Consume it from a component or hook through `useQuery` / `useMutation`. Pick a
   stable `queryKey`, an explicit `staleTime`, and a `gcTime` that fits how often the
   data changes.
3. Handle the typed errors (`APIError`, `NoSessionError`, `UnavailableSessionError`,
   plus the strings in `@/utils/api-utils` like `networkError`, `guestError`).

### Add a Zustand store

1. Create `src/hooks/useMyStore.ts` and follow the pattern in `usePreferencesStore.ts`:
   define an `initialState`, expose a `reset()` action, wrap with
   `persist(..., { name: 'my-store', storage: createJSONStorage(() => zustandStorage) })`.
2. Re-export from `src/hooks/index.ts` if it's used widely.

### Add a translatable string

1. Add the key to **both** `src/localization/de/<namespace>.json` and `en/<namespace>.json`,
   keeping JSON keys identical and structures in sync.
2. Use `useTranslation(['<namespace>'])` and call `t('your.key')`.
3. Run `bun i18n:check` before pushing.

### Add a new icon

Always provide `ios`, `android`, and `web` variants:

```tsx
<PlatformIcon
  ios={{ name: 'square.and.arrow.up', size: 22 }}
  android={{ name: 'share', size: 22 }}
  web={{ name: 'Share2', size: 22 }}
/>
```

iOS uses SF Symbols (or `fallback: true` to render a Material Community Icon),
Android uses Material Symbols (custom font), Web uses `lucide-react-native`.

### Track an Aptabase event

1. Decide whether the event belongs in `usePreferenceTracking` (any persisted user
   preference) or directly in the component / util that triggers it (one-shot
   actions like share / open / search).
2. Re-use an existing event name if the action matches (`Share`, `Route`, `Room`,
   …); otherwise pick a short PascalCase name that won't collide.
3. In effects, gate on `useSessionStore((s) => s.analyticsInitialized)` so we don't
   emit before consent. In handlers, just call `trackEvent` — it is a no-op when
   uninitialized.
4. Keep properties flat, primitive, and PII-free (see the Analytics section above).
5. Verify locally by setting `EXPO_PUBLIC_APTABASE_KEY` in `.env.local` and watching
   the dev console for `Initialized analytics` — events appear in the Aptabase
   dashboard within a few seconds.

---

## Things to Avoid

- **Don't introduce a new package manager workflow.** Use Bun for installs, lockfile
  updates, and script execution; do not add npm/yarn lockfiles.
- **Don't add Axios, Jest, Redux, or styled-components.** The stack is
  fetch + React Query + Zustand + Uniwind/Unistyles + Biome. Match it.
- **Don't add NativeWind** or a second Tailwind integration — use **Uniwind** only.
- **Don't `fetch` from components.** Always go through an API client + React Query.
- **Don't read or write `localStorage` / `SecureStore` directly.** Use the helpers in
  `@/utils/storage`.
- **Don't hard-code colors or pixel values.** Pull them from Uniwind tokens (`global.css`)
  or the Unistyles theme (`src/styles/themes.ts`) depending on which system the component uses.
- **Don't add new top-level folders** under `src/` without a strong reason — match the
  existing layout.
- **Don't bump dependencies casually.** Native modules (`react-native-mmkv`, MapLibre,
  `react-native-bottom-tabs`, Reanimated, etc.) are pinned because of native build
  compatibility. Run `bun pkgs` (which calls `expo install --check`) when in doubt.
- **Don't edit generated files by hand.** Use `bun codegen` for `src/__generated__/`,
  `bun licences` for `src/data/licenses.json`, and `bun changelog` for `CHANGELOG.md`.
- **Don't commit `src/data/licenses.json`.** It is generated on demand in CI/build pipelines.
- **Don't commit the `ios/` folder** (only the `ios/ci_scripts` symlink for Xcode Cloud). It is
  gitignored; run `bun prebuild:ios` and change `app.config.json`, config plugins, or
  `config/ios-artifacts/` instead. Edit `config/ios-artifacts/ci_scripts/ci_post_clone.sh` for
  Xcode Cloud setup.
- **Don't disable Biome rules globally.** Inline `// biome-ignore` with a reason if
  truly necessary.
- **Don't commit secrets** (`.env.local`, `service.json`, `credentials/`,
  `*.jks`, `*.ipa`). They are in `.gitignore` for a reason.
- **Don't send PII through `trackEvent`.** Aptabase is anonymous by design — names,
  emails, matrikel numbers, raw search queries, GPS coordinates and full URLs are
  off-limits. Stick to enums, counters, and short identifiers.
- **Don't use React Native's `ToastAndroid`.** Use `burnt`'s `toast(...)` /
  `alert(...)` for toast-like UI. Keep existing `Alert.alert` confirmation dialogs when
  they match the surrounding native flow.
- **Don't assume tabs have one shared implementation.** Update the iOS/default,
  Android, and web tab layouts together unless a platform-specific difference is
  intentional.

---

## When in Doubt

- Match the closest existing example. Most patterns repeat — there's almost always a
  similar screen, store, hook, or component to copy from.
- If a change touches `app.config.json`, `eas.json`, `tsconfig.json`, `babel.config.js`,
  or anything in `.github/` or `config/`, expect review from the CODEOWNERS listed in
  `.github/CODEOWNERS`.
- Prefer changing Expo config / plugins over editing `ios/` or `android/` directly. Touch
  native projects only when the required change cannot be expressed in config.
- For larger architectural changes, open a draft PR early and link the related issue.
