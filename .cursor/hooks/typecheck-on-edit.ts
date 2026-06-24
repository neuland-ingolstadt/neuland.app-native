import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { stdin } from 'bun'

interface FileEditInput {
	file_path: string
}

const THROTTLE_MS = 15_000
const MAX_OUTPUT_LINES = 30
const STATE_DIR = '.cursor/hooks/state'
const LAST_RUN_PATH = `${STATE_DIR}/typecheck-last-run.json`

async function ensureLicenses() {
	const licensesFile = Bun.file('src/data/licenses.json')
	if (await licensesFile.exists()) return

	await Bun.$`bun licences`.quiet().nothrow()
}

async function shouldRun(): Promise<boolean> {
	try {
		const state = JSON.parse(await readFile(LAST_RUN_PATH, 'utf8')) as {
			lastRunMs: number
		}
		return Date.now() - state.lastRunMs >= THROTTLE_MS
	} catch {
		return true
	}
}

async function markRun() {
	await mkdir(STATE_DIR, { recursive: true })
	await writeFile(
		LAST_RUN_PATH,
		JSON.stringify({ lastRunMs: Date.now() }),
		'utf8',
	)
}

async function main() {
	const input = JSON.parse(await stdin.text()) as FileEditInput
	const filePath = input.file_path

	if (!filePath) return
	if (!/\.tsx?$/.test(filePath)) return
	if (!await shouldRun()) return

	await ensureLicenses()

	const result = await Bun.$`bun tsc --noEmit`.quiet().nothrow()
	await markRun()

	if (result.exitCode === 0) return

	const output = result.stderr.toString() || result.stdout.toString()
	const summary = output.split('\n').slice(0, MAX_OUTPUT_LINES).join('\n')
	console.error(`TypeScript errors after edit:\n${summary}`)
}

main().catch((error) => {
	console.error(error)
	process.exit(0)
})
