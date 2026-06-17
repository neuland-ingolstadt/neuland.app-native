#!/usr/bin/env bash
set -euo pipefail

# Search tracked files for Git merge conflict markers.
# Omits the ======= separator line to avoid false positives in markdown,
# licenses, and other decorative uses of equals signs.

if git grep -nE '^<<<<<<< |^>>>>>>> ' -- .; then
	echo >&2
	echo 'error: merge conflict markers found in the files above' >&2
	exit 1
fi

echo 'No merge conflict markers found.'
