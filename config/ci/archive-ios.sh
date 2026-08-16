#!/usr/bin/env bash
set -euo pipefail

# Local iOS Release archive. xcodebuild does not load Expo's .env.local, but the
# Sentry Xcode phase only reads SENTRY_AUTH_TOKEN from the environment (or
# .env.sentry-build-plugin). Source .env.local so JS sourcemaps upload to Bugsink.

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

if [[ -f .env.local ]]; then
	set -a
	# shellcheck disable=SC1091
	source .env.local
	set +a
fi

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	echo "warning: SENTRY_AUTH_TOKEN is unset; Bugsink will receive events without JS sourcemaps" >&2
fi

export SENTRY_URL="${SENTRY_URL:-https://bugs.neuland.app/}"
export SENTRY_ORG="${SENTRY_ORG:-neuland}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-neuland-next}"

exec xcodebuild archive \
	-workspace ios/NeulandNext.xcworkspace \
	-scheme NeulandNext \
	-configuration Release \
	-archivePath ios/build/NeulandNext.xcarchive \
	"$@"
