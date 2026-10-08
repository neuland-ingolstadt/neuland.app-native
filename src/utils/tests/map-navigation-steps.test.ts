import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import { SEARCH_TYPES } from '@/types/map'
import {
	buildCampusNavigationSteps,
	outdoorTurnsFromPolyline
} from '../map-navigation-steps'
import { buildCampusPathGraph, findCampusPath } from '../map-path-utils'

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
	lat: number
): FeatureCollection['features'][number] {
	return {
		type: 'Feature',
		properties: {
			id,
			Standort: 'IN',
			Gebaeude: building,
			Etage: 'EG',
			Ebene: 'EG',
			name_de: `Eingang ${id}`,
			name_en: `Entrance ${id}`,
			kind: 'both',
			access: 'public'
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
		roomPolygon('A192', 'A', '1', 'Flur', 11.4318, 48.7669),
		roomPolygon('A193', 'A', '1', 'Flur', 11.4319, 48.7669),
		roomPolygon('A182', 'A', '1', 'Treppenhaus', 11.432, 48.7669),
		roomPolygon('A082', 'A', 'EG', 'Treppenhaus', 11.432, 48.7669),
		roomPolygon('A091', 'A', 'EG', 'Flur', 11.4319, 48.7669),
		roomPolygon('A001', 'A', 'EG', 'Seminarraum', 11.4318, 48.7669),
		roomPolygon('G091', 'G', 'EG', 'Flur', 11.433, 48.7663),
		roomPolygon('G001', 'G', 'EG', 'Seminarraum', 11.4331, 48.7663)
	]
}

const entrances: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		entrancePoint('A-east', 'A', 11.43205, 48.76695),
		entrancePoint('G-main', 'G', 11.43305, 48.76635)
	]
}

describe('outdoorTurnsFromPolyline', () => {
	it('emits a right turn for a clear outdoor corner', () => {
		// North, then east — right turn when traveling forward
		const turns = outdoorTurnsFromPolyline([
			[11.43, 48.766],
			[11.43, 48.7662],
			[11.4303, 48.7662]
		])
		expect(turns.map((step) => step.type)).toEqual(['turnRight'])
	})

	it('ignores nearly straight outdoor segments', () => {
		const turns = outdoorTurnsFromPolyline([
			[11.43, 48.766],
			[11.4301, 48.766],
			[11.4302, 48.766]
		])
		expect(turns).toEqual([])
	})
})

describe('buildCampusNavigationSteps', () => {
	const graph = buildCampusPathGraph(campus, entrances)

	it('builds outdoor → entrance → stairs → room landmarks', () => {
		const path = findCampusPath({
			graph,
			fromCoordinate: [11.4335, 48.7669],
			toRoom: 'A101'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const steps = buildCampusNavigationSteps({
			path,
			graph,
			outdoorPolylines: [
				[
					[11.4335, 48.7669],
					[11.4335, 48.7671],
					[11.43205, 48.7671]
				]
			]
		})

		expect(steps[0]?.type).toBe('walkOutdoors')
		expect(steps.map((step) => step.type)).toContain('turnLeft')
		expect(steps.map((step) => step.type)).toContain('enterBuilding')
		expect(steps.map((step) => step.type)).toContain('takeStairs')
		expect(steps.at(-1)).toEqual({ type: 'arrive', room: 'A101' })

		const stairs = steps.find((step) => step.type === 'takeStairs')
		expect(stairs?.floor).toBe('1')
	})

	it('connects buildings with leave / enter landmarks', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A001',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const steps = buildCampusNavigationSteps({ path, graph })
		expect(steps.map((step) => step.type)).toContain('leaveBuilding')
		expect(steps.map((step) => step.type)).toContain('enterBuilding')
		expect(steps.at(-1)).toEqual({ type: 'arrive', room: 'G001' })
	})

	it('sends upper-floor leavers down to EG before leaveBuilding', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'G001'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const steps = buildCampusNavigationSteps({ path, graph })
		const types = steps.map((step) => step.type)
		const stairsIndex = types.indexOf('takeStairs')
		const leaveIndex = types.indexOf('leaveBuilding')
		expect(stairsIndex).toBeGreaterThanOrEqual(0)
		expect(leaveIndex).toBeGreaterThan(stairsIndex)
		expect(steps[stairsIndex]?.floor).toBe('EG')
	})

	it('keeps same-floor corridor routes short', () => {
		const path = findCampusPath({
			graph,
			fromRoom: 'A101',
			toRoom: 'A182'
		})
		expect(path).toBeDefined()
		if (path == null) {
			return
		}

		const steps = buildCampusNavigationSteps({ path, graph })
		expect(steps.filter((step) => step.type === 'followCorridor')).toHaveLength(
			1
		)
		expect(steps.at(-1)).toEqual({ type: 'arrive', room: 'A182' })
		expect(steps.some((step) => step.type === 'walkOutdoors')).toBe(false)
	})
})
