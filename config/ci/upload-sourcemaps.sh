#!/usr/bin/env bash
set -euo pipefail

# Upload JS bundles + sourcemaps to Bugsink via sentry-cli (same artifact-bundle
# endpoints as Sentry). See https://www.bugsink.com/docs/sourcemaps/
#
# Usage: bash config/ci/upload-sourcemaps.sh [dir] [--strip] [--required]
# Skips when SENTRY_AUTH_TOKEN is unset unless --required is passed.

dir="dist"
strip=""
required=""

for arg in "$@"; do
	case "$arg" in
	--strip) strip=1 ;;
	--required) required=1 ;;
	-*)
		echo "Unknown flag: $arg" >&2
		exit 1
		;;
	*) dir="$arg" ;;
	esac
done

fail_or_skip() {
	echo "$1" >&2
	if [[ -n "$required" ]]; then
		exit 1
	fi
	if [[ -n "$strip" && -d "$dir" ]]; then
		find "$dir" -type f -name '*.map' -delete
		echo "Removed source maps from $dir"
	fi
	exit 0
}

if [[ ! -d "$dir" ]]; then
	fail_or_skip "Sourcemap upload skipped: $dir does not exist"
fi

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	fail_or_skip "SENTRY_AUTH_TOKEN unset, skipping sourcemap upload"
fi

map_count="$(find "$dir" -type f -name '*.map' | wc -l | tr -d ' ')"
if [[ "$map_count" == "0" ]]; then
	fail_or_skip "Sourcemap upload skipped: no .map files in $dir"
fi

export SENTRY_URL="${SENTRY_URL:-https://bugs.neuland.app/}"
export SENTRY_ORG="${SENTRY_ORG:-neuland}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-neuland-next}"

sentry_cli="$(node -e "process.stdout.write(require.resolve('@sentry/cli/bin/sentry-cli'))")"

"$sentry_cli" sourcemaps inject "$dir"
npx sentry-expo-upload-sourcemaps "$dir"

if [[ -n "$strip" ]]; then
	find "$dir" -type f -name '*.map' -delete
	echo "Removed source maps from $dir after upload"
fi
