#!/bin/zsh

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node@20

# Install dependencies
echo "===== Running bun install ====="
cd ..
npm install
echo "===== Running pod install ====="
cd ios
pod install