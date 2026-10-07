import { beforeAll, describe, expect, it } from 'bun:test'
import {
	buildIndoorDataFromGeoJson,
	getIndoorBuildingForCode,
	getIndoorData,
	isIndoorFeature,
	loadIndoorDataFromAssets,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'

describe('indoor-nav asset data', () => {
	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
	})

	it('loads all G/J/K/W floors, doors and entrances from assets', () => {
		const data = getIndoorData()
		expect(Object.keys(data.roomsByFloor).sort()).toEqual(['1', '2', '3', 'EG'])
		const totalRooms = Object.values(data.roomsByFloor).reduce(
			(sum, rooms) => sum + rooms.length,
			0
		)
		expect(totalRooms).toBe(326)
		expect(data.doors.length).toBe(248)
		expect(data.entrances.length).toBe(9)
	})

	it('detects indoor features', () => {
		const data = getIndoorData()
		expect(isIndoorFeature(data.roomsByFloor.EG[0])).toBe(true)
		expect(isIndoorFeature(null)).toBe(false)
		expect(
			isIndoorFeature({ properties: { Standort: 'IN', Gebaeude: 'A' } })
		).toBe(false)
		expect(
			isIndoorFeature({ properties: { Standort: 'IN', Gebaeude: 'K' } })
		).toBe(true)
	})

	it('maps room codes to their building', () => {
		getIndoorData()
		expect(getIndoorBuildingForCode('G001')).toBe('G')
		expect(getIndoorBuildingForCode('J101')).toBe('J')
		expect(getIndoorBuildingForCode('K110')).toBe('K')
		expect(getIndoorBuildingForCode('W101')).toBe('W')
		expect(getIndoorBuildingForCode('NO-SUCH-ROOM')).toBeNull()
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
		expect(rebuilt.doors.length).toBe(data.doors.length)
		expect(rebuilt.entrances.length).toBe(data.entrances.length)
	})
})
