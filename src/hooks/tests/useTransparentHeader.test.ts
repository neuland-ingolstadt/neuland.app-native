import { beforeAll, describe, expect, it, mock } from 'bun:test'

mock.module('expo-router/react-navigation', () => ({
	useHeaderHeight: () => 0
}))

mock.module('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}))

let getFormSheetHeaderPadding: typeof import('../useTransparentHeader').getFormSheetHeaderPadding
let IOS_26_FORM_SHEET_HEADER_HEIGHT: typeof import('../useTransparentHeader').IOS_26_FORM_SHEET_HEADER_HEIGHT

beforeAll(async () => {
	const module = await import('../useTransparentHeader')
	getFormSheetHeaderPadding = module.getFormSheetHeaderPadding
	IOS_26_FORM_SHEET_HEADER_HEIGHT = module.IOS_26_FORM_SHEET_HEADER_HEIGHT
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
