import { beforeAll, describe, expect, it } from 'bun:test'
import {
	buildIndoorDataFromGeoJson,
	coveredBuildingsFromAssets,
	getIndoorBuildingForCode,
	getIndoorData,
	getIndoorDefaultStartIdForBuilding,
	getIndoorDefaultStartIdForCode,
	getIndoorRoomFloorsForCode,
	indoorBuildings,
	indoorFloors,
	isIndoorFeature,
	loadIndoorDataFromAssets,
	normalizeFunktion,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'
import { INDOOR_DEFAULT_START_ID } from '@/utils/indoor-nav/ids'

describe('indoor-nav asset data', () => {
	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
	})

	it('covers every building with door/path assets out of the box', () => {
		const buildings = indoorBuildings()
		const codes = buildings.map((b) => `${b.standort}/${b.gebaeude}`)
		expect(codes).toContain('IN/G')
		expect(codes).toContain('IN/J')
		// Sorted numeric-aware by building code.
		expect([...codes].sort()).toEqual(codes)
	})

	it('loads G rooms, doors and entrances from assets', () => {
		const data = getIndoorData()
		const gRooms = Object.values(data.roomsByFloor).reduce(
			(sum, rooms) =>
				sum + rooms.filter((r) => r.properties.Gebaeude === 'G').length,
			0
		)
		expect(gRooms).toBe(152)
		expect(data.doors.filter((d) => d.properties.Gebaeude === 'G').length).toBe(
			105
		)
		expect(
			data.entrances.filter((e) => e.properties.Gebaeude === 'G').length
		).toBe(5)
	})

	it('loads J rooms, doors and entrances from assets', () => {
		const data = getIndoorData()
		expect(data.floors).toEqual(['EG', '1', '2', '3'])
		const jRooms = Object.values(data.roomsByFloor).reduce(
			(sum, rooms) =>
				sum + rooms.filter((r) => r.properties.Gebaeude === 'J').length,
			0
		)
		expect(jRooms).toBe(50)
		expect(data.doors.filter((d) => d.properties.Gebaeude === 'J').length).toBe(
			44
		)
		const jEntrances = data.entrances.filter(
			(e) => e.properties.Gebaeude === 'J'
		)
		expect(jEntrances.map((e) => e.properties.id)).toEqual(['IN-J-E01'])
	})

	it('starts every building at its lowest-numbered entrance', () => {
		expect(getIndoorDefaultStartIdForBuilding('IN', 'G')).toBe(
			INDOOR_DEFAULT_START_ID
		)
		expect(getIndoorDefaultStartIdForBuilding('IN', 'J')).toBe(
			'entrance:IN-J-E01'
		)
		expect(getIndoorDefaultStartIdForBuilding('IN', 'NOPE')).toBeUndefined()
		expect(getIndoorDefaultStartIdForCode('G001')).toBe(INDOOR_DEFAULT_START_ID)
		expect(getIndoorDefaultStartIdForCode('J101')).toBe('entrance:IN-J-E01')
		expect(getIndoorDefaultStartIdForCode('NO-SUCH-ROOM')).toBeUndefined()
	})

	it('resolves room floors and buildings per code', () => {
		expect(getIndoorRoomFloorsForCode('G001')).toContain('EG')
		expect(getIndoorRoomFloorsForCode('J101')).toEqual(['1'])
		expect(getIndoorBuildingForCode('J101')).toEqual({
			standort: 'IN',
			gebaeude: 'J'
		})
		expect(getIndoorBuildingForCode('G001')).toEqual({
			standort: 'IN',
			gebaeude: 'G'
		})
		expect(getIndoorBuildingForCode('NO-SUCH-ROOM')).toBeNull()
		expect(indoorFloors()).toEqual(['EG', '1', '2', '3'])
	})

	it('detects indoor features of any covered building', () => {
		const data = getIndoorData()
		expect(isIndoorFeature(data.roomsByFloor.EG[0])).toBe(true)
		expect(
			isIndoorFeature({
				properties: { Standort: 'IN', Gebaeude: 'J' }
			})
		).toBe(true)
		expect(isIndoorFeature(null)).toBe(false)
		expect(
			isIndoorFeature({ properties: { Standort: 'IN', Gebaeude: 'A' } })
		).toBe(false)
	})

	it('discovers covered buildings from door/corridor assets', () => {
		const data = getIndoorData()
		const rediscovered = coveredBuildingsFromAssets(
			{ type: 'FeatureCollection', features: data.doors },
			{ type: 'FeatureCollection', features: [] }
		)
		// Doors alone already cover G and J; corridors only add paths.
		expect(rediscovered.map((b) => b.gebaeude).sort()).toEqual(['G', 'J'])
		expect(
			coveredBuildingsFromAssets(
				{ type: 'FeatureCollection', features: [] },
				{ type: 'FeatureCollection', features: [] }
			)
		).toEqual([])
	})

	it('normalizes function labels of new buildings', () => {
		expect(normalizeFunktion('TRH')).toBe('Treppenhaus')
		expect(normalizeFunktion('Flur Entrepreneur')).toBe('Flur')
		expect(normalizeFunktion('Flur')).toBe('Flur')
		expect(normalizeFunktion('Hörsaal')).toBe('Hörsaal')
		expect(normalizeFunktion(undefined)).toBeUndefined()
		const data = getIndoorData()
		const j092 = (data.roomsByFloor.EG ?? []).find(
			(r) => r.properties.Raum === 'J092'
		)
		expect(j092?.properties.Funktion_de).toBe('Flur')
	})

	it('builds indoor data from geojson inputs', () => {
		const data = getIndoorData()
		const rebuilt = buildIndoorDataFromGeoJson(
			{
				type: 'FeatureCollection',
				features: Object.values(data.roomsByFloor).flat()
			},
			{ type: 'FeatureCollection', features: data.doors },
			{ type: 'FeatureCollection', features: data.entrances },
			{
				type: 'FeatureCollection',
				features: Object.values(data.corridorsByFloor).flat()
			}
		)
		expect(rebuilt.buildings).toEqual(data.buildings)
		expect(rebuilt.floors).toEqual(data.floors)
		expect(rebuilt.doors.length).toBe(data.doors.length)
		expect(rebuilt.entrances.length).toBe(data.entrances.length)
	})
})
