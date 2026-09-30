import { afterEach, describe, expect, it, mock } from 'bun:test'
import { Platform } from 'react-native'

let measuredHeaderHeight = 0

mock.module('expo-router/react-navigation', () => ({
	useHeaderHeight: () => measuredHeaderHeight
}))

mock.module('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}))

const {
	getFormSheetHeaderPadding,
	IOS_26_FORM_SHEET_HEADER_HEIGHT,
	isIos26OrLater,
	useFormSheetHeaderPadding,
	useTransparentHeaderStyle
} = await import('@/hooks/useTransparentHeader')

const originalOS = Platform.OS
const originalVersion = Object.getOwnPropertyDescriptor(Platform, 'Version')

afterEach(() => {
	Platform.OS = originalOS
	if (originalVersion) {
		Object.defineProperty(Platform, 'Version', originalVersion)
	} else {
		Reflect.deleteProperty(Platform, 'Version')
	}
	measuredHeaderHeight = 0
})

describe('isIos26OrLater', () => {
	it('is true on iOS 26+', () => {
		Platform.OS = 'ios'
		Object.defineProperty(Platform, 'Version', {
			value: '27.0',
			configurable: true
		})
		expect(isIos26OrLater()).toBe(true)
	})

	it('is false before iOS 26', () => {
		Platform.OS = 'ios'
		Object.defineProperty(Platform, 'Version', {
			value: '18.4',
			configurable: true
		})
		expect(isIos26OrLater()).toBe(false)
	})
})

describe('getFormSheetHeaderPadding', () => {
	it('returns 0 before iOS 26 so non-overlay headers keep native spacing', () => {
		expect(getFormSheetHeaderPadding(0, false)).toBe(0)
		expect(getFormSheetHeaderPadding(54, false)).toBe(0)
	})

	it('uses the liquid-glass form-sheet header height when native height is missing', () => {
		expect(getFormSheetHeaderPadding(0, true)).toBe(
			IOS_26_FORM_SHEET_HEADER_HEIGHT
		)
	})

	it('raises undersized measured heights to the overlay header height', () => {
		expect(getFormSheetHeaderPadding(44, true)).toBe(
			IOS_26_FORM_SHEET_HEADER_HEIGHT
		)
	})

	it('keeps a larger measured header height', () => {
		expect(getFormSheetHeaderPadding(88, true)).toBe(88)
	})
})

describe('useFormSheetHeaderPadding', () => {
	it.each([0, 44, 56, 88])(
		'reserves at least 56 points on iOS 26 with measured height %i',
		(height) => {
			Platform.OS = 'ios'
			Object.defineProperty(Platform, 'Version', {
				value: '26.5',
				configurable: true
			})
			measuredHeaderHeight = height

			expect(useFormSheetHeaderPadding()).toBe(height > 56 ? height : 56)
		}
	)

	it.each([
		['ios', '18.4'],
		['android', 36],
		['web', '26']
	] as const)('preserves native spacing on %s %s', (os, version) => {
		Platform.OS = os
		Object.defineProperty(Platform, 'Version', {
			value: version,
			configurable: true
		})
		measuredHeaderHeight = 88

		expect(useFormSheetHeaderPadding()).toBe(0)
	})
})

describe('useTransparentHeaderStyle', () => {
	it('enables a transparent overlay header on iOS 26+', () => {
		Platform.OS = 'ios'
		Object.defineProperty(Platform, 'Version', {
			value: '27.0',
			configurable: true
		})

		expect(useTransparentHeaderStyle()).toEqual({
			headerTransparent: true,
			headerStyle: { backgroundColor: 'transparent' }
		})
	})

	it('leaves header chrome alone before iOS 26', () => {
		Platform.OS = 'ios'
		Object.defineProperty(Platform, 'Version', {
			value: '18.4',
			configurable: true
		})

		expect(useTransparentHeaderStyle()).toEqual({})
	})
})
