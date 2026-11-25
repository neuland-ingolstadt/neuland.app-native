#!/usr/bin/env bash
set -euo pipefail

# Public build-time env vars for CI web exports (matches Docker build args).
export EXPO_PUBLIC_THI_API_KEY="${EXPO_PUBLIC_THI_API_KEY:-ci-placeholder}"
export EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID="${EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID:-}"
export EXPO_PUBLIC_NEULAND_CORE_API="${EXPO_PUBLIC_NEULAND_CORE_API:-https://api.neuland.app/core/v1}"
export EXPO_PUBLIC_NEULAND_FOOD_API="${EXPO_PUBLIC_NEULAND_FOOD_API:-https://api.neuland.app/food/v1}"
export EXPO_PUBLIC_APTABASE_KEY="${EXPO_PUBLIC_APTABASE_KEY:-}"
export EXPO_PUBLIC_FEEDBACK_API="${EXPO_PUBLIC_FEEDBACK_API:-https://survey.neuland.app}"
export EXPO_PUBLIC_FEEDBACK_KEY="${EXPO_PUBLIC_FEEDBACK_KEY:-}"
export EXPO_PUBLIC_FLIPT_URL="${EXPO_PUBLIC_FLIPT_URL:-https://flipt.neuland.ing}"
export EXPO_PUBLIC_FLIPT_NAMESPACE="${EXPO_PUBLIC_FLIPT_NAMESPACE:-neuland-app}"
export EXPO_PUBLIC_GIT_COMMIT_HASH="${EXPO_PUBLIC_GIT_COMMIT_HASH:-${GITHUB_SHA:-local}}"
