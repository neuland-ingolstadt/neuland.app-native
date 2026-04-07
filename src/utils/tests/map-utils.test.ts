import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { SEARCH_TYPES } from '@/types/map'

const UTILS_ROOT = new URL('../', import.meta.url).pathname

mock.module(`${UTILS_ROOT}../localization/i18n.ts`, () => ({
	default: { language: 'de' }
}))

mock.module('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'de' }]
}))

mock.module('react-i18next', () => ({
	initReactI18next: {}
}))

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'web' },
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
	Platform: { OS: 'web' },
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

mock.module('@aptabase/react-native', () => ({
	trackEvent: () => {}
}))

mock.module(`${UTILS_ROOT}date-utils.ts`, () => ({
	formatISODate: (date: Date) => {
		const year = date.getFullYear().toString().padStart(4, '0')
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		return `${year}-${month}-${day}`
	}
}))

let mapUtils: typeof import('../map-utils')

beforeAll(async () => {
	mapUtils = await import('../map-utils')
})

describe('map-utils', () => {
	it('addMinutes - Should add positive minutes correctly', () => {
		const date = new Date('2026-04-07T08:00:00')
		const result = mapUtils.addMinutes(date, 45)
		expect(result.getFullYear()).toBe(2026)
		expect(result.getMonth()).toBe(3)
		expect(result.getDate()).toBe(7)
		expect(result.getHours()).toBe(8)
		expect(result.getMinutes()).toBe(45)
	})

	it('addMinutes - Should subtract minutes correctly', () => {
		const date = new Date('2026-04-07T08:00:00')
		const result = mapUtils.addMinutes(date, -30)
		expect(result.getFullYear()).toBe(2026)
		expect(result.getMonth()).toBe(3)
		expect(result.getDate()).toBe(7)
		expect(result.getHours()).toBe(7)
		expect(result.getMinutes()).toBe(30)
	})

	it('getRoomOpenings - Should merge overlapping openings within the gap threshold', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'Seminarraum (< 40 Plätze)',
						stunden: [
							{
								von: '2026-04-07T08:00:00',
								bis: '2026-04-07T09:00:00',
								type: 'Seminarraum (< 40 Plätze)',
								raeume: [['', '', 101, 30]]
							},
							{
								von: '2026-04-07T09:10:00',
								bis: '2026-04-07T10:00:00',
								type: 'Seminarraum (< 40 Plätze)',
								raeume: [['', '', 101, 30]]
							},
							{
								von: '2026-04-07T10:20:00',
								bis: '2026-04-07T11:00:00',
								type: 'Seminarraum (< 40 Plätze)',
								raeume: [['', '', 101, 30]]
							},
							{
								von: '2026-04-07T12:00:00',
								bis: '2026-04-07T13:00:00',
								type: 'Seminarraum (< 40 Plätze)',
								raeume: [['', '', 0, 999]]
							}
						]
					}
				]
			}
		]

		const openings = mapUtils.getRoomOpenings(
			data as never,
			new Date('2026-04-07')
		)
		expect(openings['101']).toHaveLength(2)
		expect(openings['101'][0].type).toBe('Seminarraum')
		expect(openings['101'][0].from.getHours()).toBe(8)
		expect(openings['101'][0].from.getMinutes()).toBe(0)
		expect(openings['101'][0].until.getHours()).toBe(10)
		expect(openings['101'][0].until.getMinutes()).toBe(0)
		expect(openings.Alle).toHaveLength(1)
		expect(openings.Alle[0].capacity).toBe(999)
	})

	it('getRoomOpenings - Should keep separate openings for non-overlapping slots', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T08:00:00',
								bis: '2026-04-07T09:00:00',
								type: 'PC-Pool',
								raeume: [['', '', 110, 20]]
							},
							{
								von: '2026-04-07T12:00:00',
								bis: '2026-04-07T13:00:00',
								type: 'PC-Pool',
								raeume: [['', '', 110, 20]]
							}
						]
					}
				]
			}
		]

		const openings = mapUtils.getRoomOpenings(
			data as never,
			new Date('2026-04-07')
		)
		expect(openings['110']).toHaveLength(2)
		expect(openings['110'][0].from.getHours()).toBe(8)
		expect(openings['110'][1].from.getHours()).toBe(12)
	})

	it('searchRooms - Should return all rooms when no building filter is provided', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T08:00:00',
								bis: '2026-04-07T12:00:00',
								type: 'PC-Pool',
								raeume: [
									['', '', 'A101', 20],
									['', '', 'B201', 15]
								]
							}
						]
					}
				]
			}
		]

		const beginDate = new Date('2026-04-07T09:00:00')
		const endDate = new Date('2026-04-07T10:30:00')
		const allRooms = mapUtils.searchRooms(data as never, beginDate, endDate)
		expect(allRooms).toHaveLength(2)
	})

	it('searchRooms - Should filter rooms by building prefix', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T08:00:00',
								bis: '2026-04-07T12:00:00',
								type: 'PC-Pool',
								raeume: [
									['', '', 'A101', 20],
									['', '', 'B201', 15]
								]
							}
						]
					}
				]
			}
		]

		const beginDate = new Date('2026-04-07T09:00:00')
		const endDate = new Date('2026-04-07T10:30:00')
		const onlyA = mapUtils.searchRooms(data as never, beginDate, endDate, 'A')
		expect(onlyA).toHaveLength(1)
		expect(onlyA[0].room).toBe('A101')

		const onlyB = mapUtils.searchRooms(data as never, beginDate, endDate, 'B')
		expect(onlyB).toHaveLength(1)
		expect(onlyB[0].room).toBe('B201')
	})

	it('searchRooms - Should ignore rooms outside the requested time window', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T08:00:00',
								bis: '2026-04-07T09:00:00',
								type: 'PC-Pool',
								raeume: [['', '', 'A101', 20]]
							}
						]
					}
				]
			}
		]

		const beginDate = new Date('2026-04-07T09:15:00')
		const endDate = new Date('2026-04-07T10:30:00')
		expect(
			mapUtils.searchRooms(data as never, beginDate, endDate)
		).toHaveLength(0)
	})

	it('filterRooms - Should calculate the end date from duration', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T10:00:00',
								bis: '2026-04-07T12:00:00',
								type: 'PC-Pool',
								raeume: [['', '', 105, 24]]
							}
						]
					}
				]
			}
		]

		const results = mapUtils.filterRooms(
			data as never,
			'2026-04-07',
			'10:15',
			mapUtils.BUILDINGS_ALL,
			'01:00'
		)
		expect(results).toHaveLength(1)
		expect(results[0].room).toBe('105')
	})

	it('filterRooms - Should respect the requested building filter', () => {
		const data = [
			{
				datum: '2026-04-07T00:00:00',
				rtypes: [
					{
						raumtyp: 'PC-Pool',
						stunden: [
							{
								von: '2026-04-07T10:00:00',
								bis: '2026-04-07T12:00:00',
								type: 'PC-Pool',
								raeume: [['', '', 'A105', 24]]
							}
						]
					}
				]
			}
		]

		const results = mapUtils.filterRooms(
			data as never,
			'2026-04-07',
			'10:15',
			'A',
			'01:00'
		)
		expect(results).toHaveLength(1)
		expect(results[0].room).toBe('A105')
	})

	it('getCenter - Should calculate the average center across rooms', () => {
		const rooms = [
			[
				[
					[0, 0],
					[2, 0],
					[2, 2],
					[0, 2]
				]
			],
			[
				[
					[2, 2],
					[4, 2],
					[4, 4],
					[2, 4]
				]
			]
		]
		const center = mapUtils.getCenter(rooms as never)
		expect(center[0]).toBe(2)
		expect(center[1]).toBe(2)
	})

	it('getCenterSingle - Should fall back to the Ingolstadt center when coordinates are missing', () => {
		expect(mapUtils.getCenterSingle(undefined)).toEqual(
			mapUtils.INGOLSTADT_CENTER
		)
		expect(mapUtils.getCenterSingle([])).toEqual(mapUtils.INGOLSTADT_CENTER)
	})

	it('getCenterSingle - Should calculate the center of one polygon', () => {
		const center = mapUtils.getCenterSingle([
			[
				[0, 0],
				[2, 0],
				[2, 2],
				[0, 2]
			]
		])
		expect(center[0]).toBe(1)
		expect(center[1]).toBe(1)
	})

	it('getIcon - Should return the building icon for building search types', () => {
		expect(mapUtils.getIcon(SEARCH_TYPES.BUILDING)).toEqual({
			ios: 'building',
			android: 'corporate_fare'
		})
	})

	it('getIcon - Should return the PC icon for PC rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: { properties: { Funktion_en: 'PC Lab', Raum: 'B101' } }
				}
			})
		).toEqual({ ios: 'pc', android: 'keyboard' })
	})

	it('getIcon - Should return the lab icon for laboratory rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: {
						properties: { Funktion_en: 'Experimental Laboratory', Raum: 'B102' }
					}
				}
			})
		).toEqual({ ios: 'flask', android: 'science' })
	})

	it('getIcon - Should return the food icon for canteen rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: { properties: { Funktion_en: 'Cafeteria', Raum: 'M001' } }
				}
			})
		).toEqual({ ios: 'fork.knife', android: 'local_cafe' })
	})

	it('getIcon - Should return the office icon for office rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: { properties: { Funktion_en: 'Office', Raum: 'G215' } }
				}
			})
		).toEqual({ ios: 'lamp.desk', android: 'business_center' })
	})

	it('getIcon - Should return the toilet icon for toilet rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: { properties: { Funktion_en: 'Toilet', Raum: 'G001' } }
				}
			})
		).toEqual({ ios: 'toilet', android: 'wc' })
	})

	it('getIcon - Should return the lecture icon for lecture rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: { properties: { Funktion_en: 'Lecture Hall', Raum: 'G001' } }
				}
			})
		).toEqual({ ios: 'studentdesk', android: 'school' })
	})

	it('getIcon - Should return the corridor icon for corridor rooms', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: {
					item: {
						properties: { Funktion_en: 'Corridor Section', Raum: 'G002' }
					}
				}
			})
		).toEqual({
			ios: 'arrow.triangle.turn.up.right.diamond',
			android: 'directions'
		})
	})

	it('getIcon - Should fall back to the default room icon when no match exists', () => {
		expect(
			mapUtils.getIcon(SEARCH_TYPES.ROOM, {
				result: { item: { properties: { Funktion_en: '', Raum: 'X101' } } }
			})
		).toEqual({ ios: 'mappin', android: 'location_on' })
	})

	it('getIcon - Should fall back to the default icon for unknown search types', () => {
		expect(mapUtils.getIcon(SEARCH_TYPES.LECTURE)).toEqual({
			ios: 'mappin',
			android: 'location_on'
		})
	})
})
