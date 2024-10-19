#!/bin/zsh
set -e 
set -x

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node@22
brew link node@22
node -v
npm -v


# Install dependencies
echo "===== Running bun install ====="
cd ../..
ls
npm install --ignore-scripts
echo "===== Running pod install ====="
cd ios
pod install