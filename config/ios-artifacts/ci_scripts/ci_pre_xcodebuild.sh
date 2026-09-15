#!/bin/zsh
# Bundle RN phase sources ios/.xcode.env.local (not reachable via dirname/$0
# because ios/ci_scripts is a symlink into config/ios-artifacts/).
echo "export EXPO_PUBLIC_GIT_COMMIT_HASH=\"${CI_COMMIT:-$XCS_GIT_SHA}\"" >> "$CI_PRIMARY_REPOSITORY_PATH/ios/.xcode.env.local"
