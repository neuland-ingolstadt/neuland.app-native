import { beforeAll, describe, expect, it, mock } from 'bun:test'

mock.module('react-native-device-info', () => ({
	default: {
		getDeviceType: () => 'Handset'
	}
}))

mock.module('uniwind', () => ({
	useCSSVariable: () => '#ffffff'
}))

mock.module('@/utils/uniwind-utils', () => ({
	toColor: (value: unknown) => value
}))

mock.module('@/hooks/useTransparentHeader', () => ({
	isIos26OrLater: () => false
}))

let buildPresentationMode: typeof import('@/hooks/usePresentationMode').buildPresentationMode

beforeAll(async () => {
	;({ buildPresentationMode } = await import('@/hooks/usePresentationMode'))
})

const colors = {
	cardColor: '#ffffff',
	backgroundColor: '#f2f2f2'
}

describe('buildPresentationMode', () => {
	it('returns no options off iOS', () => {
		expect(
			buildPresentationMode(false, {
				platformOS: 'android',
				ios26OrLater: true,
				colors
			})
		).toEqual({})
	})

	it('uses a plain modal on macOS Catalyst desktops', () => {
		expect(
			buildPresentationMode(false, {
				platformOS: 'ios',
				ios26OrLater: true,
				deviceType: 'Desktop',
				colors
			})
		).toEqual({
			presentation: 'modal'
		})
	})

	it('keeps opaque sheet chrome before iOS 26', () => {
		expect(
			buildPresentationMode(false, {
				platformOS: 'ios',
				ios26OrLater: false,
				deviceType: 'Handset',
				colors
			})
		).toEqual({
			presentation: 'formSheet',
			sheetAllowedDetents: [0.7, 0.95],
			sheetInitialDetentIndex: 0,
			headerStyle: { backgroundColor: colors.cardColor },
			contentStyle: { backgroundColor: colors.backgroundColor }
		})
	})

	it('uses transparent liquid-glass chrome with a hard top edge on iOS 26+', () => {
		const options = buildPresentationMode(false, {
			platformOS: 'ios',
			ios26OrLater: true,
			deviceType: 'Handset',
			colors
		})

		expect(options).toEqual({
			presentation: 'formSheet',
			sheetAllowedDetents: [0.7, 0.95],
			sheetInitialDetentIndex: 0,
			headerTransparent: true,
			headerStyle: { backgroundColor: 'transparent' },
			contentStyle: { backgroundColor: 'transparent' },
			scrollEdgeEffects: { top: 'hard' }
		})
		// soft looked fully clear under scrolling content on iOS 27 sheets
		expect(options.scrollEdgeEffects?.top).not.toBe('soft')
	})

	it('keeps smaller detents for compact sheets', () => {
		expect(
			buildPresentationMode(true, {
				platformOS: 'ios',
				ios26OrLater: true,
				deviceType: 'Handset',
				colors
			}).sheetAllowedDetents
		).toEqual([0.5, 0.7])
	})
})
