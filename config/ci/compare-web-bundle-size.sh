#!/usr/bin/env bash
set -euo pipefail

base_file="${1:-base-bundle-size.json}"
pr_file="${2:-pr-bundle-size.json}"
output_file="${3:-bundle-size-comment.md}"

bun -e "
const base = JSON.parse(await Bun.file(process.argv[1]).text())
const pr = JSON.parse(await Bun.file(process.argv[2]).text())
const out = process.argv[3]

function formatBytes(bytes) {
	const units = ['B', 'KB', 'MB']
	let value = bytes
	let unit = 0
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024
		unit++
	}
	return \`\${value.toFixed(unit === 0 ? 0 : 2)} \${units[unit]}\`
}

function diffLine(label, baseBytes, prBytes) {
	const delta = prBytes - baseBytes
	const deltaSign = delta >= 0 ? '+' : '-'
	const pct = baseBytes === 0 ? 'n/a' : \`\${deltaSign}\${Math.abs((delta / baseBytes) * 100).toFixed(2)}%\`
	return \`| \${label} | \${formatBytes(baseBytes)} | \${formatBytes(prBytes)} | \${deltaSign}\${formatBytes(Math.abs(delta))} (\${pct}) |\`
}

const body = [
	'<!-- web-bundle-size -->',
	'### Web bundle size',
	'',
	'Comparison against \`main\` after \`expo export -p web\` (Atlas enabled).',
	'',
	'| Asset | main | PR | Diff |',
	'| --- | --- | --- | --- |',
	diffLine('JavaScript', base.js_bytes, pr.js_bytes),
	diffLine('CSS', base.css_bytes, pr.css_bytes),
	diffLine('Total', base.total_bytes, pr.total_bytes),
	'',
].join('\n')

await Bun.write(out, body)
" "$base_file" "$pr_file" "$output_file"

cat "$output_file"
