import { describe, expect, it } from 'bun:test'
import { buildPresentationMode } from '@/utils/presentation-mode'

const base = {
	cardColor: '#ffffff',
	backgroundColor: '#f2f2f2'
}

describe('buildPresentationMode', () => {
	it('returns no options off iOS', () => {
		expect(
			buildPresentationMode(false, {
				platformOS: 'android',
				ios26OrLater: true,
				deviceType: 'Handset',
				...base
			})
		).toEqual({})
	})

	it('uses a plain modal on macOS Catalyst desktops', () => {
		expect(
			buildPresentationMode(false, {
				platformOS: 'ios',
				ios26OrLater: true,
				deviceType: 'Desktop',
				...base
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
				...base
			})
		).toEqual({
			presentation: 'formSheet',
			sheetAllowedDetents: [0.7, 0.95],
			sheetInitialDetentIndex: 0,
			headerStyle: { backgroundColor: base.cardColor },
			contentStyle: { backgroundColor: base.backgroundColor }
		})
	})

	it('uses transparent liquid-glass chrome with a hard top edge on iOS 26+', () => {
		const options = buildPresentationMode(false, {
			platformOS: 'ios',
			ios26OrLater: true,
			deviceType: 'Handset',
			...base
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
				...base
			}).sheetAllowedDetents
		).toEqual([0.5, 0.7])
	})
})
