import { describe, expect, it } from 'bun:test'
import { isDevNeulandHost, resolveWebPlatform } from '../web-host'

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
})
