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

CI_TOOLS_DIR="${CI_DERIVED_DATA_PATH:-/tmp}/neuland-ci-tools"
mkdir -p "$CI_TOOLS_DIR"

require_command() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "ERROR: required command '$1' is not on PATH."
		exit 1
	fi
}

ensure_node() {
	if command -v node >/dev/null 2>&1; then
		return 0
	fi

	local NODE_VERSION="22.14.0"
	local NODE_ARCH="arm64"
	[[ "$(uname -m)" == "x86_64" ]] && NODE_ARCH="x64"

	local NODE_DIR="node-v${NODE_VERSION}-darwin-${NODE_ARCH}"
	local NODE_ROOT="${CI_TOOLS_DIR}/${NODE_DIR}"

	if [[ ! -x "${NODE_ROOT}/bin/node" ]]; then
		echo "===== Installing Node.js ${NODE_VERSION} ====="
		curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIR}.tar.gz" \
			| tar -xz -C "$CI_TOOLS_DIR"
	fi

	export PATH="${NODE_ROOT}/bin:${PATH}"
}

ensure_bun() {
	if command -v bun >/dev/null 2>&1; then
		return 0
	fi

	echo "===== Installing Bun ====="
	export BUN_INSTALL="${CI_TOOLS_DIR}/bun"
	if [[ -f "$REPO_ROOT/.bun-version" ]]; then
		export BUN_VERSION="$(tr -d '[:space:]' < "$REPO_ROOT/.bun-version")"
	fi
	curl -fsSL https://bun.sh/install | bash
	export PATH="${BUN_INSTALL}/bin:${PATH}"
}

echo "===== Ensuring Node.js and Bun ====="
ensure_node
ensure_bun

echo "===== Checking tools ====="
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

echo "===== Configuring NODE_BINARY for Xcode build phases ====="
cat > ios/.xcode.env <<EOF
export NODE_BINARY="${NODE_BINARY}"
EOF

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
