#!/bin/zsh
set -e
set -x

if [[ -n "$CI_PRIMARY_REPOSITORY_PATH" ]]; then
	REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"
elif [[ -f "$(dirname "$0")/../../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
elif [[ -f "$(dirname "$0")/../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
else
	REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fi
cd "$REPO_ROOT"

require_command() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "ERROR: required command '$1' is not on PATH."
		exit 1
	fi
}

echo "===== Checking pre-installed tools ====="
require_command node
require_command bun
require_command pod
node -v
npm -v
bun -v
pod --version

export NODE_BINARY="$(command -v node)"
echo "NODE_BINARY is set to $NODE_BINARY"

echo "===== Running bun install ====="
bun install --frozen-lockfile --ignore-scripts

echo "===== Updating license list ====="
bun run licences:bundle

echo "===== Running expo prebuild ====="
bunx expo prebuild -p ios

echo "===== Running pod install ====="
cd ios
pod install

echo "===== Resolving Swift package dependencies ====="
# Xcode Cloud disables automatic SPM resolution; allow resolve to generate Package.resolved.
defaults delete com.apple.dt.Xcode IDEPackageOnlyUseVersionsFromResolvedFile 2>/dev/null || true
defaults delete com.apple.dt.Xcode IDEDisableAutomaticPackageResolution 2>/dev/null || true
xcodebuild -resolvePackageDependencies \
	-workspace NeulandNext.xcworkspace \
	-scheme NeulandNext
