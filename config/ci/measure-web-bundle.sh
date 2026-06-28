#!/usr/bin/env bash
set -euo pipefail

output_file="${1:-bundle-size.json}"

bun run licences:bundle
EXPO_UNSTABLE_ATLAS=true npx expo export -p web -c

js_bytes=0
css_bytes=0

if [ -d dist/_expo/static/js ]; then
	js_bytes=$(find dist/_expo/static/js -type f -name '*.js' -printf '%s\n' | awk '{s+=$1} END {print s+0}')
fi

if [ -d dist/_expo/static/css ]; then
	css_bytes=$(find dist/_expo/static/css -type f -name '*.css' -printf '%s\n' | awk '{s+=$1} END {print s+0}')
fi

total_bytes=$((js_bytes + css_bytes))

printf '{"js_bytes":%s,"css_bytes":%s,"total_bytes":%s}\n' "$js_bytes" "$css_bytes" "$total_bytes" >"$output_file"

if [ -n "${GITHUB_SHA:-}" ]; then
	bun -e "
		const file = process.argv[1]
		const data = JSON.parse(await Bun.file(file).text())
		data.commit = process.env.GITHUB_SHA
		data.measured_at = new Date().toISOString()
		await Bun.write(file, \`\${JSON.stringify(data)}\n\`)
	" "$output_file"
fi

echo "Web bundle sizes — JS: ${js_bytes} bytes, CSS: ${css_bytes} bytes, total: ${total_bytes} bytes"
