#!/bin/zsh
set -e 
set -x

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node@23
brew link node@23
node -v
npm -v
export NODE_BINARY=$(which node)
echo "NODE_BINARY is set to $NODE_BINARY"

echo "===== Installing Bun ====="
brew tap oven-sh/bun
brew install bun 
bun -v

# Install dependencies
echo "===== Running bun install ====="
cd ../..
bun i npm-license-crawler -g
bun install --frozen-lockfile --ignore-scripts -p
bun licenses

echo "===== Running pod install ====="
cd ios
pod install