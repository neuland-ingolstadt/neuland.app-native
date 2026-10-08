import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import { SEARCH_TYPES } from '@/types/map'
import {
	buildCampusPathGraph,
	campusPathToFeatureCollection,
	findCampusPath
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

function entrancePoint(
	id: string,
	building: string,
	lon: number,
	lat: number,
	options?: {
		kind?: 'both' | 'entrance' | 'exit'
		access?: 'public' | 'badge'
		floor?: string
	}
): FeatureCollection['features'][number] {
	return {
		type: 'Feature',
		properties: {
			id,
			Standort: 'IN',
			Gebaeude: building,
			Etage: options?.floor ?? 'EG',
			Ebene: options?.floor ?? 'EG',
			name_de: `Eingang ${id}`,
			name_en: `Entrance ${id}`,
			kind: options?.kind ?? 'both',
			access: options?.access ?? 'public'
		},
		geometry: {
			type: 'Point',
			coordinates: [lon, lat]
		}
	}
}

const campus: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		roomPolygon('A101', 'A', '1', 'Seminarraum', 11.4317, 48.7669),
		// touches A101
		roomPolygon('A192', 'A', '1', 'Flur', 11.4318, 48.7669),
		// touches A192
		roomPolygon('A193', 'A', '1', 'Flur', 11.4319, 48.7669),
		roomPolygon('A182', 'A', '1', 'Treppenhaus', 11.432, 48.7669),
		roomPolygon('A082', 'A', 'EG', 'Treppenhaus', 11.432, 48.7669),
		roomPolygon('A091', 'A', 'EG', 'Flur', 11.4319, 48.7669),
		roomPolygon('A001', 'A', 'EG', 'Seminarraum', 11.4318, 48.7669),
		// Building G ground portal + room
		roomPolygon('G091', 'G', 'EG', 'Flur', 11.433, 48.7663),
		roomPolygon('G001', 'G', 'EG', 'Seminarraum', 11.4331, 48.7663)
	]
}

const entrances: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		// Public door on the east side of A (faces outdoor approach)
		entrancePoint('A-east', 'A', 11.43205, 48.76695, { kind: 'both' }),
		// Badge-only door closer to outdoor approach — should lose to public
		entrancePoint('A-badge', 'A', 11.4334, 48.7669, {
			kind: 'both',
			access: 'badge'
		}),
		// Exit-only on G — preferred when leaving G, not when entering
		entrancePoint('G-exit', 'G', 11.43295, 48.76635, { kind: 'exit' }),
		entrancePoint('G-main', 'G', 11.43305, 48.76635, { kind: 'both' })
	]
}

