#!/bin/zsh

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node@21
echo "===== Installing bun ====="
brew install bun

# Install dependencies
echo "===== Running bun install ====="
bun install
echo "===== Running pod install ====="
cd ios
pod install