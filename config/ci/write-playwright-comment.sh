#!/usr/bin/env bash
set -euo pipefail

base_url="${1:?raw content base URL required}"
screenshots_dir="${2:?screenshots directory required}"
comment_file="${3:-playwright-comment.md}"

marker='<!-- playwright-screenshots -->'

{
	printf '%s\n' "$marker"
	echo '## Web screenshots (Playwright demo)'
	echo ''
	echo 'Automated screenshots from the exported web build (390×844 viewport).'
	echo ''
} >"$comment_file"

mapfile -t screenshots < <(find "$screenshots_dir" -maxdepth 1 -name '*.png' -print | sort)
for screenshot in "${screenshots[@]}"; do
	name=$(basename "$screenshot" .png)
	url="${base_url}/$(basename "$screenshot")"
	{
		echo "### ${name}"
		echo ''
		echo "![${name}](${url})"
		echo ''
	} >>"$comment_file"
done

echo "Wrote PR comment to ${comment_file}"
