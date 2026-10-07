import {
	distanceToPolygonM,
	haversineM,
	nearestPointOnPolygon,
	type PolygonGeom,
	pointInPolygonGeom,
	polygonCentroid,
	polygonsMinGapM
} from './geometry'
import type {
	GraphEdge,
	GraphNode,
	IndoorGraph,
	LonLat,
	RoomFeature
} from './types'
import type { WalkMask } from './walkable'

/** Shared-wall tolerance: 8 cm buffer on each side (~16 cm gap still touches). */
export const ADJACENCY_GAP_M = 0.16
export const VERTICAL_MATCH_M = 8
export const ENTRANCE_SNAP_M = 25

export function isCorridor(fn?: string): boolean {
	return fn === 'Flur' || fn === 'Flur Entrepreneur' || fn === 'Atrium'
}

export function isStair(fn?: string): boolean {
	return fn === 'Treppenhaus' || fn === 'Fluchtreppe'
}

export function isStairRoomId(graph: IndoorGraph, id: string): boolean {
	const n = graph.nodes.get(id)
	if (n == null || n.kind !== 'room' || n.roomCode == null) {
		return false
	}
	const room = graph.roomsIndex.get(`${n.floor}:${n.roomCode}`)
	return isStair(room?.properties.Funktion_de)
}

export function isElevator(fn?: string): boolean {
	return fn === 'Fahrstuhl'
}

export function isCirculation(fn?: string): boolean {
	return isCorridor(fn) || isStair(fn) || isElevator(fn)
}

export function featureCentroid(f: RoomFeature): LonLat {
	return polygonCentroid(f.geometry as PolygonGeom)
}

export function asWalkMask(f: RoomFeature): WalkMask {
	return f as WalkMask
}

export function roomsTouch(a: RoomFeature, b: RoomFeature): boolean {
	return (
		polygonsMinGapM(a.geometry as PolygonGeom, b.geometry as PolygonGeom) <=
		ADJACENCY_GAP_M
	)
}

export function distanceToRoomM(coord: LonLat, room: RoomFeature): number {
	const geom = room.geometry as PolygonGeom
	if (pointInPolygonGeom(coord, geom)) {
		return 0
	}
	return Math.min(
		haversineM(coord, featureCentroid(room)),
		distanceToPolygonM(coord, geom)
	)
}

export function sharedEdgeMidpoint(a: RoomFeature, b: RoomFeature): LonLat {
	const ca = featureCentroid(a)
	const cb = featureCentroid(b)
	const mid: LonLat = [(ca[0] + cb[0]) / 2, (ca[1] + cb[1]) / 2]
	return nearestPointOnPolygon(mid, a.geometry as PolygonGeom)
}

export function addUndirected(
	edges: Map<string, GraphEdge[]>,
	edge: GraphEdge
): void {
	const reverse: GraphEdge = {
		...edge,
		from: edge.to,
		to: edge.from
	}
	if (!edges.has(edge.from)) {
		edges.set(edge.from, [])
	}
	if (!edges.has(reverse.from)) {
		edges.set(reverse.from, [])
	}
	edges.get(edge.from)?.push(edge)
	edges.get(reverse.from)?.push(reverse)
}

export function addDirected(
	edges: Map<string, GraphEdge[]>,
	edge: GraphEdge
): void {
	if (!edges.has(edge.from)) {
		edges.set(edge.from, [])
	}
	edges.get(edge.from)?.push(edge)
}

export function stairHasDoorOnFloor(
	doorPairKeys: Set<string>,
	floor: string,
	stairCode: string
): boolean {
	const prefix = `${floor}:${stairCode}:`
	for (const key of doorPairKeys) {
		if (key.startsWith(prefix)) {
			return true
		}
	}
	return false
}

export function ensureNode(
	nodes: Map<string, GraphNode>,
	node: GraphNode
): void {
	if (!nodes.has(node.id)) {
		nodes.set(node.id, node)
	}
}

function roomKey(r: RoomFeature): string {
	return `${r.properties.Etage}:${r.properties.Raum}`
}

export function matchStairShafts(
	lower: RoomFeature[],
	upper: RoomFeature[]
): Array<{ a: RoomFeature; b: RoomFeature; d: number }> {
	const pairs: Array<{ a: RoomFeature; b: RoomFeature; d: number }> = []
	for (const a of lower) {
		const aCoord = featureCentroid(a)
		for (const b of upper) {
			const d = haversineM(aCoord, featureCentroid(b))
			if (d <= VERTICAL_MATCH_M) {
				pairs.push({ a, b, d })
			}
		}
	}
	pairs.sort((x, y) => x.d - y.d)
	const usedLower = new Set<string>()
	const usedUpper = new Set<string>()
	const matched: Array<{ a: RoomFeature; b: RoomFeature; d: number }> = []
	for (const p of pairs) {
		const ak = roomKey(p.a)
		const bk = roomKey(p.b)
		if (usedLower.has(ak) || usedUpper.has(bk)) {
			continue
		}
		usedLower.add(ak)
		usedUpper.add(bk)
		matched.push(p)
	}
	return matched
}

export function lineLen(coords: LonLat[]): number {
	let d = 0
	for (let i = 1; i < coords.length; i++) {
		d += haversineM(coords[i - 1], coords[i])
	}
	return d
}

export function appendPath(dest: LonLat[], next: LonLat[]): void {
	for (const p of next) {
		const last = dest[dest.length - 1]
		if (last == null || haversineM(last, p) > 0.05) {
			dest.push(p)
		}
	}
}
