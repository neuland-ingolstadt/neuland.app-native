#!/bin/zsh
# Sourced into the RN "Bundle React Native code and images" phase via .xcode.env.local.
# (Bare `export` in this script does not reach Metro.)
echo "export EXPO_PUBLIC_GIT_COMMIT_HASH=\"${CI_COMMIT:-$XCS_GIT_SHA}\"" >> "$(dirname "$0")/../.xcode.env.local"
