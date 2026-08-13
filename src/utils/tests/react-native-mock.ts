import { mock } from 'bun:test'

export const reactNativePlatform = {
	OS: 'web' as 'web' | 'ios' | 'android'
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

export function buildReactNativeMock() {
	const platform = reactNativePlatform
	const share = { share: reactNativeShareMock }
	const linking = { openURL: reactNativeOpenURLMock }

	return {
		__esModule: true as const,
		default: {
			Platform: platform,
			Share: share,
			Linking: linking,
			NativeEventEmitter: ReactNativeNativeEventEmitter,
			TurboModuleRegistry: turboModuleRegistry,
			NativeModules: {},
			StyleSheet: {
				create: (styles: unknown) => styles,
				hairlineWidth: 1
			}
		},
		Platform: platform,
		Share: share,
		Linking: linking,
		NativeEventEmitter: ReactNativeNativeEventEmitter,
		TurboModuleRegistry: turboModuleRegistry,
		NativeModules: {},
		StyleSheet: {
			create: (styles: unknown) => styles,
			hairlineWidth: 1
		}
	}
}

export function mockReactNative() {
	mock.module('react-native', () => buildReactNativeMock())
}
