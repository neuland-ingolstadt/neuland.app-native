import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import type { i18n, TFunction } from 'i18next'
import { SEARCH_TYPES } from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'
import {
	filterAvailableRooms,
	filterEtage,
	getBuildingData,
	getOngoingOrNextEvent,
	getRoomData
} from '../map-screen-utils'
import type { RoomOpenings } from '../map-utils'

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

	it('filterEtage - Should return only features on the requested floor', () => {
		expect(
			filterEtage('EG', featureCollection).map(
				(feature) => feature.properties?.Raum ?? ''
			)
		).toEqual(['G001'])
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
	})

	it('getOngoingOrNextEvent - Should return the ongoing event when one is active', () => {
		const now = new Date()
		const events: FriendlyTimetableEntry[] = [
			buildEvent(
				'Current lecture',
				new Date(now.getTime() - 10 * 60 * 1000),
				new Date(now.getTime() + 10 * 60 * 1000)
			),
			buildEvent(
				'Later lecture',
				new Date(now.getTime() + 60 * 60 * 1000),
				new Date(now.getTime() + 2 * 60 * 60 * 1000)
			)
		]

		expect(getOngoingOrNextEvent(events).map((event) => event.name)).toEqual([
			'Current lecture'
		])
	})

	it('getOngoingOrNextEvent - Should return the next future event when none is ongoing', () => {
		const now = new Date()
		const events: FriendlyTimetableEntry[] = [
			buildEvent(
				'Morning lecture',
				new Date(now.getTime() + 2 * 60 * 60 * 1000),
				new Date(now.getTime() + 3 * 60 * 60 * 1000)
			),
			buildEvent(
				'Evening lecture',
				new Date(now.getTime() + 6 * 60 * 60 * 1000),
				new Date(now.getTime() + 7 * 60 * 60 * 1000)
			)
		]

		expect(getOngoingOrNextEvent(events).map((event) => event.name)).toEqual([
			'Morning lecture'
		])
	})
})
