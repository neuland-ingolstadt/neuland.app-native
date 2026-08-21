#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

node "$root/config/plugins/rustrak-sourcemaps/cli.js" env
eval "$(node "$root/config/plugins/rustrak-sourcemaps/cli.js" env --shell)"

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	echo "warning: SENTRY_AUTH_TOKEN is unset; RustRak will receive events without JS sourcemaps" >&2
fi

xcodebuild archive \
	-workspace ios/NeulandNext.xcworkspace \
	-scheme NeulandNext \
	-configuration Release \
	-archivePath ios/build/NeulandNext.xcarchive \
	"$@"
