---
name: argent-mmkv-reset
description: >-
  Reset Neuland Next MMKV / Zustand persisted state on a connected iOS simulator
  or Android emulator via the Argent Hermes debugger (debugger-evaluate). Use when
  the user asks to clear MMKV, reset storage keys, restore the feedback survey
  banner, lock accent colors again, clear handledCampaignId, wipe app-storage
  fields, or force a fresh feature-flag cache for local testing.
---

# Argent MMKV Reset (Neuland Next)

Targeted reset of **persisted Zustand + MMKV** in the running app. Prefer this over
deleting simulator files (MMKV is length-prefixed; hand-editing corrupts it).

## Prerequisites

1. Metro running (`bun dev`) and the app connected.
2. Device id from `list-devices` / known simulator UDID.
3. Read `argent-metro-debugger` if connect/evaluate fails.
4. Invoke tools via `./node_modules/.bin/argent run <tool> …` (or Argent MCP).

## Hard rules

- **Never hardcode Metro module ids** — they change every bundle. Resolve by export name.
- Prefer **store `reset()` / `setState()`** over deleting whole MMKV instances.
- Do **not** wipe all of `user-settings-storage` unless the user asks for a full wipe
  (that also clears member-store, food filters, timetable, flow, …).
- After writes: **`debugger-reload-metro`**, then re-connect and verify.
- On Android: `adb -s <serial> reverse tcp:8081 tcp:8081` before debugging.

## Known MMKV layout

| MMKV id | Zustand persist `name` | Typical fields |
| --- | --- | --- |
| `user-settings-storage` (`appStorage`) | `feedback-prompt-store` | `handledCampaignId` |
| same | `app-storage` | `accentUnlocked`, `themeColor`, theme, … |
| same | `member-store`, `flow-store`, `food-filter-storage`, `timetable-storage`, `rue-warning-store`, `service-status-store` | — |
| `query-client-storage` | React Query offline cache key `REACT_QUERY_OFFLINE_CACHE` | feature flags, API caches |

Exports live in:

- `src/hooks/useFeedbackPromptStore.ts` → `useFeedbackPromptStore`
- `src/hooks/usePreferencesStore.ts` → `usePreferencesStore`
- `src/utils/storage.ts` → `appStorage`, `zustandStorage`
- `react-native-mmkv` → `createMMKV`

## Workflow

### 1. Connect

```bash
./node_modules/.bin/argent run debugger-connect --device_id "<UDID_OR_SERIAL>" --json
```

If `not_connected`: relaunch the app / see `argent-metro-debugger`.

### 2. Resolve module ids (every session)

`require` is **undefined** on the new Hermes debugger. Use Metro `__r(id)`.

Scan for export names (widen the range if empty):

```js
(() => {
  const want = [
    'useFeedbackPromptStore',
    'usePreferencesStore',
    'appStorage',
    'createMMKV'
  ]
  const hits = {}
  for (let i = 0; i < 8000; i++) {
    let m
    try { m = __r(i) } catch { continue }
    if (!m || typeof m !== 'object') continue
    for (const k of want) {
      if (k in m && hits[k] == null) hits[k] = i
    }
  }
  return hits
})()
```

Pass that expression to `debugger-evaluate` (`--expression` / `--args`).

### 3. Apply the requested preset

Substitute the resolved ids (`FB`, `PREF`, `STOR`, `MMKV`).

#### Preset A — Feedback banner unanswered + accent locked (common)

```js
(() => {
  const { useFeedbackPromptStore } = __r(FB)
  const { usePreferencesStore } = __r(PREF)
  const { appStorage } = __r(STOR)

  const before = {
    handledCampaignId: useFeedbackPromptStore.getState().handledCampaignId,
    accentUnlocked: usePreferencesStore.getState().accentUnlocked,
    themeColor: usePreferencesStore.getState().themeColor
  }

  useFeedbackPromptStore.getState().reset()
  usePreferencesStore.setState({ accentUnlocked: false, themeColor: 'blue' })
  appStorage.remove('feedback-prompt-store')

  const raw = appStorage.getString('app-storage')
  if (raw) {
    const parsed = JSON.parse(raw)
    if (parsed?.state) {
      parsed.state.accentUnlocked = false
      parsed.state.themeColor = 'blue'
      appStorage.set('app-storage', JSON.stringify(parsed))
    }
  }

  return {
    before,
    after: {
      handledCampaignId: useFeedbackPromptStore.getState().handledCampaignId,
      accentUnlocked: usePreferencesStore.getState().accentUnlocked,
      themeColor: usePreferencesStore.getState().themeColor,
      feedbackKey: appStorage.getString('feedback-prompt-store') ?? null
    }
  }
})()
```

#### Preset B — Force local `feedback-prompt` feature flag

Only when the user needs the **banner visible** and Flipt/cache has it `false`.
Mutates React Query persist cache (local test only — not production config).

```js
(() => {
  const { createMMKV } = __r(MMKV)
  const q = createMMKV({ id: 'query-client-storage' })
  const parsed = JSON.parse(q.getString('REACT_QUERY_OFFLINE_CACHE'))
  let updated = 0
  for (const query of parsed?.clientState?.queries ?? []) {
    if (Array.isArray(query.queryKey) && query.queryKey[1] === 'feedback-prompt') {
      query.state.data = true
      query.state.dataUpdatedAt = Date.now()
      updated++
    }
  }
  q.set('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(parsed))
  return { updated }
})()
```

To force `false`, set `query.state.data = false` instead.

#### Preset C — Arbitrary Zustand store

1. Resolve the store export (e.g. `useFoodFilterStore`).
2. Prefer `store.getState().reset()` when it exists.
3. Else `setState(partial)` + mirror into `appStorage` under the persist `name`.

#### Preset D — Full `user-settings-storage` wipe

**Only if explicitly requested.** Terminates preferences, member, flow, filters, etc.

```js
(() => {
  const { createMMKV } = __r(MMKV)
  // deleteMMKV if exported; otherwise remove known persist keys via appStorage
  const { appStorage } = __r(STOR)
  for (const key of appStorage.getAllKeys()) appStorage.remove(key)
  return { cleared: true }
})()
```

Then `restart-app` (not only Metro reload) so in-memory stores die.

### 4. Reload and verify

```bash
./node_modules/.bin/argent run debugger-reload-metro --device_id "<ID>" --json
# wait ~2s, debugger-connect again, then evaluate a small read-back
```

Confirm the fields the user asked for. Report `before` → `after` briefly.

## Pitfalls

| Symptom | Fix |
| --- | --- |
| `Property 'require' doesn't exist` | Use `__r(id)`, not `require` |
| Banner still hidden after Preset A | Check feature-flag cache (Preset B) or remote Flipt |
| Values snap back after reload | Persist write missed — update `appStorage` / call `reset()` |
| Module scan returns `{}` | App not on new JS bundle; reload or raise scan limit |
| Wrong device mutated | Always pass the same `device_id` as `debugger-connect` |

## Related

- `argent-metro-debugger` — connect / evaluate / reload
- `argent-react-native-app-workflow` — Metro + run app
- Feedback UI: `src/components/Dashboard/feedback-prompt-container.tsx`
- Campaign id: `FEEDBACK_CAMPAIGN_ID` in `src/data/constants.ts`
