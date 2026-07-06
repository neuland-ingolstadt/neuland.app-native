#!/usr/bin/env bash
set -euo pipefail

screenshots_dir="${1:?screenshots directory required}"
pr_number="${2:?pull request number required}"
repo="${GITHUB_REPOSITORY:?}"
token="${GITHUB_TOKEN:?}"

branch="playwright-screenshots/pr-${pr_number}"
owner="${repo%%/*}"
repo_name="${repo##*/}"

if [ ! -d "$screenshots_dir" ] || [ -z "$(find "$screenshots_dir" -maxdepth 1 -name '*.png' -print -quit)" ]; then
	echo "No PNG screenshots found in ${screenshots_dir}" >&2
	exit 1
fi

worktree=$(mktemp -d)
trap 'rm -rf "$worktree"' EXIT

cp "$screenshots_dir"/*.png "$worktree/"

git -C "$worktree" init -q
git -C "$worktree" config user.name "github-actions[bot]"
git -C "$worktree" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git -C "$worktree" checkout -q -b "$branch"
git -C "$worktree" add .
git -C "$worktree" commit -q -m "Playwright screenshots for PR #${pr_number}"

git -C "$worktree" push -f \
	"https://x-access-token:${token}@github.com/${repo}.git" \
	"HEAD:${branch}"

printf 'https://raw.githubusercontent.com/%s/%s/%s\n' "$owner" "$repo_name" "$branch"
