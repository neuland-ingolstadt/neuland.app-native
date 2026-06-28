import { beforeAll, describe, expect, it, mock } from 'bun:test'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const platform = { OS: 'web' as 'web' | 'ios' | 'android' }

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: platform,
		Linking: { openURL: async () => {} }
	},
	Platform: platform,
	Linking: { openURL: async () => {} }
}))

let resolveAnnouncementPlatform: typeof import('../web-host').resolveAnnouncementPlatform
let getAnnouncementPlatform: typeof import('../web-host').getAnnouncementPlatform
let isDevNeulandHost: typeof import('../web-host').isDevNeulandHost
let resolveWebPlatform: typeof import('../web-host').resolveWebPlatform

beforeAll(async () => {
	const webHost = await import(`${SRC_ROOT}utils/web-host.ts`)
	resolveAnnouncementPlatform = webHost.resolveAnnouncementPlatform
	getAnnouncementPlatform = webHost.getAnnouncementPlatform
	isDevNeulandHost = webHost.isDevNeulandHost
	resolveWebPlatform = webHost.resolveWebPlatform
})

describe('web-host', () => {
	it('resolveWebPlatform - Should map dev.neuland.app to web-dev', () => {
		expect(resolveWebPlatform('dev.neuland.app')).toBe('web-dev')
	})

	it('resolveWebPlatform - Should map web.neuland.app to web', () => {
		expect(resolveWebPlatform('web.neuland.app')).toBe('web')
	})

	it('resolveWebPlatform - Should treat other hosts as web-local', () => {
		expect(resolveWebPlatform('localhost')).toBe('web-local')
		expect(resolveWebPlatform('127.0.0.1')).toBe('web-local')
	})

	it('isDevNeulandHost - Should only match dev.neuland.app', () => {
		expect(isDevNeulandHost('dev.neuland.app')).toBe(true)
		expect(isDevNeulandHost('web.neuland.app')).toBe(false)
	})

	it('resolveAnnouncementPlatform - Should map dev.neuland.app to WEB_DEV', () => {
		expect(resolveAnnouncementPlatform('dev.neuland.app')).toBe('WEB_DEV')
	})

	it('resolveAnnouncementPlatform - Should map web.neuland.app to WEB', () => {
		expect(resolveAnnouncementPlatform('web.neuland.app')).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should map localhost to WEB', () => {
		expect(resolveAnnouncementPlatform('localhost')).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should return IOS on iOS', () => {
		platform.OS = 'ios'
		expect(resolveAnnouncementPlatform()).toBe('IOS')
		platform.OS = 'web'
	})

	it('resolveAnnouncementPlatform - Should return ANDROID on Android', () => {
		platform.OS = 'android'
		expect(resolveAnnouncementPlatform()).toBe('ANDROID')
		platform.OS = 'web'
	})

	it('resolveAnnouncementPlatform - Should default to WEB when hostname is omitted', () => {
		expect(resolveAnnouncementPlatform()).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should read window.location.hostname when omitted', () => {
		const originalWindow = globalThis.window
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: { location: { hostname: 'dev.neuland.app' } }
		})

		try {
			expect(resolveAnnouncementPlatform()).toBe('WEB_DEV')
		} finally {
			if (originalWindow === undefined) {
				Reflect.deleteProperty(globalThis, 'window')
			} else {
				Object.defineProperty(globalThis, 'window', {
					configurable: true,
					value: originalWindow
				})
			}
		}
	})

	it('getAnnouncementPlatform - Should delegate to resolveAnnouncementPlatform', () => {
		expect(getAnnouncementPlatform()).toBe(resolveAnnouncementPlatform())
	})
})
