#!/usr/bin/env bash
# Invoked as a single line by reactivecircus/android-emulator-runner
# (that action splits multiline `script:` inputs and runs each line via `sh -c`).
set -euo pipefail

if [[ -z "${GITHUB_TOKEN:-}" && -z "${GH_TOKEN:-}" ]]; then
	echo 'Missing GITHUB_TOKEN/GH_TOKEN for neuland.app-build-cache access.' >&2
	exit 1
fi

adb wait-for-device

# On fingerprint hit: download + install from GitHub Releases cache.
# On miss: compile locally, upload APK to the cache (write), then install.
# --no-bundler: Metro is started separately for Maestro below.
device_args=()
if [[ -n "${ANDROID_SERIAL:-}" ]]; then
	device_args=(--device "$ANDROID_SERIAL")
fi
npx expo run:android "${device_args[@]}" --no-bundler

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

bun e2e:android
