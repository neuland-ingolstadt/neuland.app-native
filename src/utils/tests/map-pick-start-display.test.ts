import { describe, expect, it } from 'bun:test'
import { SEARCH_TYPES } from '@/types/map'
import { pickStartMapElement } from '@/utils/map-pick-start-display'

describe('pickStartMapElement', () => {
	it('returns null when pick-start is inactive', () => {
		expect(
			pickStartMapElement(false, 'G123', 'room:EG:G123', {
				type: SEARCH_TYPES.ROOM,
				data: 'G456',
				manual: true
			})
		).toBeNull()
	})

	it('keeps map selection when it differs from destination', () => {
		const start = {
			type: SEARCH_TYPES.ROOM,
			data: 'G456',
			center: [11.43, 48.76] as [number, number],
			manual: true
		}
		expect(pickStartMapElement(true, 'G123', 'room:EG:G456', start)).toBe(start)
	})

	it('hides duplicate pin when start room equals destination', () => {
		const same = {
			type: SEARCH_TYPES.ROOM,
			data: 'G123',
			manual: true
		}
		expect(pickStartMapElement(true, 'G123', 'room:EG:G123', same)).toBeNull()
	})
})