describe('map-path-utils', () => {
	const graph = buildCampusPathGraph(campus)
	const graphWithEntrances = buildCampusPathGraph(campus, entrances)

	it('builds corridor links on the same floor', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'A182'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds[0]).toBe('A101')
		expect(path?.nodeIds.at(-1)).toBe('A182')
		expect(path?.nodeIds).toContain('A192')
	})

	it('draws indoor lines toward doors instead of corridor centers', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'A182'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}
		const corridorCenter = graph.nodes.get('A192')?.center
		expect(corridorCenter).toBeDefined()
		if (corridorCenter == null) {
			return
		}
		// Geometry should leave the room toward the shared door edge, not jump
		// to the Flur polygon center (that chord cuts through walls).
		const usesCorridorCenter = path.coordinates.some(
			([lon, lat]) => lon === corridorCenter[0] && lat === corridorCenter[1]
		)
		expect(usesCorridorCenter).toBe(false)
		const roomCenter = graph.nodes.get('A101')?.center
		expect(roomCenter).toBeDefined()
		if (roomCenter == null) {
			return
		}
		expect(path.coordinates[0]).toEqual(roomCenter)
	})

	it('routes between rooms via corridors instead of room-to-room shortcuts', () => {
		// Two seminar rooms touch each other and both touch the Flur.
		const crowded: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				roomPolygon('A201', 'A', '1', 'Seminarraum', 11.4317, 48.7669),
				roomPolygon('A202', 'A', '1', 'Seminarraum', 11.4318, 48.7669),
				roomPolygon('A292', 'A', '1', 'Flur', 11.4317, 48.767),
				roomPolygon('A293', 'A', '1', 'Flur', 11.4318, 48.767)
			]
		}
		const crowdedGraph = buildCampusPathGraph(crowded)
		const path = findCampusPath({
			graph: crowdedGraph,
			fromRoom: 'A201',
			toRoom: 'A202'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds[0]).toBe('A201')
		expect(path?.nodeIds.at(-1)).toBe('A202')
		// Must leave into Flur — not hop A201 → A202 directly.
		expect(path?.nodeIds).not.toEqual(['A201', 'A202'])
		expect(path?.nodeIds.some((id) => id === 'A292' || id === 'A293')).toBe(
			true
		)
		expect(path?.nodeIds.length).toBeGreaterThanOrEqual(3)
	})

	it('connects floors through staircases', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'A001'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds).toContain('A182')
		expect(path?.nodeIds).toContain('A082')
		expect(path?.coordinates.length).toBeGreaterThanOrEqual(3)
	})

	it('connects buildings via ground-floor outdoor portals without entrance data', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds).toContain('A091')
		expect(path?.nodeIds).toContain('G091')
	})

	it('uses real entrance points when connecting buildings', () => {
		const path = findCampusPath({
			graph: graphWithEntrances,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds).toContain('entrance:A-east')
		expect(path?.nodeIds).toContain('entrance:G-main')
		expect(path?.nodeIds).not.toContain('entrance:A-badge')
		expect(path?.nodeIds).not.toContain('entrance:G-exit')
	})

	it('leaves via EG even when an upper floor is closer to the door', () => {
		// Floor 2 Flur sits directly above the entrance — must not become the exit hop.
		const withUpperNearDoor: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				...campus.features,
				roomPolygon('A292', 'A', '2', 'Flur', 11.432, 48.7669),
				roomPolygon('A282', 'A', '2', 'Treppenhaus', 11.432, 48.7669)
			]
		}
		const graph = buildCampusPathGraph(withUpperNearDoor, entrances)
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		expect(path?.nodeIds).toContain('A082')
		expect(path?.nodeIds).toContain('entrance:A-east')
		expect(path?.nodeIds).not.toContain('A292')
		expect(path?.nodeIds).not.toContain('A282')

		const entranceIndex = path?.nodeIds.indexOf('entrance:A-east') ?? -1
		const egStairsIndex = path?.nodeIds.indexOf('A082') ?? -1
		expect(egStairsIndex).toBeGreaterThanOrEqual(0)
		expect(egStairsIndex).toBeLessThan(entranceIndex)
	})

	it('uses outdoor approach from GPS then indoor only in the destination', () => {
		// East of building A — clearly outdoors
		const path = findCampusPath({
			graph,
			fromCoordinate: [11.4335, 48.7669],
			toRoom: 'A001'
		})
		expect(path).toBeDefined()
		expect(path?.outdoorOrigin).toEqual([11.4335, 48.7669])
		expect(path?.nodeIds.every((id) => id.startsWith('A'))).toBe(true)
		expect(path?.nodeIds.at(-1)).toBe('A001')
		// Nearest ground portal facing the approach (Flur or stairs)
		expect(path?.nodeIds[0] === 'A091' || path?.nodeIds[0] === 'A082').toBe(
			true
		)
	})

	it('routes outdoor GPS to the nearest public entrance', () => {
		const path = findCampusPath({
			graph: graphWithEntrances,
			fromCoordinate: [11.4335, 48.7669],
			toRoom: 'A001'
		})
		expect(path).toBeDefined()
		expect(path?.outdoorOrigin).toEqual([11.4335, 48.7669])
		expect(path?.nodeIds[0]).toBe('entrance:A-east')
		expect(path?.nodeIds.at(-1)).toBe('A001')
		expect(path?.nodeIds).not.toContain('entrance:A-badge')
	})

	it('serializes a LineString feature collection', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'A193'
		})
		const collection = campusPathToFeatureCollection(path)
		expect(collection.features).toHaveLength(1)
		expect(collection.features[0]?.geometry.type).toBe('LineString')
	})
})
