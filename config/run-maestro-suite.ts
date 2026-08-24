const commonFlows = [
	'onboarding-guest',
	'guest-navigation',
	'map-regression',
	'food-regression',
	'settings-persistence',
	'public-content-and-links',
	'map-location-denied',
	'map-location-allowed',
	'native-controls-and-share',
	'dashboard-context-menu',
	'quick-actions'
] as const

const suite = process.argv[2]

if (suite !== 'default' && suite !== 'ios' && suite !== 'android') {
	console.error('Usage: bun config/run-maestro-suite.ts <default|ios|android>')
	process.exit(2)
}

const appId = suite === 'android' ? 'app.neuland' : 'de.neuland-ingolstadt.neuland-app'
const flows = suite === 'ios' ? [...commonFlows, 'ios-app-icon'] : commonFlows
const devServerHost =
	process.env.DEV_SERVER_HOST ?? (suite === 'android' ? '10.0.2.2' : 'localhost')
const devServerAddress = `${devServerHost}:8081`
const DEV_CLIENT_URL = `exp+neuland-app-native://expo-development-client/?url=http%3A%2F%2F${devServerHost}%3A8081`

interface SimctlDevice {
	name: string
	state: string
	udid: string
}

interface SimctlDeviceList {
	devices: Record<string, SimctlDevice[]>
}

function getBootedIosSimulator(): SimctlDevice | undefined {
	const listResult = Bun.spawnSync({
		cmd: ['xcrun', 'simctl', 'list', 'devices', 'booted', '--json'],
		stdout: 'pipe',
		stderr: 'inherit'
	})

	if (!listResult.success) {
		return undefined
	}

	const list = JSON.parse(new TextDecoder().decode(listResult.stdout)) as SimctlDeviceList
	return Object.values(list.devices)
		.flat()
		.find(({ state }) => state === 'Booted')
}

function restartBootedIosSimulator(): SimctlDevice | undefined {
	const device = getBootedIosSimulator()

	if (!device) {
		console.error('No booted iOS simulator found.')
		return undefined
	}

	console.log(`Restarting ${device.name} to reset the XCTest automation service...`)
	const commands = [
		['xcrun', 'simctl', 'shutdown', device.udid],
		['xcrun', 'simctl', 'boot', device.udid],
		['xcrun', 'simctl', 'bootstatus', device.udid, '-b']
	]

	for (const cmd of commands) {
		const result = Bun.spawnSync({ cmd, stdout: 'inherit', stderr: 'inherit' })
		if (!result.success) {
			console.error(`Failed to restart iOS simulator while running: ${cmd.join(' ')}`)
			return undefined
		}
	}

	return device
}

function getConnectedAndroidDeviceId(): string | undefined {
	const result = Bun.spawnSync({
		cmd: ['adb', 'devices'],
		stdout: 'pipe',
		stderr: 'inherit'
	})

	if (!result.success) {
		return undefined
	}

	return new TextDecoder()
		.decode(result.stdout)
		.split('\n')
		.map((line) => line.trim().split(/\s+/))
		.find(([, state]) => state === 'device')?.[0]
}

function runFlow(flow: string, deviceId: string, retry = false): boolean {
	console.log(`\n=== Maestro${retry ? ' retry' : ''}: ${flow} ===`)

	const result = Bun.spawnSync({
		cmd: [
			'maestro',
			'test',
			'--device',
			deviceId,
			'--config=.maestro/config.yaml',
			'-e',
			`APP_ID=${appId}`,
			'-e',
			`DEV_CLIENT_URL=${DEV_CLIENT_URL}`,
			'-e',
			`DEV_SERVER_ADDRESS=${devServerAddress}`,
			`.maestro/flows/${flow}.yaml`
		],
		cwd: process.cwd(),
		env: process.env,
		stdout: 'inherit',
		stderr: 'inherit',
		timeout: 10 * 60 * 1000,
		killSignal: 'SIGKILL'
	})

	return result.success
}

const skipIosSimulatorRestart = process.env.MAESTRO_SKIP_SIMULATOR_RESTART === '1'
let deviceId = process.env.MAESTRO_DEVICE_ID

if (deviceId == null) {
	deviceId =
		suite === 'android'
			? getConnectedAndroidDeviceId()
			: skipIosSimulatorRestart
				? getBootedIosSimulator()?.udid
				: restartBootedIosSimulator()?.udid
	} else if (suite !== 'android' && !skipIosSimulatorRestart) {
	restartBootedIosSimulator()
}

if (deviceId == null) {
	console.error(`No ${suite === 'android' ? 'Android device' : 'iOS simulator'} available.`)
	process.exit(1)
}

let failures = flows.filter((flow) => !runFlow(flow, deviceId))

if (
	failures.length > 0 &&
	suite !== 'android' &&
	!skipIosSimulatorRestart &&
	restartBootedIosSimulator() != null
) {
	console.log(`\nRetrying ${failures.length} failed iOS flow(s) with a fresh XCTest service.`)
	failures = failures.filter((flow) => !runFlow(flow, deviceId, true))
}

if (failures.length > 0) {
	console.error(`\n${failures.length}/${flows.length} Maestro flows failed:`)
	for (const flow of failures) {
		console.error(`- ${flow}`)
	}
	process.exit(1)
}

console.log(`\nAll ${flows.length} Maestro flows passed.`)
