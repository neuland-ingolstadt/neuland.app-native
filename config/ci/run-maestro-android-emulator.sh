#!/usr/bin/env bash
# Invoked as a single line by reactivecircus/android-emulator-runner
# (that action splits multiline `script:` inputs and runs each line via `sh -c`).
# Expects MAESTRO_ANDROID_APK to point at a debug APK built in a prior job.
set -euo pipefail

APK="${MAESTRO_ANDROID_APK:-}"
if [[ -z "$APK" || ! -f "$APK" ]]; then
	echo "MAESTRO_ANDROID_APK must point to an existing APK (got: ${APK:-<empty>})" >&2
	exit 1
fi

adb wait-for-device
adb devices -l

# Suppress system crash/ANR dialogs (e.g. "Pixel Launcher isn't responding") that
# sit above the app and hide Maestro testIDs on GHA emulators.
adb shell settings put global hide_error_dialogs 1 || true
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true

echo "Installing $APK"
adb install -r "$APK"

bun start:e2e >/tmp/maestro-android-metro.log 2>&1 &
for _ in $(seq 1 90); do
	if curl -fsS 'http://127.0.0.1:8081/status' >/dev/null 2>&1 || curl -fsS 'http://127.0.0.1:8081/' >/dev/null 2>&1; then
		echo 'Metro is ready'
		break
	fi
	sleep 2
done
if ! curl -fsS 'http://127.0.0.1:8081/status' >/dev/null 2>&1 && ! curl -fsS 'http://127.0.0.1:8081/' >/dev/null 2>&1; then
	echo 'Metro failed to become ready' >&2
	cat /tmp/maestro-android-metro.log >&2 || true
	exit 1
fi

# Cold first-bundle in CI was ~50s; pre-warm so the first Maestro reconnect does not race it.
echo 'Pre-warming Android Metro bundle...'
curl -fsS \
	'http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=android&dev=false&minify=true' \
	-o /dev/null \
	|| curl -fsS \
		'http://127.0.0.1:8081/index.bundle?platform=android&dev=false&minify=true' \
		-o /dev/null

bun e2e:android
