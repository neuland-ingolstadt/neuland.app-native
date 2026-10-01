import { beforeAll, describe, expect, it } from 'bun:test'
import { reactNativePlatform } from './react-native-mock'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

let getEvaluationPlatform: typeof import('../evaluation-platform').getEvaluationPlatform

beforeAll(async () => {
	const module = await import(`${SRC_ROOT}utils/evaluation-platform.ts`)
	getEvaluationPlatform = module.getEvaluationPlatform
})

describe('evaluation-platform', () => {
	it('getEvaluationPlatform - Should return ios on iOS', () => {
		reactNativePlatform.OS = 'ios'
		expect(getEvaluationPlatform()).toBe('ios')
		reactNativePlatform.OS = 'web'
	})

	it('getEvaluationPlatform - Should return android on Android', () => {
		reactNativePlatform.OS = 'android'
		expect(getEvaluationPlatform()).toBe('android')
		reactNativePlatform.OS = 'web'
	})

	it('getEvaluationPlatform - Should resolve web hosts from window.location', () => {
		reactNativePlatform.OS = 'web'
		const originalWindow = globalThis.window
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: { location: { hostname: 'dev.neuland.app' } }
		})

		try {
			expect(getEvaluationPlatform()).toBe('web-dev')
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

	it('getEvaluationPlatform - Should fall back to web-local without window', () => {
		reactNativePlatform.OS = 'web'
		const originalWindow = globalThis.window
		Reflect.deleteProperty(globalThis, 'window')

		try {
			expect(getEvaluationPlatform()).toBe('web-local')
		} finally {
			if (originalWindow !== undefined) {
				Object.defineProperty(globalThis, 'window', {
					configurable: true,
					value: originalWindow
				})
			}
		}
	})
})
