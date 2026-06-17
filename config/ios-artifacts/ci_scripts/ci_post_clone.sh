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
npm install npm-license-crawler -g
npx npm-license-crawler -onlyDirectDependencies -json src/data/licenses.json

echo "===== Pulling Git LFS assets ====="
git lfs install --local 2>/dev/null || git lfs install
git lfs pull

echo "===== Running expo prebuild ====="
bunx expo prebuild -p ios

echo "===== Running pod install ====="
cd ios
pod install

echo "===== Installing Swift package lockfile ====="
mkdir -p NeulandNext.xcworkspace/xcshareddata/swiftpm
cp "$REPO_ROOT/config/ios-artifacts/NeulandNext.xcworkspace/xcshareddata/swiftpm/Package.resolved" \
	NeulandNext.xcworkspace/xcshareddata/swiftpm/Package.resolved
