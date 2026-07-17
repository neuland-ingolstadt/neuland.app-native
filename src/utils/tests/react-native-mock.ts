import { mock } from 'bun:test'

const platform = { OS: 'web' as 'web' | 'ios' | 'android' }

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: platform,
		Share: { share: async () => {} },
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
	Platform: platform,
	Share: { share: async () => {} },
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
}))
