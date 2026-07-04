import { stdin } from 'bun'

interface StopHookInput {
	status: 'completed' | 'aborted' | 'error'
	loop_count: number
}

const MAX_OUTPUT_LINES = 40

interface Check {
	name: string
	verifyCommand: string
	run: () => ReturnType<typeof Bun.$>
}

const CHECKS: Check[] = [
	{
		name: 'TypeScript',
		verifyCommand: 'bun tsc --noEmit',
		run: () => Bun.$`bun tsc --noEmit`.quiet().nothrow(),
	},
	{
		name: 'Biome',
		verifyCommand: 'bun lint',
		run: () => Bun.$`bun lint`.quiet().nothrow(),
	},
	{
		name: 'Unit tests',
		verifyCommand: 'bun test --ci',
		run: () => Bun.$`bun test --ci`.quiet().nothrow(),
	},
]

async function ensureLicenses() {
	const licensesFile = Bun.file('src/data/licenses.json')
	if (await licensesFile.exists()) return

	await Bun.$`bun licences`.quiet().nothrow()
}

function summarizeOutput(result: Awaited<ReturnType<Check['run']>>) {
	const output = result.stderr.toString() || result.stdout.toString()
	return output.split('\n').slice(0, MAX_OUTPUT_LINES).join('\n')
}

async function main() {
	const input = JSON.parse(await stdin.text()) as StopHookInput

	if (input.status === 'aborted') return

	await ensureLicenses()

	const failures: string[] = []

	for (const check of CHECKS) {
		const result = await check.run()
		if (result.exitCode === 0) continue

		const summary = summarizeOutput(result)
		failures.push(`## ${check.name}\n\n${summary}`)
		console.error(`[stop hook] ${check.name} failed:\n${summary}`)
	}

	if (failures.length === 0) return

	const combined = failures.join('\n\n')
	const verifyCommands = CHECKS.map((c) => c.verifyCommand).join(', ')

	console.log(
		JSON.stringify({
			followup_message:
				`CI checks failed (${failures.length}/${CHECKS.length}). Fix the errors below, then verify with: ${verifyCommands}\n\n${combined}`,
		}),
	)
}

main().catch((error) => {
	console.error(error)
	process.exit(0)
})
