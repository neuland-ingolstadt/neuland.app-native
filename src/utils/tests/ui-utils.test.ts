import { beforeAll, describe, expect, it, mock } from 'bun:test'

const clipboardSetStringAsyncMock = mock(async () => {})
const toastMock = mock(() => {})

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'ios' },
		Share: { share: () => Promise.resolve() },
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
	Platform: { OS: 'ios' },
	Share: { share: () => Promise.resolve() },
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

mock.module('expo-clipboard', () => ({
	setStringAsync: clipboardSetStringAsyncMock
}))

mock.module('burnt', () => ({
	toast: toastMock
}))

mock.module('i18next', () => ({
	t: (key: string) => key
}))

mock.module('@aptabase/react-native', () => ({
	trackEvent: () => {}
}))

let uiUtils: typeof import('../ui-utils')

beforeAll(async () => {
	uiUtils = await import('../ui-utils')
})

describe('ui-utils', () => {
	it('getInitials - Should return the initials for a two-word name', () => {
		expect(uiUtils.getInitials('John Doe')).toBe('JD')
	})

	it('getInitials - Should return the first letter for a single-word name', () => {
		expect(uiUtils.getInitials('Madonna')).toBe('M')
	})

	it('getContrastColor - Should return black for light backgrounds', () => {
		expect(uiUtils.getContrastColor('#ffffff')).toBe('#000000')
	})

	it('getContrastColor - Should return white for dark backgrounds', () => {
		expect(uiUtils.getContrastColor('#000000')).toBe('#ffffff')
	})

	it('lighten - Should lighten a color by the given percentage', () => {
		expect(uiUtils.lighten(0.5, '#000000')).toBe('#808080')
	})

	it('getStatusBarStyle - Should map light and dark themes correctly', () => {
		expect(uiUtils.getStatusBarStyle('light', false, false)).toBe('dark')
		expect(uiUtils.getStatusBarStyle('dark', false, false)).toBe('light')
	})

	it('getStatusBarStyle - Should respect Android and auto theme handling', () => {
		expect(uiUtils.getStatusBarStyle('auto', true, true)).toBe('light')
		expect(uiUtils.getStatusBarStyle('auto', true, false)).toBe('dark')
		expect(uiUtils.getStatusBarStyle('auto', false, false)).toBe('auto')
	})

	it('inverseColor - Should use dedicated fallback colors for black and white', () => {
		expect(uiUtils.inverseColor('#ffffff')).toBe('#c3edff')
		expect(uiUtils.inverseColor('#000000')).toBe('#4c8eaa')
	})

	it('inverseColor - Should invert arbitrary colors', () => {
		expect(uiUtils.inverseColor('#123456')).not.toBe('#123456')
		expect(uiUtils.inverseColor('#123456')).not.toBe('')
	})

	it('getRandomHSLColor - Should return a valid HSL color string', () => {
		expect(uiUtils.getRandomHSLColor()).toMatch(/^hsl\(.+\)$/)
	})

	it('copyToClipboard - Should copy text and show a toast on iOS', async () => {
		await uiUtils.copyToClipboard('THI')

		expect(clipboardSetStringAsyncMock).toHaveBeenCalledWith('THI')
		expect(toastMock).toHaveBeenCalled()
	})

	it('copyToClipboard - Should return early for empty strings', async () => {
		clipboardSetStringAsyncMock.mockReset()
		toastMock.mockReset()

		await uiUtils.copyToClipboard('')

		expect(clipboardSetStringAsyncMock).not.toHaveBeenCalled()
		expect(toastMock).not.toHaveBeenCalled()
	})
})
