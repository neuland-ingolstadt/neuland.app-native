import { beforeAll, describe, expect, it, mock } from 'bun:test'

const impactAsyncMock = mock(async () => {})
const randomizeColorMock = mock(() => {})
const onBounceMock = mock(() => {})

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'ios' },
		Share: { share: () => Promise.resolve() },
		Linking: { openURL: async () => {} },
		NativeEventEmitter: class {
			addListener() {
				return { remove: () => {} }
			}
			removeAllListeners() {}
		},
		TurboModuleRegistry: {
			get: () => null,
			getEnforcing: () => null
		}
	},
	Platform: { OS: 'ios' },
	Share: { share: () => Promise.resolve() },
	Linking: { openURL: async () => {} },
	NativeModules: {},
	NativeEventEmitter: class {
		addListener() {
			return { remove: () => {} }
		}
		removeAllListeners() {}
	},
	TurboModuleRegistry: {
		get: () => null,
		getEnforcing: () => null
	}
}))

mock.module('expo-clipboard', () => ({
	setStringAsync: async () => {}
}))

mock.module('burnt', () => ({
	toast: () => {}
}))

mock.module('i18next', () => ({
	t: (key: string) => key
}))

mock.module('@aptabase/react-native', () => ({
	trackEvent: () => {}
}))

mock.module('expo-haptics', () => ({
	ImpactFeedbackStyle: { Light: 'light' },
	impactAsync: impactAsyncMock
}))

mock.module('react-native-reanimated', () => ({
	defineAnimation: <T>(_initial: T, factory: () => T) => factory(),
	runOnJS: <T extends (...args: never[]) => unknown>(fn: T) => fn
}))

let animationUtils: typeof import('../animation-utils')

beforeAll(async () => {
	animationUtils = await import('../animation-utils')
})

describe('animation-utils', () => {
	it('withBouncing - Should initialise state within the configured bounds', () => {
		const animation = animationUtils.withBouncing(
			40,
			0,
			100,
			randomizeColorMock,
			onBounceMock
		)

		expect(typeof animation).toBe('object')
		if (typeof animation === 'number') {
			throw new Error('Expected animation callbacks')
		}

		const state = {
			current: 0,
			lastTimestamp: 1000,
			direction: -1
		}

		animation.onStart(state, 0, 2000)

		expect(state.current).toBe(80)
		expect(state.lastTimestamp).toBe(2000)
		expect(state.direction).toBe(1)
	})

	it('withBouncing - Should reverse direction and trigger bounce handlers at the top bound', () => {
		randomizeColorMock.mockReset()
		onBounceMock.mockReset()
		impactAsyncMock.mockReset()

		const animation = animationUtils.withBouncing(
			50,
			0,
			100,
			randomizeColorMock,
			onBounceMock
		)

		if (typeof animation === 'number') {
			throw new Error('Expected animation callbacks')
		}

		const state = {
			current: 95,
			lastTimestamp: 0,
			direction: 1
		}

		const keepRunning = animation.onFrame(state, 1000)

		expect(keepRunning).toBe(false)
		expect(state.direction).toBe(-1)
		expect(state.current).toBe(100)
		expect(randomizeColorMock).toHaveBeenCalled()
		expect(onBounceMock).toHaveBeenCalled()
		expect(impactAsyncMock).toHaveBeenCalled()
	})

	it('withBouncing - Should clamp and reverse direction at the bottom bound', () => {
		randomizeColorMock.mockReset()

		const animation = animationUtils.withBouncing(
			60,
			10,
			90,
			randomizeColorMock
		)

		if (typeof animation === 'number') {
			throw new Error('Expected animation callbacks')
		}

		const state = {
			current: 12,
			lastTimestamp: 0,
			direction: -1
		}

		animation.onFrame(state, 1000)

		expect(state.direction).toBe(1)
		expect(state.current).toBe(10)
		expect(randomizeColorMock).toHaveBeenCalled()
	})
})
