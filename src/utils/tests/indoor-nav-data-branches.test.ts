import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import {
	applyIndoorData,
	buildIndoorDataFromGeoJson,
	getIndoorBuildingForCode,
	getIndoorData,
	getIndoorGraph,
	getIndoorRoomFloorsForCode,
	indoorFloors,
	isIndoorDataLoaded,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'

function roomProps(overrides: Record<string, unknown> = {}) {
	return {
		Standort: 'IN',
		Gebaeude: 'G',
		Etage: 'EG',
		Raum: 'G001',
		Funktion_de: 'Büro',
		...overrides
	}
}

function polygonRoom(
	raum = 'G001',
	type = 'Polygon',
	props: Record<string, unknown> = {}
) {
	return {
		type: 'Feature',
		properties: roomProps({ Raum: raum, ...props }),
		geometry: {
			type,
			coordinates:
				type === 'Polygon'
					? [
							[
								[0, 0],
								[1, 0],
								[1, 1],
								[0, 1],
								[0, 0]
							]
						]
					: [
							[
								[0, 0],
								[1, 0],
								[1, 1],
								[0, 1],
								[0, 0]
							],
							[
								[0.2, 0.2],
								[0.8, 0.2],
								[0.8, 0.8],
								[0.2, 0.8],
								[0.2, 0.2]
							]
						]
		}
	}
}

function geometryCollectionRoom(withPolygon: boolean) {
	return {
		type: 'Feature',
		properties: roomProps({ Raum: 'G002' }),
		geometry: {
			type: 'GeometryCollection',
			geometries: withPolygon
				? [
						{
							type: 'LineString',
							coordinates: [
								[0, 0],
								[1, 1]
							]
						},
						{
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
					]
				: [
						{
							type: 'LineString',
							coordinates: [
								[0, 0],
								[1, 1]
							]
						}
					]
		}
	}
}

function pointFeature(id: string, indoor = true) {
	return {
		type: 'Feature',
		properties: {
			id,
			Standort: indoor ? 'IN' : 'XX',
			Gebaeude: 'G',
			Etage: 'EG'
		},
		geometry: { type: 'Point', coordinates: [11.43, 48.76] }
	}
}

function corridorLine(floor = 'EG', indoor = true) {
	return {
		type: 'Feature',
		properties: {
			Standort: indoor ? 'IN' : 'XX',
			Gebaeude: 'G',
			Etage: floor
		},
		geometry: {
			type: 'LineString',
			coordinates: [
				[11.43, 48.76],
				[11.431, 48.761]
			]
		}
	}
}

function fc(features: unknown[]): FeatureCollection {
	return { type: 'FeatureCollection', features: features as never[] }
}

describe('indoor-nav data edge cases', () => {
	beforeEach(() => {
		resetIndoorDataCache()
	})

	afterEach(() => {
		resetIndoorDataCache()
	})

	it('reads nothing before data is loaded', () => {
		expect(isIndoorDataLoaded()).toBe(false)
		expect(getIndoorRoomFloorsForCode('G001')).toEqual([])
		expect(getIndoorBuildingForCode('G001')).toBeNull()
		expect(getIndoorBuildingForCode('???')).toBeNull()
		expect(() => getIndoorData()).toThrow('not loaded yet')
		expect(indoorFloors()).toEqual(['EG', '1', '2', '3'])
	})

	it('keeps polygon rooms and unwraps geometry collections', () => {
		const data = buildIndoorDataFromGeoJson(
			fc([
				polygonRoom('G001'),
				polygonRoom('G010', 'MultiPolygon'),
				geometryCollectionRoom(true),
				geometryCollectionRoom(false),
				polygonRoom('NOWHERE', 'Polygon', { Standort: 'XX' }),
				polygonRoom('NOFLOOR', 'Polygon', { Etage: '9' }),
				{ type: 'Feature', properties: roomProps(), geometry: null }
			]),
			fc([]),
			fc([]),
			fc([])
		)
		const codes = data.roomsByFloor.EG.map((r) => r.properties.Raum).sort()
		expect(codes).toEqual(['G001', 'G002', 'G010'])
	})

	it('filters doors, entrances and corridors by geometry and building', () => {
		const data = buildIndoorDataFromGeoJson(
			fc([]),
			fc([
				pointFeature('d1'),
				pointFeature('d2', false),
				{
					...pointFeature('d3'),
					geometry: { type: 'LineString', coordinates: [] }
				}
			]),
			fc([pointFeature('IN-G-E01')]),
			fc([corridorLine('EG'), corridorLine('9'), corridorLine('EG', false)])
		)
		expect(data.doors.map((d) => d.properties.id)).toEqual(['d1'])
		expect(data.entrances.map((e) => e.properties.id)).toEqual(['IN-G-E01'])
		expect(data.corridorsByFloor.EG).toHaveLength(1)
		expect(data.corridorsByFloor['1']).toHaveLength(0)
	})

	it('caches applied data and rebuilds room indexes', () => {
		const data = buildIndoorDataFromGeoJson(
			fc([polygonRoom('G001')]),
			fc([]),
			fc([]),
			fc([])
		)
		expect(isIndoorDataLoaded()).toBe(false)
		applyIndoorData(data)
		expect(isIndoorDataLoaded()).toBe(true)
		// Re-applying the same object keeps the cached indexes.
		applyIndoorData(data)
		expect(getIndoorRoomFloorsForCode('G001')).toEqual(['EG'])
		expect(getIndoorBuildingForCode('G001')).toBe('G')
		expect(getIndoorBuildingForCode('NOPE')).toBeNull()
		const graph = getIndoorGraph()
		expect(graph).toBe(getIndoorGraph())
		expect(graph.nodes.size).toBeGreaterThanOrEqual(0)
	})
})
