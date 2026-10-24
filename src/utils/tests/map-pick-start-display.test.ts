import { beforeAll, describe, expect, it } from 'bun:test'
import { SEARCH_TYPES } from '@/types/map'
import {
	loadIndoorDataFromAssets,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'
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

describe('pickStartMapElement from indoor graph', () => {
	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
	})

	it('returns null for unknown start nodes', () => {
		expect(pickStartMapElement(true, null, 'room:EG:NOPE', null)).toBeNull()
	})

	it('pins the start room from the graph', () => {
		const element = pickStartMapElement(true, null, 'room:EG:G001', null)
		expect(element).toMatchObject({
			type: SEARCH_TYPES.ROOM,
			data: 'G001',
			manual: true
		})
		expect(element?.center).toHaveLength(2)
	})

	it('hides the start pin when it matches the destination room', () => {
		expect(pickStartMapElement(true, 'G001', 'room:EG:G001', null)).toBeNull()
	})

	it('pins building entrances as building markers', () => {
		const element = pickStartMapElement(true, null, 'entrance:IN-G-E01', null)
		expect(element).toMatchObject({
			type: SEARCH_TYPES.BUILDING,
			data: 'entrance:IN-G-E01',
			manual: true
		})
		expect(element?.center).toHaveLength(2)
	})
})
