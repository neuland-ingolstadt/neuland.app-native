import { describe, expect, it } from 'bun:test'
import { toColor } from '@/utils/uniwind-utils'

describe('uniwind-utils', () => {
	it('toColor - Should return undefined for nullish values', () => {
		expect(toColor(undefined)).toBeUndefined()
	})

	it('toColor - Should stringify numeric colors', () => {
		expect(toColor(0xff0000)).toBe(String(0xff0000))
	})

	it('toColor - Should pass string colors through', () => {
		expect(toColor('#ff0000')).toBe('#ff0000')
		expect(toColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)')
	})
})
