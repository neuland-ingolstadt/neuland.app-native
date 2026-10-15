import { describe, expect, it } from 'bun:test'
import {
	BUILDINGS,
	BUILDINGS_ALL,
	formatCampusLocation,
	getBuildingCodes,
	getFloorDistance,
	getFloorLevel,
	normalizeCampusKey,
	ROOMS_ALL,
	sortFloors
} from '@/utils/map-constants'

describe('map-constants', () => {
	it('formats campus locations', () => {
		expect(formatCampusLocation('IN')).toBe('Ingolstadt')
		expect(formatCampusLocation('ND')).toBe('Neuburg')
		expect(formatCampusLocation('Ingolstadt')).toBe('Ingolstadt')
		expect(formatCampusLocation('Somewhere')).toBe('Somewhere')
		expect(formatCampusLocation('')).toBeUndefined()
		expect(formatCampusLocation(null)).toBeUndefined()
		expect(formatCampusLocation(42)).toBeUndefined()
	})

	it('sorts floors top-down with unknown labels last', () => {
		expect(sortFloors(['EG', '3', '1'])).toEqual(['3', '1', 'EG'])
		expect(sortFloors(['-1', 'EG', 'ZZ'])).toEqual(['EG', '-1', 'ZZ'])
		expect(BUILDINGS).toContain('G')
		expect(BUILDINGS_ALL).toBe('Alle')
		expect(ROOMS_ALL).toBe('Alle')
	})

	it('dedupes and sorts building codes', () => {
		expect(getBuildingCodes(['B', 'A', 'B', '', null, 3])).toEqual(['A', 'B'])
		expect(getBuildingCodes([])).toEqual([])
	})

	it('maps floor labels to numeric levels', () => {
		expect(getFloorLevel('EG')).toBe(0)
		expect(getFloorLevel('0')).toBe(0)
		expect(getFloorLevel('1')).toBe(1)
		expect(getFloorLevel('1,5')).toBe(1.5)
		expect(getFloorLevel('-1')).toBe(-1)
		expect(getFloorLevel(' 2 ')).toBe(2)
		expect(getFloorLevel('eg')).toBe(0)
		expect(getFloorLevel('ZZ')).toBe(0)
	})

	it('measures floor distance', () => {
		expect(getFloorDistance('EG', 'EG')).toBe(0)
		expect(getFloorDistance('EG', '2')).toBe(2)
		expect(getFloorDistance('3', '1')).toBe(2)
	})

	it('normalizes campus keys', () => {
		expect(normalizeCampusKey('IN')).toBe('IN')
		expect(normalizeCampusKey('Ingolstadt')).toBe('IN')
		expect(normalizeCampusKey('ND')).toBe('ND')
		expect(normalizeCampusKey('Neuburg')).toBe('ND')
		expect(normalizeCampusKey(' IN ')).toBe('IN')
		expect(normalizeCampusKey('XX')).toBeUndefined()
		expect(normalizeCampusKey(null)).toBeUndefined()
		expect(normalizeCampusKey(7)).toBeUndefined()
	})
})
