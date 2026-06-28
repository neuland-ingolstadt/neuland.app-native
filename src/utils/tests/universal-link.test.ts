import { describe, expect, it } from 'bun:test'
import { isNeulandAppHost } from '@/utils/neuland-hosts'
import {
	normalizeRoutePath,
	parseUniversalLinkPath
} from '@/utils/universal-link'

describe('parseUniversalLinkPath', () => {
	it('parses dev host paths', () => {
		expect(
			parseUniversalLinkPath('https://dev.neuland.app/member/office-toggle')
		).toBe('member/office-toggle')
	})

	it('parses web host paths with query params', () => {
		expect(
			parseUniversalLinkPath('https://web.neuland.app/food/123?ref=qr')
		).toBe('food/123?ref=qr')
	})

	it('returns null for unrelated hosts', () => {
		expect(parseUniversalLinkPath('https://example.com/member')).toBeNull()
	})

	it('returns null for host root paths', () => {
		expect(parseUniversalLinkPath('https://dev.neuland.app/')).toBeNull()
	})

	it('returns null for invalid urls', () => {
		expect(parseUniversalLinkPath('not-a-url')).toBeNull()
	})

	it('ignores hash fragments', () => {
		expect(
			parseUniversalLinkPath('https://web.neuland.app/member#section')
		).toBe('member')
	})
})

describe('normalizeRoutePath', () => {
	it('strips leading and trailing slashes', () => {
		expect(normalizeRoutePath('/member/office-toggle/')).toBe(
			'member/office-toggle'
		)
	})
})

describe('isNeulandAppHost', () => {
	it('matches dev and web hosts only', () => {
		expect(isNeulandAppHost('dev.neuland.app')).toBe(true)
		expect(isNeulandAppHost('web.neuland.app')).toBe(true)
		expect(isNeulandAppHost('localhost')).toBe(false)
	})
})
