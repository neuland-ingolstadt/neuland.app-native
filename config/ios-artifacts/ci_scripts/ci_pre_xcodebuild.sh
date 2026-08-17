#!/bin/zsh
set -e

# Bundle Sentry env vars into .env.sentry-build-plugin so sentry-cli reads token and URL from the same source.

if [[ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]]; then
	REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"
elif [[ -f "$(dirname "$0")/../../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
elif [[ -f "$(dirname "$0")/../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
else
	REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fi

export SENTRY_URL="${SENTRY_URL:-https://rustrak.neuland.app/}"
export SENTRY_ORG="${SENTRY_ORG:-neuland}"
export SENTRY_PROJECT="${SENTRY_PROJECT:-neuland-next}"
export SENTRY_DISABLE_XCODE_DEBUG_UPLOAD=true

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	echo "warning: SENTRY_AUTH_TOKEN unset; RustRak sourcemap upload will be skipped" >&2
	exit 0
fi

cat >"$REPO_ROOT/.env.sentry-build-plugin" <<EOF
SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
SENTRY_URL=${SENTRY_URL}
SENTRY_ORG=${SENTRY_ORG}
SENTRY_PROJECT=${SENTRY_PROJECT}
SENTRY_DISABLE_XCODE_DEBUG_UPLOAD=true
EOF
