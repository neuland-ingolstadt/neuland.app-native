import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import { SEARCH_TYPES } from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import {
	buildRoomLocationIndex,
	findNearestRoomLocation,
	rankAvailableRoomsByProximity,
	resolveRoomSuggestionAnchor
} from '../map-room-proximity-utils'

const now = new Date('2026-10-03T10:00:00.000Z')
const later = new Date('2026-10-03T11:00:00.000Z')

function room(
	name: string,
	overrides: Partial<AvailableRoom> = {}
): AvailableRoom {
	return {
		room: name,
		type: 'Seminar',
		from: now,
		until: later,
		capacity: 20,
		...overrides
	}
}

const allRooms: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: {
				Standort: 'IN',
				Gebaeude: 'G',
				Ebene: '1',
				Raum: 'G215',
				rtype: SEARCH_TYPES.ROOM,
				center: [11.4328, 48.7663]
			},
			geometry: { type: 'Point', coordinates: [11.4328, 48.7663] }
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'IN',
				Gebaeude: 'G',
				Ebene: '1',
				Raum: 'G211',
				rtype: SEARCH_TYPES.ROOM,
				center: [11.4329, 48.7663]
			},
			geometry: { type: 'Point', coordinates: [11.4329, 48.7663] }
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'IN',
				Gebaeude: 'G',
				Ebene: 'EG',
				Raum: 'G001',
				rtype: SEARCH_TYPES.ROOM,
				center: [11.4328, 48.7662]
			},
			geometry: { type: 'Point', coordinates: [11.4328, 48.7662] }
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'IN',
				Gebaeude: 'A',
				Ebene: '1',
				Raum: 'A101',
				rtype: SEARCH_TYPES.ROOM,
				center: [11.431, 48.766]
			},
			geometry: { type: 'Point', coordinates: [11.431, 48.766] }
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'ND',
				Gebaeude: 'BN',
				Ebene: 'EG',
				Raum: 'BN001',
				rtype: SEARCH_TYPES.ROOM,
				center: [11.17261, 48.732]
			},
			geometry: { type: 'Point', coordinates: [11.17261, 48.732] }
		},
		{
			type: 'Feature',
			properties: {
				Standort: 'IN',
				Gebaeude: 'G',
				Ebene: '1',
				Raum: 'G',
				rtype: SEARCH_TYPES.BUILDING,
				center: [11.4328, 48.7663]
			},
			geometry: { type: 'Point', coordinates: [11.4328, 48.7663] }
		}
	]
}

describe('rankAvailableRoomsByProximity', () => {
	const roomLocations = buildRoomLocationIndex(allRooms)

	it('prefers same building and floor over far rooms', () => {
		const ranked = rankAvailableRoomsByProximity(
			[room('BN001'), room('A101'), room('G001'), room('G211')],
			{
				room: 'G215',
				building: 'G',
				floor: '1',
				campus: 'IN',
				coordinate: [11.4328, 48.7663]
			},
			roomLocations
		)

		expect(ranked.map((entry) => entry.room)).toEqual([
			'G211',
			'G001',
			'A101',
			'BN001'
		])
	})

	it('keeps Alle first when present', () => {
		const ranked = rankAvailableRoomsByProximity(
			[room('G211'), room('Alle'), room('A101')],
			{
				room: 'G215',
				building: 'G',
				floor: '1',
				campus: 'IN',
				coordinate: [11.4328, 48.7663]
			},
			roomLocations
		)

		expect(ranked[0]?.room).toBe('Alle')
		expect(ranked[1]?.room).toBe('G211')
	})

	it('returns input unchanged without an anchor', () => {
		const rooms = [room('A101'), room('G211')]
		expect(rankAvailableRoomsByProximity(rooms, undefined, roomLocations)).toBe(
			rooms
		)
	})
})

describe('resolveRoomSuggestionAnchor', () => {
	const roomLocations = buildRoomLocationIndex(allRooms)

	it('uses the preferred lecture room when mapped', () => {
		expect(
			resolveRoomSuggestionAnchor({
				preferredRoom: 'G215',
				userCoordinate: [11.17261, 48.732],
				roomLocations
			})
		).toMatchObject({
			room: 'G215',
			building: 'G',
			floor: '1',
			campus: 'IN'
		})
	})

	it('falls back to nearest room for GPS', () => {
		const anchor = resolveRoomSuggestionAnchor({
			preferredRoom: null,
			userCoordinate: [11.1727, 48.7321],
			roomLocations
		})

		expect(anchor?.room).toBe('BN001')
		expect(anchor?.campus).toBe('ND')
	})
})

describe('findNearestRoomLocation', () => {
	const roomLocations = buildRoomLocationIndex(allRooms)

	it('ignores synthetic building features', () => {
		expect(roomLocations.has('G')).toBe(false)
		expect(
			findNearestRoomLocation([11.43285, 48.7663], roomLocations)?.room
		).toBe('G215')
	})
})
