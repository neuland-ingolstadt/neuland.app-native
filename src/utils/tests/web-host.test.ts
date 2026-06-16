import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { Platform as AnnouncementPlatformEnum } from '@/__generated__/gql/graphql'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const platform = { OS: 'web' as 'web' | 'ios' | 'android' }

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: platform
	},
	Platform: platform
}))

let resolveAnnouncementPlatform: typeof import('../web-host').resolveAnnouncementPlatform
let isDevNeulandHost: typeof import('../web-host').isDevNeulandHost
let resolveWebPlatform: typeof import('../web-host').resolveWebPlatform

beforeAll(async () => {
	const webHost = await import(`${SRC_ROOT}utils/web-host.ts`)
	resolveAnnouncementPlatform = webHost.resolveAnnouncementPlatform
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
		expect(resolveAnnouncementPlatform('dev.neuland.app')).toBe(
			AnnouncementPlatformEnum.WebDev
		)
	})

	it('resolveAnnouncementPlatform - Should map web.neuland.app to WEB', () => {
		expect(resolveAnnouncementPlatform('web.neuland.app')).toBe(
			AnnouncementPlatformEnum.Web
		)
	})

	it('resolveAnnouncementPlatform - Should map localhost to WEB', () => {
		expect(resolveAnnouncementPlatform('localhost')).toBe(
			AnnouncementPlatformEnum.Web
		)
	})

	it('resolveAnnouncementPlatform - Should return IOS on iOS', () => {
		platform.OS = 'ios'
		expect(resolveAnnouncementPlatform()).toBe(AnnouncementPlatformEnum.Ios)
		platform.OS = 'web'
	})

	it('resolveAnnouncementPlatform - Should return ANDROID on Android', () => {
		platform.OS = 'android'
		expect(resolveAnnouncementPlatform()).toBe(AnnouncementPlatformEnum.Android)
		platform.OS = 'web'
	})
})
