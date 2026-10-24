import { describe, expect, it } from 'bun:test'
import {
	destinationRoomGeoJsonForFloor,
	emptyFeatureCollection,
	entrancesGeoJsonForBuilding,
	entrancesGeoJsonForFloor,
	pickLegForFloor,
	stairShaftsGeoJsonForFloor
} from '@/utils/indoor-nav/route-geojson'
import type {
	FloorSegment,
	IndoorData,
	RouteResult
} from '@/utils/indoor-nav/types'

function room(code: string, floor = 'EG') {
	return {
		type: 'Feature',
		properties: {
			Standort: 'IN',
			Gebaeude: 'G',
			Etage: floor,
			Raum: code,
			Funktion_de: 'Treppenhaus'
		},
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]
		}
	} as unknown as IndoorData['roomsByFloor'][string][number]
}

function entrance(id: string, gebaeude = 'G') {
	return {
		type: 'Feature',
		properties: { id, Standort: 'IN', Gebaeude: gebaeude, Etage: 'EG' },
		geometry: { type: 'Point', coordinates: [11.43, 48.76] }
	} as unknown as IndoorData['entrances'][number]
}

function data(): IndoorData {
	return {
		roomsByFloor: { EG: [room('T1'), room('G001')], '1': [room('T1', '1')] },
		doors: [],
		entrances: [entrance('IN-G-E01'), entrance('IN-J-E01', 'J')],
		corridorsByFloor: {}
	}
}

function segment(floor: string): FloorSegment {
	return {
		floor,
		coords: [
			[0, 0],
			[1, 1]
		],
		distanceM: 5,
		durationSec: 5
	}
}

function result(): RouteResult {
	return {
		nodeIds: ['room:EG:G001'],
		coords: [[0, 0]],
		floors: ['EG', '1'],
		distanceM: 10,
		durationSec: 10,
		hops: [],
		segments: [segment('EG'), segment('1')],
		floorChanges: [
			{
				fromFloor: 'EG',
				toFloor: '1',
				at: [0, 0],
				viaFrom: 'room:EG:T1',
				viaTo: 'room:1:T1',
				fromStairCode: 'T1',
				toStairCode: 'T1',
				distanceM: 3,
				durationSec: 10
			},
			undefined
		]
	}
}

describe('route-geojson helpers', () => {
	it('creates fresh empty collections', () => {
		const a = emptyFeatureCollection()
		const b = emptyFeatureCollection()
		expect(a).toEqual({ type: 'FeatureCollection', features: [] })
		expect(a).not.toBe(b)
	})

	it('collects staircase shafts for a floor', () => {
		expect(stairShaftsGeoJsonForFloor(data(), null, 'EG')).toEqual(
			emptyFeatureCollection()
		)
		const eg = stairShaftsGeoJsonForFloor(data(), result(), 'EG')
		expect(eg.features).toHaveLength(1)
		const one = stairShaftsGeoJsonForFloor(data(), result(), '1')
		expect(one.features).toHaveLength(1)
		expect(
			stairShaftsGeoJsonForFloor(data(), result(), '2').features
		).toHaveLength(0)
	})

	it('filters staircase shafts by code', () => {
		expect(
			stairShaftsGeoJsonForFloor(data(), result(), 'EG', new Set()).features
		).toHaveLength(0)
		expect(
			stairShaftsGeoJsonForFloor(data(), result(), 'EG', new Set(['T1']))
				.features
		).toHaveLength(1)
		expect(
			stairShaftsGeoJsonForFloor(data(), result(), 'EG', new Set(['ZZ']))
				.features
		).toHaveLength(0)
	})

	it('picks the route leg for a floor', () => {
		expect(pickLegForFloor(result(), 'EG')).toBe(0)
		expect(pickLegForFloor(result(), '3')).toBe(0)
		const looped: RouteResult = {
			...result(),
			segments: [segment('EG'), segment('1'), segment('EG')]
		}
		expect(pickLegForFloor(looped, 'EG')).toBe(0)
		expect(pickLegForFloor(looped, 'EG', 1)).toBe(2)
		expect(pickLegForFloor(looped, 'EG', 99)).toBe(2)
	})

	it('highlights the destination room only when asked', () => {
		expect(
			destinationRoomGeoJsonForFloor(data(), 'EG', 'G001', false).features
		).toHaveLength(0)
		expect(
			destinationRoomGeoJsonForFloor(data(), 'EG', 'NOPE', true).features
		).toHaveLength(0)
		const fc = destinationRoomGeoJsonForFloor(data(), 'EG', 'G001', true)
		expect(fc.features).toHaveLength(1)
		expect(fc.features[0]?.properties).toMatchObject({ Raum: 'G001' })
	})

	it('serves entrance markers per floor and building', () => {
		const d = data()
		expect(entrancesGeoJsonForFloor(d, '1').features).toHaveLength(0)
		const eg = entrancesGeoJsonForFloor(d, 'EG')
		expect(eg.features).toHaveLength(2)
		// Cached second read returns the same collection.
		expect(entrancesGeoJsonForFloor(d, 'EG')).toBe(eg)
		expect(entrancesGeoJsonForBuilding(data(), 'G').features).toHaveLength(1)
		expect(entrancesGeoJsonForBuilding(data(), 'ZZ').features).toHaveLength(0)
	})
})
