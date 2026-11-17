#!/bin/zsh
# Bundle RN phase sources ios/.xcode.env.local (not reachable via dirname/$0
# because ios/ci_scripts is a symlink into config/ios-artifacts/).
# Custom Xcode Cloud env vars must be exported here so Metro can inline them.
ENV_LOCAL="$CI_PRIMARY_REPOSITORY_PATH/ios/.xcode.env.local"
{
	echo "export EXPO_PUBLIC_GIT_COMMIT_HASH=\"${CI_COMMIT:-$XCS_GIT_SHA}\""
	echo "export EXPO_PUBLIC_FEEDBACK_API=\"${EXPO_PUBLIC_FEEDBACK_API:-https://survey.neuland.app}\""
	echo "export EXPO_PUBLIC_FEEDBACK_KEY=\"${EXPO_PUBLIC_FEEDBACK_KEY:-}\""
} >> "$ENV_LOCAL"
