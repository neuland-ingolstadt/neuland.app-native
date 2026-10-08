import { describe, expect, it } from 'bun:test'
import {
	addDirected,
	addUndirected,
	asWalkMask,
	distanceToRoomM,
	ensureNode,
	featureCentroid,
	isCirculation,
	isCorridor,
	isElevator,
	isStair,
	isStairRoomId,
	lineLen,
	roomsTouch,
	sharedEdgeMidpoint,
	stairHasDoorOnFloor
} from '@/utils/indoor-nav/graph-room-utils'
import type { GraphNode, LonLat, RoomFeature } from '@/utils/indoor-nav/types'

function squareRoom(
	raum: string,
	at: LonLat = [11.43, 48.76],
	size = 0.0001,
	funktion = 'Büro'
): RoomFeature {
	const [lon, lat] = at
	return {
		type: 'Feature',
		properties: {
			Standort: 'IN',
			Gebaeude: 'G',
			Etage: 'EG',
			Raum: raum,
			Funktion_de: funktion
		},
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[lon, lat],
					[lon + size, lat],
					[lon + size, lat + size],
					[lon, lat + size],
					[lon, lat]
				]
			]
		}
	}
}

describe('graph-room-utils predicates', () => {
	it('classifies circulation functions', () => {
		expect(isCorridor('Flur')).toBe(true)
		expect(isCorridor('Atrium')).toBe(true)
		expect(isCorridor('Büro')).toBe(false)
		expect(isCorridor(undefined)).toBe(false)
		expect(isStair('Treppenhaus')).toBe(true)
		expect(isStair('Fluchtreppe')).toBe(true)
		expect(isStair('Flur')).toBe(false)
		expect(isElevator('Fahrstuhl')).toBe(true)
		expect(isElevator('Flur')).toBe(false)
		expect(isCirculation('Flur')).toBe(true)
		expect(isCirculation('Treppenhaus')).toBe(true)
		expect(isCirculation('Fahrstuhl')).toBe(true)
		expect(isCirculation('Büro')).toBe(false)
	})

	it('detects staircase rooms by graph node id', () => {
		const stair = squareRoom('T1', [11.43, 48.76], 0.0001, 'Treppenhaus')
		const graph = {
			nodes: new Map<string, GraphNode>([
				[
					'room:EG:T1',
					{
						id: 'room:EG:T1',
						kind: 'room',
						floor: 'EG',
						coord: [11.43, 48.76] as LonLat,
						roomCode: 'T1'
					} as GraphNode
				],
				[
					'room:EG:G001',
					{
						id: 'room:EG:G001',
						kind: 'room',
						floor: 'EG',
						coord: [11.43, 48.76] as LonLat,
						roomCode: 'G001'
					} as GraphNode
				]
			]),
			edges: new Map(),
			roomsIndex: new Map([
				['EG:T1', stair],
				['EG:G001', squareRoom('G001')]
			]),
			circulation: {},
			corridors: {},
			roomNodeId: (floor: string, raum: string) => `room:${floor}:${raum}`
		}
		expect(isStairRoomId(graph, 'room:EG:T1')).toBe(true)
		expect(isStairRoomId(graph, 'room:EG:G001')).toBe(false)
		expect(isStairRoomId(graph, 'nope')).toBe(false)
	})
})

describe('graph-room-utils geometry helpers', () => {
	it('computes centroids and walk masks', () => {
		const room = squareRoom('G001', [10, 20], 0.002)
		const centroid = featureCentroid(room)
		expect(centroid[0]).toBeCloseTo(10.001, 5)
		expect(centroid[1]).toBeCloseTo(20.001, 5)
		expect(asWalkMask(room)).toBe(room)
	})

	it('returns zero distance inside a room and positive distance outside', () => {
		const room = squareRoom('G001', [11.43, 48.76], 0.001)
		expect(distanceToRoomM([11.4305, 48.7605], room)).toBe(0)
		expect(distanceToRoomM([11.45, 48.77], room)).toBeGreaterThan(0)
	})

	it('detects touching rooms and shared edge midpoints', () => {
		const a = squareRoom('A', [11.43, 48.76], 0.0001)
		const b = squareRoom('B', [11.4301, 48.76], 0.0001)
		const far = squareRoom('C', [11.5, 48.8], 0.0001)
		expect(roomsTouch(a, b)).toBe(true)
		expect(roomsTouch(a, far)).toBe(false)
		const mid = sharedEdgeMidpoint(a, b)
		expect(mid).toHaveLength(2)
		expect(
			lineLen([
				[0, 0],
				[3, 4]
			])
		).toBeGreaterThan(0)
	})
})

describe('graph-room-utils edge helpers', () => {
	it('adds undirected edges in both directions', () => {
		const edges = new Map()
		addUndirected(edges, { from: 'a', to: 'b', weight: 1, kind: 'corridor' })
		addUndirected(edges, { from: 'a', to: 'c', weight: 2, kind: 'corridor' })
		expect(edges.get('a')).toHaveLength(2)
		expect(edges.get('b')).toHaveLength(1)
		expect(edges.get('b')?.[0]).toMatchObject({ from: 'b', to: 'a' })
		expect(edges.get('c')?.[0]).toMatchObject({ from: 'c', to: 'a' })
	})

	it('adds directed edges in one direction only', () => {
		const edges = new Map()
		addDirected(edges, { from: 'b', to: 'a', weight: 1, kind: 'vertical' })
		expect(edges.get('b')).toHaveLength(1)
		expect(edges.has('a')).toBe(false)
	})

	it('matches stair doors by floor prefix and keeps first nodes', () => {
		expect(stairHasDoorOnFloor(new Set(['EG:T1:x']), 'EG', 'T1')).toBe(true)
		expect(stairHasDoorOnFloor(new Set(['1:T1:x']), 'EG', 'T1')).toBe(false)
		expect(stairHasDoorOnFloor(new Set(), 'EG', 'T1')).toBe(false)
		const nodes = new Map<string, GraphNode>()
		const node: GraphNode = {
			id: 'n',
			kind: 'room',
			floor: 'EG',
			coord: [0, 0]
		}
		ensureNode(nodes, node)
		ensureNode(nodes, { ...node, coord: [1, 1] })
		expect(nodes.get('n')?.coord).toEqual([0, 0])
	})
})
