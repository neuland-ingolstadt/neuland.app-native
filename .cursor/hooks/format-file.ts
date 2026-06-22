import { stdin } from 'bun'

interface FileEditInput {
	file_path: string
}

const BIOME_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.jsonc'])

const SKIP_PATTERNS = [
	/\/src\/__generated__\//,
	/\/src\/data\/licenses\.json$/,
	/\.svg$/,
]

async function main() {
	const input = JSON.parse(await stdin.text()) as FileEditInput
	const filePath = input.file_path

	if (!filePath) return

	const extension = filePath.slice(filePath.lastIndexOf('.'))
	if (!BIOME_EXTENSIONS.has(extension)) return
	if (SKIP_PATTERNS.some((pattern) => pattern.test(filePath))) return

	const result = await Bun.$`bunx biome check --fix --no-errors-on-unmatched ${filePath}`
		.quiet()
		.nothrow()

	if (result.exitCode !== 0) {
		console.error(result.stderr.toString() || result.stdout.toString())
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(0)
})
