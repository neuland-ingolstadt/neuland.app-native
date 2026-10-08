import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import { SEARCH_TYPES } from '@/types/map'
import {
	buildCampusPathGraph,
	findCampusPath,
	materializeCampusPathGeometry
} from '../map-path-utils'

function roomPolygon(
	raum: string,
	building: string,
	floor: string,
	funktionDe: string,
	minLon: number,
	minLat: number,
	size = 0.0001
): FeatureCollection['features'][number] {
	const maxLon = minLon + size
	const maxLat = minLat + size
	return {
		type: 'Feature',
		properties: {
			Raum: raum,
			Gebaeude: building,
			Ebene: floor,
			Funktion_de: funktionDe,
			Funktion_en: funktionDe,
			rtype: SEARCH_TYPES.ROOM,
			center: [(minLon + maxLon) / 2, (minLat + maxLat) / 2]
		},
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[minLon, minLat],
					[maxLon, minLat],
					[maxLon, maxLat],
					[minLon, maxLat],
					[minLon, minLat]
				]
			]
		}
	}
}

const campus: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		roomPolygon('A091', 'A', 'EG', 'Flur', 11.4319, 48.7669),
		roomPolygon('A001', 'A', 'EG', 'Seminarraum', 11.4318, 48.7669),
		roomPolygon('G091', 'G', 'EG', 'Flur', 11.433, 48.7663),
		roomPolygon('G001', 'G', 'EG', 'Seminarraum', 11.4331, 48.7663)
	]
}

describe('materializeCampusPathGeometry', () => {
	const graph = buildCampusPathGraph(campus)

	it('splices footpath geometry into outdoor building hops', async () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const materialized = await materializeCampusPathGeometry(
			path,
			graph,
			async () => ({
				coordinates: [
					[11.43195, 48.76695],
					[11.4324, 48.7666],
					[11.43305, 48.76635]
				],
				distanceMeters: 140
			})
		)

		expect(
			materialized.displaySegments?.some((segment) =>
				segment.coordinates.some(
					(coordinate) => coordinate[0] === 11.4324 && coordinate[1] === 48.7666
				)
			)
		).toBe(true)
		expect(materialized.distanceMeters).toBeGreaterThan(140)
		// Outdoor street geometry is its own segment (not mixed into indoor hops).
		expect(materialized.displaySegments?.length).toBeGreaterThanOrEqual(3)
		expect(
			materialized.displaySegments?.some(
				(segment) => segment.surface === 'outdoor'
			)
		).toBe(true)
		expect(
			materialized.displaySegments?.some(
				(segment) => segment.surface === 'indoor'
			)
		).toBe(true)
	})

	it('keeps indoor-colored shortcut segments from the outdoor footpath', async () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const materialized = await materializeCampusPathGeometry(
			path,
			graph,
			async () => ({
				coordinates: [
					[11.43195, 48.76695],
					[11.4324, 48.7666],
					[11.43305, 48.76635]
				],
				distanceMeters: 140,
				segments: [
					{
						coordinates: [
							[11.43195, 48.76695],
							[11.4324, 48.7666]
						],
						surface: 'outdoor'
					},
					{
						coordinates: [
							[11.4324, 48.7666],
							[11.43305, 48.76635]
						],
						surface: 'indoor'
					}
				]
			})
		)

		expect(
			materialized.displaySegments?.some(
				(segment) =>
					segment.surface === 'indoor' &&
					segment.coordinates.some(
						([lon, lat]) => lon === 11.4324 && lat === 48.7666
					)
			)
		).toBe(true)
	})

	it('omits outdoor chords when no footpath is available', async () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const materialized = await materializeCampusPathGeometry(
			path,
			graph,
			async () => undefined
		)

		const outdoorChord = (materialized.displaySegments ?? []).some(
			(segment) =>
				segment.surface === 'outdoor' ||
				(segment.coordinates.some(([lon]) => lon > 11.4322 && lon < 11.4329) &&
					segment.coordinates.some(([lon]) => lon > 11.4329))
		)
		expect(outdoorChord).toBe(false)
		expect(materialized.displaySegments?.length).toBeGreaterThanOrEqual(2)
	})
})
