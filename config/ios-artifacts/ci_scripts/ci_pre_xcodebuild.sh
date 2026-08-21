#!/bin/zsh
set -e

if [[ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]]; then
	REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"
elif [[ -f "$(dirname "$0")/../../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
elif [[ -f "$(dirname "$0")/../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
else
	REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fi

eval "$(node "$REPO_ROOT/config/plugins/rustrak-sourcemaps/cli.js" env --shell --no-local-env)"

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
	echo "warning: SENTRY_AUTH_TOKEN unset; RustRak sourcemap upload will be skipped" >&2
fi
