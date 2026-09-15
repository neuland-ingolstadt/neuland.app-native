import { afterEach, describe, expect, it, mock } from 'bun:test'
import { Platform } from 'react-native'

let measuredHeaderHeight = 0

mock.module('expo-router/react-navigation', () => ({
	useHeaderHeight: () => measuredHeaderHeight
}))

mock.module('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}))

const { useFormSheetHeaderPadding } = await import(
	'@/hooks/useTransparentHeader'
)
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
