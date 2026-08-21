#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

bunx expo export \
	--output-dir dist \
	--source-maps \
	--dump-assetmap \
	--platform ios \
	--platform android

node "$root/config/plugins/rustrak-sourcemaps/cli.js" ota dist --required
