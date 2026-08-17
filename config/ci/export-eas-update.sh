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

bash config/ci/upload-sourcemaps.sh dist --strip --required
