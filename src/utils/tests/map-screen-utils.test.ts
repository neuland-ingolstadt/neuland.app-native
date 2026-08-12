import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import type { i18n, TFunction } from 'i18next'
import { SEARCH_TYPES } from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { MAP_CAMERA } from '@/utils/map-constants'
import type { RoomOpenings } from '../map-room-utils'
import {
	filterAvailableRooms,
	filterEtage,
	getBuildingData,
	getMapFocusPadding,
	getOngoingOrNextEvent,
	getRoomData,
	getRoomSelectionFromProperties,
	getSelectedMapFeatures,
	parseMapCoordinate
} from '../map-screen-utils'

const featureCollection: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: {
				Standort: 'THI Campus Ingolstadt',
				Gebaeude: 'G',
				Etage: '1',
				Ebene: '1',
				Raum: 'G101',
				Funktion_de: 'Vorlesungssaal',
				Funktion_en: 'Lecture hall',
				rtype: SEARCH_TYPES.ROOM
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[11.4328, 48.7663],
						[11.433, 48.7663],
						[11.433, 48.7665],
						[11.4328, 48.7665],
						[11.4328, 48.7663]
					]
				]
			}
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'THI Campus Ingolstadt',
				Gebaeude: 'G',
				Etage: 'EG',
				Ebene: 'EG',
				Raum: 'G001',
				Funktion_de: 'Eingang',
				Funktion_en: 'Entrance',
				rtype: SEARCH_TYPES.ROOM
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[11.4325, 48.766],
						[11.4327, 48.766],
						[11.4327, 48.7662],
						[11.4325, 48.7662],
						[11.4325, 48.766]
					]
				]
			}
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'THI Campus Ingolstadt',
				Gebaeude: 'G',
				Etage: '1',
				Ebene: '1',
				Raum: 'G000',
				Funktion_de: 'Gebäude',
				Funktion_en: 'Building',
				rtype: SEARCH_TYPES.BUILDING
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[11.4324, 48.7659],
						[11.4331, 48.7659],
						[11.4331, 48.7666],
						[11.4324, 48.7666],
						[11.4324, 48.7659]
					]
				]
			}
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'THI Campus Ingolstadt',
				Gebaeude: 'X',
				Etage: '1',
				Ebene: '1',
				Raum: 'G102',
				Funktion_de: 'Punkt',
				Funktion_en: 'Point',
				rtype: SEARCH_TYPES.ROOM
			},
			geometry: {
				type: 'Point',
				coordinates: [11.4329, 48.7664]
			}
		},
		{
			type: 'Feature',
			properties: null,
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[11.43, 48.76],
						[11.4301, 48.76],
						[11.4301, 48.7601],
						[11.43, 48.7601],
						[11.43, 48.76]
					]
				]
			}
		}
	]
}

const t = ((key: string) => key) as TFunction<'common', undefined>
const i18nDe = { language: 'de' } as i18n
const i18nEn = { language: 'en' } as i18n

const buildEvent = (
	name: string,
	startDate: Date,
	endDate: Date
): FriendlyTimetableEntry => ({
	date: startDate,
	startDate,
	endDate,
	name,
	shortName: name,
	rooms: ['G101'],
	lecturer: 'Prof. X',
	course: 'INF',
	studyGroup: 'INF1',
	sws: '2',
	ects: '5',
	goal: null,
	contents: null,
	literature: null
})

