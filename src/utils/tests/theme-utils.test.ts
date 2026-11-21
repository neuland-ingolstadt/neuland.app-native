import { describe, expect, it } from 'bun:test'
import {
	resolveActiveTheme,
	resolvePersistedThemeColor
} from '@/utils/theme-utils'

describe('theme-utils', () => {
	it('resolveActiveTheme - Should keep an explicit light or dark theme', () => {
		expect(resolveActiveTheme('light', 'dark')).toBe('light')
		expect(resolveActiveTheme('dark', 'light')).toBe('dark')
	})

	it('resolveActiveTheme - Should follow the system color scheme for auto', () => {
		expect(resolveActiveTheme('auto', 'dark')).toBe('dark')
		expect(resolveActiveTheme('auto', 'light')).toBe('light')
		expect(resolveActiveTheme('auto', null)).toBe('light')
		expect(resolveActiveTheme('auto', undefined)).toBe('light')
	})

	it('resolvePersistedThemeColor - Should keep unlocked orange and member accents', () => {
		expect(resolvePersistedThemeColor('orange', true)).toBe('orange')
		expect(resolvePersistedThemeColor('green', false)).toBe('green')
		expect(resolvePersistedThemeColor('purple', true)).toBe('purple')
		expect(resolvePersistedThemeColor('blue', false)).toBe('blue')
	})

	it('resolvePersistedThemeColor - Should drop locked orange and unknown accents', () => {
		expect(resolvePersistedThemeColor('orange', false)).toBeUndefined()
		expect(resolvePersistedThemeColor('magenta', true)).toBeUndefined()
		expect(resolvePersistedThemeColor(undefined, true)).toBeUndefined()
	})
})
