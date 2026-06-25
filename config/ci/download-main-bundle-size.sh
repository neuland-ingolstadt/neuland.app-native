#!/usr/bin/env bash
set -euo pipefail

output_file="${1:-base-bundle-size.json}"
repo="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"

artifact_id=$(
	gh api "repos/${repo}/actions/artifacts?per_page=100&name=web-bundle-size" \
		--jq '.artifacts
			| map(select(.expired == false and .workflow_run.head_branch == "main"))
			| sort_by(.created_at)
			| reverse
			| .[0].id // empty'
)

if [ -z "$artifact_id" ]; then
	echo 'error: no web-bundle-size artifact found from a successful main CI run' >&2
	exit 1
fi

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

gh api "repos/${repo}/actions/artifacts/${artifact_id}/zip" >"${tmp_dir}/artifact.zip"
unzip -q "${tmp_dir}/artifact.zip" -d "${tmp_dir}/artifact"
cp "${tmp_dir}/artifact/bundle-size.json" "$output_file"

commit=$(jq -r '.commit // empty' "$output_file")
if [ -n "$commit" ]; then
	echo "Downloaded main bundle size from CI artifact (commit ${commit:0:7})."
else
	echo 'Downloaded main bundle size from CI artifact.'
fi
