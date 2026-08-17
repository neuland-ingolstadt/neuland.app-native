#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

if [[ -f .env.local ]]; then
	set -a
	# shellcheck disable=SC1091
	source .env.local
	set +a
fi

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	echo "warning: SENTRY_AUTH_TOKEN is unset; RustRak will receive events without JS sourcemaps" >&2
fi

export SENTRY_URL="${SENTRY_URL:-https://rustrak.neuland.app/}"
export SENTRY_ORG="${SENTRY_ORG:-neuland}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-neuland-next}"
export SENTRY_DISABLE_XCODE_DEBUG_UPLOAD=true

xcodebuild archive \
	-workspace ios/NeulandNext.xcworkspace \
	-scheme NeulandNext \
	-configuration Release \
	-archivePath ios/build/NeulandNext.xcarchive \
	"$@"
