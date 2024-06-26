#!/bin/zsh

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node@20
echo "===== Installing bun ====="
brew tap oven-sh/bun
brew install bun

# Install dependencies
echo "===== Running bun install ====="
cd ..
bun install
echo "===== Running pod install ====="
cd ios
pod install