# Maestro end-to-end tests

The flows verify meaningful user journeys across onboarding, navigation, map, food, settings,
public content, native controls, authenticated data, member features, universal links, and Web.

## Setup

Install the project and tooling:

```bash
bun install
maestro --version
java -version # Java 17+
```

You also need:

- Xcode and a booted iOS simulator, or an Android emulator;
- a development client built from the current checkout (Expo Go is not supported);
- one running Metro server on port `8081`.

Create the local Expo environment and fill in the values provided by the Neuland development
setup:

```bash
cp .env.local.example .env.local
bun dev
```

Restart Metro after changing `.env.local`. Never commit this file, credentials, tokens, or exported
device state.

Build/install a development client when needed:

```bash
bun prebuild:ios && bun ios
bun prebuild:android && bun android
```

For Web, use a second terminal:

```bash
bun web # serves http://localhost:3000
```

Argent and the Maestro MCP are useful for inspecting devices while developing flows. The commands
below run through the Maestro CLI.

## Running

### Guest regression

```bash
bun e2e:ios       # all iOS guest flows, including app icons
bun e2e:android   # Android guest flows
bun e2e:web       # headless Web flow
```

The native runners select the booted/connected device. Select one explicitly when necessary:

```bash
MAESTRO_DEVICE_ID=emulator-5554 APP_ID=app.neuland bun e2e:android
```

The defaults are `de.neuland-ingolstadt.neuland-app` on iOS and `app.neuland` on Android. If the
device cannot reach Metro at `localhost:8081`, override `DEV_CLIENT_URL` with a device-reachable,
URL-encoded development-client URL.

### Authenticated and optional suites

```bash
bun e2e:authenticated   # persisted THI student session
bun e2e:lecture          # authenticated session plus suitable lecture data
bun e2e:member           # persisted Neuland member session; safe Wallet cancellation
bun e2e:wallet           # Wallet side effect; run only with disposable setup
bun e2e:logout           # deletes THI credentials; run last
bun e2e:map:soak         # roughly ten minutes of map movement
```

The optional scripts default to the iOS app. On Android, provide `MAESTRO_DEVICE_ID` and
`APP_ID=app.neuland` as shown above.

To run one flow while debugging:

```bash
maestro test --device <device-id> --config=.maestro/config.yaml \
  -e APP_ID=<ios-or-android-app-id> \
  -e DEV_CLIENT_URL='exp+neuland-app-native://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081' \
  .maestro/flows/map-regression.yaml
```

Universal links require a preview/release build with associated domains. Run that flow separately:

```bash
maestro test --device <device-id> --config=.maestro/config.yaml \
  -e APP_ID=<app-id> --include-tags=release-only .maestro
```

## How it works

- Guest flows use `clearState: true`, repeat onboarding, and may reset app preferences.
- Authenticated and member flows use `clearState: false` and require a session already stored on
  the same device. They never contain or read usernames/passwords from environment variables.
- `config/run-maestro-suite.ts` runs each native flow separately and targets one explicit device.
  iOS resets the simulator's XCTest service and retries failed flows once.
- Flow tags keep stateful or risky tests out of the guest suite: `student`, `seeded-data`, `member`,
  `external-side-effect`, `destructive-auth`, `release-only`, and `long-running`.
- Web runs at `http://localhost:3000` with a `1440x1000` viewport. Its checks avoid requiring a
  specific remote meal response, so API CORS failures do not turn route and interaction checks into
  false failures.

## Good to know

### Preparing authenticated flows

There are deliberately no `THI_USERNAME` or `THI_PASSWORD` variables. After running the guest
suite, sign in interactively with a dedicated THI test account:

1. Open **Profile** and use the guest sign-in banner.
2. Wait for Home and authenticated data to load.
3. Confirm the guest sign-in banner is absent.
4. Run `bun e2e:authenticated` without running a guest suite afterward.

The lecture flow additionally needs an upcoming lecture with populated Goal, Content, or Literature
data. The member flow uses a separate OIDC login under **Profile → Neuland Member Area**.

### Safety and troubleshooting

- Use a dedicated simulator/emulator and test accounts. `bun e2e:logout` removes stored THI
  credentials; Wallet flows can invoke Apple/Google Wallet.
- Permission prompts are handled by the flows. If one blocks the UI, reset/relaunch the app and
  rerun the individual flow.
- Keep the development client connected to Metro and use `.maestro` as the test root. Passing
  `.maestro/flows` with the workspace config can produce “no flow files matched” errors.
- Debug logs, screenshots, and recordings are written to `~/.maestro/tests/`.
- If Web requests to `api.neuland.app` fail because of CORS, use a development API/proxy that
  allows the local origin or run the API-dependent checks on iOS/Android.
