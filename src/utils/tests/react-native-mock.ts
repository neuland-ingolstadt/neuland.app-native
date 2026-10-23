import { mock } from 'bun:test'

type PlatformSelectSpec<T> = { [platform: string]: T | undefined; default?: T }

export const reactNativePlatform = {
	OS: 'web' as 'web' | 'ios' | 'android',
	select<T>(spec: PlatformSelectSpec<T>): T | undefined {
		if (Object.hasOwn(spec, this.OS)) {
			return spec[this.OS]
		}
		return spec.default
	}
}

export const reactNativeShareMock = mock(async () => {})
export const reactNativeOpenURLMock = mock(async () => {})

class ReactNativeNativeEventEmitter {
	addListener() {
		return { remove: () => {} }
	}
	removeAllListeners() {}
}

const turboModuleRegistry = {
	get: () => null,
	getEnforcing: () => null
}

const appState = {
	currentState: 'active' as string,
	addEventListener: () => ({ remove: () => {} })
}

export function buildReactNativeMock() {
	const platform = reactNativePlatform
	const share = { share: reactNativeShareMock }
	const linking = { openURL: reactNativeOpenURLMock }
	const styleSheet = {
		create: (styles: unknown) => styles,
		hairlineWidth: 1
	}

	const exports = {
		__esModule: true as const,
		Platform: platform,
		Share: share,
		Linking: linking,
		AppState: appState,
		NativeEventEmitter: ReactNativeNativeEventEmitter,
		TurboModuleRegistry: turboModuleRegistry,
		NativeModules: {},
		StyleSheet: styleSheet
	}

	return {
		...exports,
		default: exports
	}
}

export function mockReactNative() {
	void mock.module('react-native', () => buildReactNativeMock())
}
