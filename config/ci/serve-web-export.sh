#!/usr/bin/env bash
set -euo pipefail

port="${1:-3000}"
pid_file="${2:-/tmp/playwright-serve.pid}"

if [ ! -d dist ]; then
	echo "dist/ not found — run expo export -p web first" >&2
	exit 1
fi

bunx serve dist -s -l "$port" >/tmp/playwright-serve.log 2>&1 &
echo $! >"$pid_file"

timeout 90 bash -c "until curl -sf http://127.0.0.1:${port}/ >/dev/null; do sleep 2; done"
echo "Serving dist/ on http://127.0.0.1:${port}"
