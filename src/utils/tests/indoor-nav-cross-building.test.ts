import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
	isCrossBuildingRoute,
	resolveIndoorNavEndpoints,
	roomRouteNeedsOutdoorRouter
} from '@/utils/indoor-nav/cross-building'
import { applyIndoorData, resetIndoorDataCache } from '@/utils/indoor-nav/data'
import type {
	EntranceFeature,
	GraphNode,
	IndoorData,
	RoomFeature
} from '@/utils/indoor-nav/types'

function room(code: string, floor = 'EG', gebaeude = 'G'): RoomFeature {
	return {
		type: 'Feature',
		properties: {
			Standort: 'IN',
			Gebaeude: gebaeude,
			Etage: floor,
			Raum: code,
			Funktion_de: 'Büro'
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
	}
}

function entrance(id: string, gebaeude: string): EntranceFeature {
	return {
		type: 'Feature',
		properties: { id, Standort: 'IN', Gebaeude: gebaeude, Etage: 'EG' },
		geometry: { type: 'Point', coordinates: [11.43, 48.76] }
	}
}

function testData(): IndoorData {
	return {
		roomsByFloor: {
			EG: [room('G001'), room('J001', 'EG', 'J')],
			'1': [room('G101', '1')]
		},
		doors: [],
		entrances: [entrance('IN-G-E01', 'G'), entrance('IN-J-E01', 'J')],
		corridorsByFloor: {}
	}
}

function testGraph() {
	const nodes = new Map<string, GraphNode>()
	for (const id of [
		'room:EG:G001',
		'room:EG:J001',
		'entrance:IN-G-E01',
		'entrance:IN-J-E01'
	]) {
		nodes.set(id, { id, kind: 'room', floor: 'EG', coord: [0, 0] })
	}
	return {
		nodes,
		edges: new Map(),
		roomsIndex: new Map(),
		circulation: {},
		corridors: {},
		roomNodeId: (floor: string, raum: string) => `room:${floor}:${raum}`
	}
}

describe('cross-building routes', () => {
	beforeEach(() => {
		resetIndoorDataCache()
	})

	afterEach(() => {
		resetIndoorDataCache()
	})

	it('detects routes across buildings', () => {
		const data = testData()
		expect(
			isCrossBuildingRoute('room:EG:G001', 'room:EG:J001', data.entrances)
		).toBe(true)
		expect(
			isCrossBuildingRoute('room:EG:G001', 'room:1:G101', data.entrances)
		).toBe(false)
		expect(
			isCrossBuildingRoute(
				'entrance:IN-G-E01',
				'entrance:IN-J-E01',
				data.entrances
			)
		).toBe(true)
		expect(isCrossBuildingRoute('nope', 'room:EG:G001', data.entrances)).toBe(
			false
		)
		expect(isCrossBuildingRoute('room:EG:G001', 'nope', data.entrances)).toBe(
			false
		)
	})

	it('resolves navigation endpoints for a room code', () => {
		applyIndoorData(testData())
		const graph = testGraph()
		expect(
			resolveIndoorNavEndpoints(graph, 'G001', 'entrance:IN-G-E01', null)
		).toEqual({ effectiveFromId: 'entrance:IN-G-E01', toId: 'room:EG:G001' })
		// Unknown room codes cannot be routed.
		expect(
			resolveIndoorNavEndpoints(graph, 'NOPE', 'entrance:IN-G-E01', null)
		).toBeNull()
		// Rooms missing from the graph cannot be routed.
		expect(
			resolveIndoorNavEndpoints(graph, 'G101', 'entrance:IN-G-E01', 'EG')
		).toBeNull()
		// Unknown start nodes cannot be routed.
		expect(
			resolveIndoorNavEndpoints(graph, 'G001', 'entrance:IN-Z-E99', null)
		).toBeNull()
	})

	it('starts at the destination building entrance by default', () => {
		applyIndoorData(testData())
		const graph = testGraph()
		// The default start id resolves to the destination building entrance.
		const endpoints = resolveIndoorNavEndpoints(
			graph,
			'J001',
			'entrance:IN-G-E01',
			null
		)
		expect(endpoints).toEqual({
			effectiveFromId: 'entrance:IN-J-E01',
			toId: 'room:EG:J001'
		})
	})

	it('flags room routes that need the outdoor router', () => {
		applyIndoorData(testData())
		const data = testData()
		const graph = testGraph()
		// G room → J room spans buildings, so the outdoor router is needed.
		expect(
			roomRouteNeedsOutdoorRouter(graph, data, 'J001', 'room:EG:G001', null)
		).toBe(true)
		// Same-building routes stay indoors.
		expect(
			roomRouteNeedsOutdoorRouter(graph, data, 'G001', 'room:EG:G001', null)
		).toBe(false)
		expect(
			roomRouteNeedsOutdoorRouter(
				graph,
				data,
				'NOPE',
				'entrance:IN-G-E01',
				null
			)
		).toBe(false)
	})
})
