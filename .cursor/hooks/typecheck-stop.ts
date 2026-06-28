import { stdin } from 'bun'

interface StopHookInput {
	status: 'completed' | 'aborted' | 'error'
	loop_count: number
}

const MAX_OUTPUT_LINES = 40

async function ensureLicenses() {
	const licensesFile = Bun.file('src/data/licenses.json')
	if (await licensesFile.exists()) return

	await Bun.$`bun licences`.quiet().nothrow()
}

async function main() {
	const input = JSON.parse(await stdin.text()) as StopHookInput

	if (input.status === 'aborted') return

	await ensureLicenses()

	const result = await Bun.$`bun tsc --noEmit`.quiet().nothrow()
	if (result.exitCode === 0) return

	const output = result.stderr.toString() || result.stdout.toString()
	const summary = output.split('\n').slice(0, MAX_OUTPUT_LINES).join('\n')

	console.error(summary)
	console.log(
		JSON.stringify({
			followup_message:
				`TypeScript check failed. Fix the errors below, then verify with \`bun tsc --noEmit\`:\n\n${summary}`,
		}),
	)
}

main().catch((error) => {
	console.error(error)
	process.exit(0)
})
