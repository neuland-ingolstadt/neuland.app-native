import { buildCorridorNet, type CorridorNet } from './corridor'
import { FLOORS } from './floors'
import { haversineM } from './geometry'
import {
	addDirected,
	addUndirected,
	asWalkMask,
	distanceToRoomM,
	ENTRANCE_SNAP_M,
	ensureNode,
	featureCentroid,
	isCirculation,
	isCorridor,
	isElevator,
	isStair,
	matchStairShafts,
	roomsTouch,
	sharedEdgeMidpoint,
	stairHasDoorOnFloor
} from './graph-room-utils'
import { doorNodeId, entranceNodeId, portalNodeId, roomNodeId } from './ids'
import type {
	EntranceFeature,
	GraphEdge,
	GraphNode,
	IndoorData,
	IndoorGraph,
	LonLat,
	RoomFeature
} from './types'
import type { WalkMask } from './walkable'

export function buildIndoorGraph(data: IndoorData): IndoorGraph {
	const nodes = new Map<string, GraphNode>()
	const edges = new Map<string, GraphEdge[]>()
	const roomsIndex = new Map<string, RoomFeature>()
	const circulation: Record<string, WalkMask[]> = {}
	const corridors: Record<string, CorridorNet | null> = {}

	for (const floor of FLOORS) {
		circulation[floor] = []
		corridors[floor] = buildCorridorNet(
			floor,
			data.corridorsByFloor[floor] ?? []
		)
		for (const room of data.roomsByFloor[floor] ?? []) {
			const code = room.properties.Raum
			const id = roomNodeId(floor, code)
			roomsIndex.set(`${floor}:${code}`, room)
			const fn = room.properties.Funktion_de
			ensureNode(nodes, {
				id,
				kind: 'room',
				floor,
				coord: featureCentroid(room),
				label:
					fn === 'Treppenhaus' || fn === 'Flur' || fn === 'Atrium'
						? fn
						: `${code}${fn != null && fn !== '' ? ` · ${fn}` : ''}`,
				roomCode: code
			})
			if (isCirculation(fn)) {
				circulation[floor].push(asWalkMask(room))
			}
		}
	}

	const doorPairKeys = new Set<string>()
	for (const door of data.doors) {
		const p = door.properties
		const floor = String(p.Etage)
		const coord = door.geometry.coordinates as LonLat
		const dId = doorNodeId(p.id)
		ensureNode(nodes, {
			id: dId,
			kind: 'door',
			floor,
			coord,
			label: p.id,
			viaDoor: true,
			roomCode: p.Raum
		})

		const room = roomsIndex.get(`${floor}:${p.Raum}`)
		const flur = roomsIndex.get(`${floor}:${p.Flur}`)
		doorPairKeys.add(`${floor}:${p.Raum}:${p.Flur}`)
		doorPairKeys.add(`${floor}:${p.Flur}:${p.Raum}`)

		if (room != null) {
			const rId = roomNodeId(floor, p.Raum)
			addUndirected(edges, {
				from: rId,
				to: dId,
				weight: haversineM(nodes.get(rId)?.coord ?? coord, coord),
				kind: 'via_door',
				viaDoorId: p.id
			})
		}
		if (flur != null) {
			const fId = roomNodeId(floor, p.Flur)
			addUndirected(edges, {
				from: dId,
				to: fId,
				weight: haversineM(coord, nodes.get(fId)?.coord ?? coord),
				kind: 'via_door',
				viaDoorId: p.id
			})
		}
	}

	for (const floor of FLOORS) {
		const rooms = data.roomsByFloor[floor] ?? []
		for (let i = 0; i < rooms.length; i++) {
			for (let j = i + 1; j < rooms.length; j++) {
				const a = rooms[i]
				const b = rooms[j]
				const fa = a.properties.Funktion_de
				const fb = b.properties.Funktion_de
				if (!(isCorridor(fa) && isCorridor(fb))) {
					continue
				}
				if (!roomsTouch(a, b)) {
					continue
				}

				const mid = sharedEdgeMidpoint(a, b)
				const pId = portalNodeId(floor, a.properties.Raum, b.properties.Raum)
				ensureNode(nodes, {
					id: pId,
					kind: 'portal',
					floor,
					coord: mid,
					label: `${a.properties.Raum}↔${b.properties.Raum}`
				})
				const aId = roomNodeId(floor, a.properties.Raum)
				const bId = roomNodeId(floor, b.properties.Raum)
				addUndirected(edges, {
					from: aId,
					to: pId,
					weight: haversineM(nodes.get(aId)?.coord ?? mid, mid),
					kind: 'corridor'
				})
				addUndirected(edges, {
					from: pId,
					to: bId,
					weight: haversineM(mid, nodes.get(bId)?.coord ?? mid),
					kind: 'corridor'
				})
			}
		}
	}

	const stairsByFloor: Record<string, RoomFeature[]> = {}
	const elevatorsByFloor: Record<string, RoomFeature[]> = {}
	for (const floor of FLOORS) {
		stairsByFloor[floor] = (data.roomsByFloor[floor] ?? []).filter((r) =>
			isStair(r.properties.Funktion_de)
		)
		elevatorsByFloor[floor] = (data.roomsByFloor[floor] ?? []).filter((r) =>
			isElevator(r.properties.Funktion_de)
		)
	}
	const egRooms = data.roomsByFloor.EG ?? []
	const entranceSnaps: Array<{
		entrance: EntranceFeature
		room: RoomFeature
		d: number
	}> = []
	const stairsWithEntrance = new Set<string>()
	for (const entrance of data.entrances) {
		const coord = entrance.geometry.coordinates as LonLat
		const building = entrance.properties.Gebaeude
		let best: RoomFeature | null = null
		let bestScore = Number.POSITIVE_INFINITY
		let bestD = Number.POSITIVE_INFINITY
		for (const room of egRooms) {
			if (room.properties.Gebaeude !== building) {
				continue
			}
			const d = distanceToRoomM(coord, room)
			if (d > ENTRANCE_SNAP_M) {
				continue
			}
			const score = d - (isCorridor(room.properties.Funktion_de) ? 0.4 : 0)
			if (score < bestScore) {
				bestScore = score
				bestD = d
				best = room
			}
		}
		if (best == null) {
			continue
		}
		entranceSnaps.push({ entrance, room: best, d: bestD })
		if (isStair(best.properties.Funktion_de)) {
			stairsWithEntrance.add(best.properties.Raum)
		}
	}

	for (let fi = 0; fi < FLOORS.length - 1; fi++) {
		const lower = FLOORS[fi]
		const upper = FLOORS[fi + 1]
		// Stair shafts are matched per building — buildings are disconnected
		// graphs and must never share vertical edges.
		const lowerStairs = stairsByFloor[lower] ?? []
		const upperStairs = stairsByFloor[upper] ?? []
		const lowerElevators = elevatorsByFloor[lower] ?? []
		const upperElevators = elevatorsByFloor[upper] ?? []
		const buildings = new Set([
			...lowerStairs.map((r) => r.properties.Gebaeude),
			...upperStairs.map((r) => r.properties.Gebaeude)
		])
		for (const building of buildings) {
			for (const { a, b, d } of matchStairShafts(
				lowerStairs.filter((r) => r.properties.Gebaeude === building),
				upperStairs.filter((r) => r.properties.Gebaeude === building)
			)) {
				const aId = roomNodeId(lower, a.properties.Raum)
				const bId = roomNodeId(upper, b.properties.Raum)
				const weight = 3.5 + d
				const lowerOpen =
					stairHasDoorOnFloor(doorPairKeys, lower, a.properties.Raum) ||
					(lower === 'EG' && stairsWithEntrance.has(a.properties.Raum))
				if (lowerOpen) {
					addUndirected(edges, { from: aId, to: bId, weight, kind: 'vertical' })
				} else {
					addDirected(edges, { from: bId, to: aId, weight, kind: 'vertical' })
				}
			}
		}
		const elevatorBuildings = new Set([
			...lowerElevators.map((r) => r.properties.Gebaeude),
			...upperElevators.map((r) => r.properties.Gebaeude)
		])
		for (const building of elevatorBuildings) {
			for (const { a, b, d } of matchStairShafts(
				lowerElevators.filter((r) => r.properties.Gebaeude === building),
				upperElevators.filter((r) => r.properties.Gebaeude === building)
			)) {
				const aId = roomNodeId(lower, a.properties.Raum)
				const bId = roomNodeId(upper, b.properties.Raum)
				addUndirected(edges, {
					from: aId,
					to: bId,
					weight: 2.5 + d,
					kind: 'vertical'
				})
			}
		}
	}

	for (const { entrance, room, d } of entranceSnaps) {
		const eId = entranceNodeId(entrance.properties.id)
		ensureNode(nodes, {
			id: eId,
			kind: 'entrance',
			floor: String(entrance.properties.Etage || 'EG'),
			coord: entrance.geometry.coordinates as LonLat,
			label: entrance.properties.name_de || entrance.properties.id
		})
		const rId = roomNodeId('EG', room.properties.Raum)
		addUndirected(edges, {
			from: eId,
			to: rId,
			weight: Math.max(d, 0.5),
			kind: 'entrance'
		})
	}

	return { nodes, edges, roomsIndex, circulation, corridors, roomNodeId }
}

export function listRoutableRooms(
	data: IndoorData
): Array<{ floor: string; code: string; label: string; funktion?: string }> {
	const out: Array<{
		floor: string
		code: string
		label: string
		funktion?: string
	}> = []
	for (const floor of FLOORS) {
		for (const room of data.roomsByFloor[floor] ?? []) {
			const code = room.properties.Raum
			const funktion = room.properties.Funktion_de
			if (isCirculation(funktion)) {
				continue
			}
			out.push({
				floor,
				code,
				funktion,
				label: `${code}${funktion != null && funktion !== '' ? ` · ${funktion}` : ''}`
			})
		}
	}
	return out.sort((a, b) => a.label.localeCompare(b.label, 'de'))
}
