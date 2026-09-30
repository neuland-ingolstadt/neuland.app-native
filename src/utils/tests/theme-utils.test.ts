import { describe, expect, it } from 'bun:test'
import { resolveActiveTheme } from '@/utils/theme-utils'

describe('theme-utils', () => {
	it('resolveActiveTheme - Should keep an explicit light or dark theme', () => {
		expect(resolveActiveTheme('light', 'dark')).toBe('light')
		expect(resolveActiveTheme('dark', 'light')).toBe('dark')
	})

	it('resolveActiveTheme - Should follow the system color scheme for auto', () => {
		expect(resolveActiveTheme('auto', 'dark')).toBe('dark')
		expect(resolveActiveTheme('auto', 'light')).toBe('light')
		expect(resolveActiveTheme('auto', 'unspecified')).toBe('light')
	})
})
