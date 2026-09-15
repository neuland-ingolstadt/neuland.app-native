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

# Xcode Cloud exposes CI_COMMIT, but shell exports do not carry into later
# xcodebuild / Metro phases. Persist it for Expo's EXPO_PUBLIC_* inlining.
echo "===== Setting EXPO_PUBLIC_GIT_COMMIT_HASH ====="
COMMIT_HASH="${CI_COMMIT:-$(git rev-parse HEAD 2>/dev/null || true)}"
if [[ -n "$COMMIT_HASH" ]]; then
	export EXPO_PUBLIC_GIT_COMMIT_HASH="$COMMIT_HASH"
	# Replace any prior value so re-runs stay idempotent.
	if [[ -f .env.local ]] && grep -q '^EXPO_PUBLIC_GIT_COMMIT_HASH=' .env.local; then
		grep -v '^EXPO_PUBLIC_GIT_COMMIT_HASH=' .env.local > .env.local.tmp
		mv .env.local.tmp .env.local
	fi
	printf 'EXPO_PUBLIC_GIT_COMMIT_HASH=%s\n' "$COMMIT_HASH" >> .env.local
	if [[ -n "${CI_COMMIT:-}" ]]; then
		echo "EXPO_PUBLIC_GIT_COMMIT_HASH=${COMMIT_HASH:0:7}… (from CI_COMMIT)"
	else
		echo "EXPO_PUBLIC_GIT_COMMIT_HASH=${COMMIT_HASH:0:7}… (from git rev-parse)"
	fi
else
	echo "WARNING: CI_COMMIT and git HEAD unavailable; Version screen will show N/A for commit hash"
fi

echo "===== Installing CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_REQUIRE_TAP_TRUST=1
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node
brew link node 2>/dev/null || true
node -v
npm -v
export NODE_BINARY=$(which node)
echo "NODE_BINARY is set to $NODE_BINARY"

echo "===== Installing Bun ====="
brew tap oven-sh/bun
brew install bun
bun -v

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
