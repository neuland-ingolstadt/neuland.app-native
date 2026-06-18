#!/bin/zsh
set -e
set -x

# Homebrew auto-update hits formulae.brew.sh and often fails on Xcode Cloud (DNS).
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_ENV_HINTS=1
export HOMEBREW_NO_INSTALL_FROM_API=1

echo "===== Installing CocoaPods ====="
if ! command -v pod >/dev/null 2>&1; then
	if ! brew install cocoapods; then
		echo "brew install cocoapods failed, falling back to gem"
		sudo gem install cocoapods
	fi
fi
pod --version

echo "===== Installing Node.js ====="
if ! command -v node >/dev/null 2>&1; then
	brew install node
	brew link node
fi
node -v
npm -v
export NODE_BINARY=$(which node)
echo "NODE_BINARY is set to $NODE_BINARY"

echo "===== Installing Bun ====="
if ! command -v bun >/dev/null 2>&1; then
	brew tap oven-sh/bun
	brew install bun
fi
bun -v

# Install dependencies
echo "===== Running bun install ====="
cd ../..
bun install --frozen-lockfile --ignore-scripts
npm install npm-license-crawler -g
npx npm-license-crawler -onlyDirectDependencies -json src/data/licenses.json --exclude docs/

echo "===== Running pod install ====="
cd ios
pod install
