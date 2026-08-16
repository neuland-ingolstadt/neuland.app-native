#!/usr/bin/env bash
set -euo pipefail

# Match eas-cli's `eas update` export: native Hermes bundles + asset map +
# sourcemaps. Upload to RustRak and strip maps before `eas update --skip-bundler`
# so the published JS still has debug IDs but maps never ship to Expo.

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

bunx expo export \
	--output-dir dist \
	--source-maps \
	--dump-assetmap \
	--platform ios \
	--platform android

bash config/ci/upload-sourcemaps.sh dist --strip --required
