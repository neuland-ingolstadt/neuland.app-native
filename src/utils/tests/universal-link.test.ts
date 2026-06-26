import { describe, expect, it } from 'bun:test'
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
})

describe('normalizeRoutePath', () => {
	it('strips leading and trailing slashes', () => {
		expect(normalizeRoutePath('/member/office-toggle/')).toBe(
			'member/office-toggle'
		)
	})
})