describe('map-screen-utils', () => {
	it('getMapFocusPadding - Should pad the bottom by sheet height plus gap', () => {
		expect(getMapFocusPadding(312)).toEqual({
			top: 0,
			right: 0,
			bottom: 312 + MAP_CAMERA.focusPaddingGap,
			left: 0
		})
	})

	it('getMapFocusPadding - Should return zero padding when the sheet is hidden', () => {
		expect(getMapFocusPadding(0)).toEqual({
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		})
		expect(getMapFocusPadding(-8)).toEqual({
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		})
	})

	it('parseMapCoordinate - Should accept valid numeric coordinates', () => {
		expect(parseMapCoordinate([11.4328, 48.7663])).toEqual([11.4328, 48.7663])
		expect(parseMapCoordinate('[11.4328,48.7663]')).toEqual([11.4328, 48.7663])
		expect(parseMapCoordinate([-180, -90])).toEqual([-180, -90])
		expect(parseMapCoordinate([180, 90])).toEqual([180, 90])
	})

	it('parseMapCoordinate - Should reject malformed or out-of-range coordinates', () => {
		expect(parseMapCoordinate(['11.4328', 48.7663])).toBeUndefined()
		expect(parseMapCoordinate([11.4328, '48.7663'])).toBeUndefined()
		expect(parseMapCoordinate([181, 48.7663])).toBeUndefined()
		expect(parseMapCoordinate([-181, 48.7663])).toBeUndefined()
		expect(parseMapCoordinate([11.4328, 91])).toBeUndefined()
		expect(parseMapCoordinate([11.4328, -91])).toBeUndefined()
		expect(parseMapCoordinate([11.4328, Number.NaN])).toBeUndefined()
		expect(
			parseMapCoordinate([Number.POSITIVE_INFINITY, 48.7663])
		).toBeUndefined()
		expect(parseMapCoordinate([11.4328])).toBeUndefined()
		expect(parseMapCoordinate({ length: 2 })).toBeUndefined()
		expect(parseMapCoordinate(null)).toBeUndefined()
		expect(parseMapCoordinate('not-json')).toBeUndefined()
	})

	it('getRoomSelectionFromProperties - Should require a room and normalize its center', () => {
		expect(
			getRoomSelectionFromProperties({
				Raum: 'G101',
				center: '[11.4328,48.7663]'
			})
		).toEqual({ room: 'G101', center: [11.4328, 48.7663] })
		expect(getRoomSelectionFromProperties({ Raum: 'G101' })).toEqual({
			room: 'G101',
			center: undefined
		})
		expect(getRoomSelectionFromProperties({ Raum: '' })).toBeUndefined()
		expect(getRoomSelectionFromProperties(null)).toBeUndefined()
		expect(
			getRoomSelectionFromProperties({ center: [11.4328, 48.7663] })
		).toBeUndefined()
	})

	it('filterAvailableRooms - Should return only features for rooms that are available', () => {
		expect(
			filterAvailableRooms(featureCollection, [{ room: 'G101' }]).map(
				(feature) => feature.properties?.Raum ?? ''
			)
		).toEqual(['G101'])
	})

	it('filterAvailableRooms - Should return an empty list when no rooms are available', () => {
		expect(filterAvailableRooms(featureCollection, [])).toEqual([])
	})

	it('filterAvailableRooms - Should return an empty list when rooms is undefined', () => {
		expect(filterAvailableRooms(undefined, [{ room: 'G101' }])).toEqual([])
	})

	it('filterAvailableRooms - Should ignore features without properties when availability is missing', () => {
		expect(filterAvailableRooms(featureCollection, null)).toEqual([])
	})

	it('filterEtage - Should return only features on the requested floor', () => {
		expect(
			filterEtage('EG', featureCollection).map(
				(feature) => feature.properties?.Raum ?? ''
			)
		).toEqual(['G001'])
	})

	it('getSelectedMapFeatures - Should return the polygon for a selected room', () => {
		const features = getSelectedMapFeatures(
			{
				type: SEARCH_TYPES.ROOM,
				data: 'G101'
			},
			featureCollection
		)
		expect(features).toHaveLength(1)
		expect(features[0]?.properties?.Raum).toBe('G101')
	})

	it('getSelectedMapFeatures - Should return floor polygons for a selected building', () => {
		const features = getSelectedMapFeatures(
			{
				type: SEARCH_TYPES.BUILDING,
				data: 'G'
			},
			featureCollection
		)
		expect(features.map((feature) => feature.properties?.Raum)).toEqual([
			'G101',
			'G001'
		])
	})

	it('getSelectedMapFeatures - Should return nothing without a selection', () => {
		expect(getSelectedMapFeatures(null, featureCollection)).toEqual([])
		expect(
			getSelectedMapFeatures(
				{ type: SEARCH_TYPES.ROOM, data: 'G101' },
				undefined
			)
		).toEqual([])
	})

	it('getSelectedMapFeatures - Should ignore non-polygon rooms and unknown search types', () => {
		expect(
			getSelectedMapFeatures(
				{ type: SEARCH_TYPES.ROOM, data: 'G102' },
				featureCollection
			)
		).toEqual([])
		expect(
			getSelectedMapFeatures(
				{ type: SEARCH_TYPES.ROOM, data: 'MISSING' },
				featureCollection
			)
		).toEqual([])
		expect(
			getSelectedMapFeatures(
				{ type: SEARCH_TYPES.LECTURE, data: 'G101' },
				featureCollection
			)
		).toEqual([])
		expect(
			getSelectedMapFeatures(
				{ type: SEARCH_TYPES.BUILDING, data: 'Z' },
				featureCollection
			)
		).toEqual([])
	})

	it('getRoomData - Should resolve room metadata, occupancy and next availability', () => {
		const now = new Date()
		const roomOpenings: RoomOpenings = {
			G101: [
				{
					type: 'Lecture hall',
					from: new Date(now.getTime() - 60 * 60 * 1000),
					until: new Date(now.getTime() + 2 * 60 * 60 * 1000),
					capacity: 120
				},
				{
					type: 'Lecture hall',
					from: new Date(now.getTime() + 24 * 60 * 60 * 1000),
					until: new Date(now.getTime() + 26 * 60 * 60 * 1000),
					capacity: 120
				}
			]
		}

		const result = getRoomData(
			'G101',
			[{ room: 'G101' }],
			featureCollection,
			i18nDe,
			t,
			roomOpenings
		)

		expect(result.title).toBe('G101')
		expect(result.subtitle).toBe('Vorlesungssaal')
		const occupancies = result.occupancies as { room?: string } | null
		expect(occupancies?.room).toBe('G101')
		expect(result.nextAvailable?.from).toEqual(roomOpenings.G101[1].from)
		expect(result.type).toBe(SEARCH_TYPES.ROOM)
		expect(result.properties?.Raum).toBe('G101')
	})

	it('getRoomData - Should skip openings that have already started', () => {
		const now = new Date()
		const nextFrom = new Date(now.getTime() + 2 * 60 * 60 * 1000)
		const result = getRoomData(
			'G101',
			[{ room: 'G101' }],
			featureCollection.features,
			i18nEn,
			t,
			{
				G101: [
					{
						type: 'Lecture hall',
						from: now,
						until: new Date(now.getTime() + 60 * 60 * 1000),
						capacity: 120
					},
					{
						type: 'Lecture hall',
						from: nextFrom,
						until: new Date(now.getTime() + 3 * 60 * 60 * 1000),
						capacity: 120
					}
				]
			}
		)

		expect(result.subtitle).toBe('Lecture hall')
		expect(result.nextAvailable?.from).toEqual(nextFrom)
	})

	it('getRoomData - Should fall back to unknown when room metadata is missing', () => {
		const result = getRoomData(
			'X999',
			null,
			featureCollection,
			i18nEn,
			((key: string) => `fallback:${key}`) as TFunction<'common', undefined>
		)

		expect(result.subtitle).toBe('fallback:misc.unknown')
		expect(result.occupancies).toBeUndefined()
		expect(result.nextAvailable).toBeNull()
	})

	it('getBuildingData - Should count total and available rooms for a building', () => {
		const result = getBuildingData(
			'G',
			featureCollection,
			[{ room: 'G101' }, { room: 'G001' }],
			t
		)

		expect(result.title).toBe('G')
		expect(result.subtitle).toBe('pages.map.details.room.building')
		expect(result.occupancies).toEqual({ total: 2, available: 2 })
		expect(result.type).toBe(SEARCH_TYPES.BUILDING)
		expect(result.properties?.rtype).toBe(SEARCH_TYPES.BUILDING)
	})

	it('getBuildingData - Should treat missing availability as zero free rooms', () => {
		const result = getBuildingData('G', featureCollection.features, null, t)

		expect(result.occupancies).toEqual({ total: 2, available: 0 })
		expect(result.properties?.Gebaeude).toBe('G')
	})

	it('getBuildingData - Should return no properties for an unknown building', () => {
		const result = getBuildingData(
			'Z',
			featureCollection,
			[{ room: 'Z101' }],
			t
		)

		expect(result.properties).toBeUndefined()
		expect(result.occupancies).toEqual({ total: 0, available: 1 })
	})

	it('getOngoingOrNextEvent - Should return the ongoing event when one is active', () => {
		const now = new Date('2026-06-16T10:30:00')
		const events: FriendlyTimetableEntry[] = [
			buildEvent(
				'Current lecture',
				new Date('2026-06-16T10:00:00'),
				new Date('2026-06-16T11:00:00')
			),
			buildEvent('Overlapping lecture', now, new Date('2026-06-16T12:00:00')),
			buildEvent(
				'Later lecture',
				new Date('2026-06-16T12:00:00'),
				new Date('2026-06-16T13:00:00')
			)
		]

		expect(
			getOngoingOrNextEvent(events, now).map((event) => event.name)
		).toEqual(['Current lecture', 'Overlapping lecture'])
	})

	it('getOngoingOrNextEvent - Should return the next future event when none is ongoing', () => {
		const now = new Date('2026-06-16T10:30:00')
		const events: FriendlyTimetableEntry[] = [
			buildEvent('Past lecture', new Date('2026-06-16T08:00:00'), now),
			buildEvent(
				'Evening lecture',
				new Date('2026-06-16T16:00:00'),
				new Date('2026-06-16T17:00:00')
			),
			buildEvent(
				'Morning lecture',
				new Date('2026-06-16T12:00:00'),
				new Date('2026-06-16T13:00:00')
			)
		]

		expect(
			getOngoingOrNextEvent(events, now).map((event) => event.name)
		).toEqual(['Morning lecture'])
	})

	it('getOngoingOrNextEvent - Should return nothing when the timetable is empty', () => {
		expect(getOngoingOrNextEvent([], new Date('2026-06-16T10:30:00'))).toEqual(
			[]
		)
	})
})
