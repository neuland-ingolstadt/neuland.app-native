const DEV_CLIENT_URL =
	'exp+neuland-app-native://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081'
const IOS_APP_ID = 'de.neuland-ingolstadt.neuland-app'

const suites = {
	authenticated: { includeTags: 'student' },
	lecture: { includeTags: 'seeded-data' },
	member: { includeTags: 'member', excludeTags: 'external-side-effect' },
	wallet: { includeTags: 'external-side-effect' },
	logout: { includeTags: 'destructive-auth' },
	'map-soak': { includeTags: 'long-running' }
} as const

type SuiteName = keyof typeof suites

interface SimctlDevice {
	state: string
	udid: string
}

interface SimctlDeviceList {
	devices: Record<string, SimctlDevice[]>
}

function getBootedIosDeviceId(): string | undefined {
	const result = Bun.spawnSync({
		cmd: ['xcrun', 'simctl', 'list', 'devices', 'booted', '--json'],
		stdout: 'pipe',
		stderr: 'inherit'
	})

	if (!result.success) {
		return undefined
	}

	const list = JSON.parse(new TextDecoder().decode(result.stdout)) as SimctlDeviceList
	return Object.values(list.devices)
		.flat()
		.find(({ state }) => state === 'Booted')?.udid
}

const suiteName = process.argv[2] as SuiteName | undefined

if (suiteName == null || !(suiteName in suites)) {
	console.error(
		`Usage: bun config/run-maestro-tagged-suite.ts <${Object.keys(suites).join('|')}>`
	)
	process.exit(2)
}

const deviceId = process.env.MAESTRO_DEVICE_ID ?? getBootedIosDeviceId()

if (deviceId == null) {
	console.error('No iOS simulator is booted. Set MAESTRO_DEVICE_ID to target another device.')
	process.exit(1)
}

const suite = suites[suiteName]
const command = [
	'maestro',
	'test',
	'--device',
	deviceId,
	'--config=.maestro/config.yaml',
	'-e',
	`APP_ID=${process.env.APP_ID ?? IOS_APP_ID}`,
	'-e',
	`DEV_CLIENT_URL=${process.env.DEV_CLIENT_URL ?? DEV_CLIENT_URL}`,
	`--include-tags=${suite.includeTags}`
]

if ('excludeTags' in suite) {
	command.push(`--exclude-tags=${suite.excludeTags}`)
}

command.push('.maestro')

const result = Bun.spawnSync({
	cmd: command,
	cwd: process.cwd(),
	env: process.env,
	stdout: 'inherit',
	stderr: 'inherit'
})

process.exit(result.exitCode ?? 1)
