import { getFixedT } from '@/localization/i18n-fixed-t'
import { routeOnCorridor } from './corridor'
import { STAIR_DISTANCE_M, STAIR_DURATION_S, walkDurationSec } from './format'
import { haversineM } from './geometry'
import {
	appendPath,
	asWalkMask,
	isCirculation,
	isStair,
	isStairRoomId,
	lineLen
} from './graph-room-utils'
import { placeLabel } from './maneuvers'
import type {
	FloorChange,
	FloorSegment,
	GraphEdge,
	IndoorGraph,
	LonLat,
	RouteResult
} from './types'
import { gridPath, stringPull, type WalkMask } from './walkable'

/** Segment labels only — routing has no UI locale; matches legacy German campus default. */
function routePlaceLabel(graph: IndoorGraph, nodeId: string): string {
	return placeLabel(graph, nodeId, getFixedT('de', 'indoor-nav'))
}

/** Mask for walking from node A to node B on the same floor. */
function masksForHop(
	graph: IndoorGraph,
	fromId: string,
	toId: string,
	floor: string
): WalkMask[] {
	const circ = graph.circulation[floor] ?? []
	const masks: WalkMask[] = [...circ]

	const addRoomIfNeeded = (id: string): void => {
		if (!id.startsWith('room:')) {
			return
		}
		const parts = id.split(':')
		const room = graph.roomsIndex.get(`${parts[1]}:${parts[2]}`)
		if (room == null) {
			return
		}
		if (!isCirculation(room.properties.Funktion_de)) {
			masks.push(asWalkMask(room))
		}
	}

	addRoomIfNeeded(fromId)
	addRoomIfNeeded(toId)

	if (fromId.startsWith('door:') || toId.startsWith('door:')) {
		const doorId = fromId.startsWith('door:') ? fromId : toId
		const door = graph.nodes.get(doorId)
		if (door?.roomCode != null) {
			const room = graph.roomsIndex.get(`${floor}:${door.roomCode}`)
			if (room != null && !isCirculation(room.properties.Funktion_de)) {
				masks.push(asWalkMask(room))
			}
		}
	}

	return masks
}

function expandHop(graph: IndoorGraph, fromId: string, toId: string): LonLat[] {
	const a = graph.nodes.get(fromId)
	const b = graph.nodes.get(toId)
	if (a == null || b == null) {
		return []
	}
	const floor = String(a.floor)
	const masks = masksForHop(graph, fromId, toId, floor)
	const net = graph.corridors[floor]

	// Room ↔ its own door: always a straight stub (grid A* zigzags inside the room).
	const roomDoorIntra =
		(a.kind === 'room' && b.kind === 'door' && b.roomCode === a.roomCode) ||
		(b.kind === 'room' && a.kind === 'door' && a.roomCode === b.roomCode)
	if (roomDoorIntra) {
		return [a.coord, b.coord]
	}

	// Entrance ↔ snapped room: straight vestibule stub. Corridor A* otherwise
	// detours along the Flur spine (e.g. E02 → past E01 → G064).
	if (
		(a.kind === 'entrance' && b.kind === 'room') ||
		(b.kind === 'entrance' && a.kind === 'room')
	) {
		return [a.coord, b.coord]
	}

	if (net != null) {
		const fromIsAccess = a.kind === 'door' || a.kind === 'entrance'
		const toIsAccess = b.kind === 'door' || b.kind === 'entrance'
		const onNet = routeOnCorridor(a.coord, b.coord, net, masks, {
			directStubFrom: fromIsAccess,
			directStubTo: toIsAccess
		})
		if (onNet != null && onNet.length >= 2) {
			return onNet
		}
	}
	const path = gridPath(a.coord, b.coord, masks)
	if (path != null && path.length >= 2) {
		return path
	}
	return [a.coord, b.coord]
}

function topologicalRoute(
	graph: IndoorGraph,
	fromId: string,
	toId: string
): { nodeIds: string[]; hops: RouteResult['hops'] } | null {
	if (!graph.nodes.has(fromId) || !graph.nodes.has(toId)) {
		return null
	}
	if (fromId === toId) {
		return { nodeIds: [fromId], hops: [] }
	}

	const dist = new Map<string, number>()
	const prev = new Map<string, { id: string; edge: GraphEdge }>()
	const open = new Set<string>([fromId])
	dist.set(fromId, 0)

	const heuristic = (id: string): number =>
		haversineM(
			graph.nodes.get(id)?.coord ?? [0, 0],
			graph.nodes.get(toId)?.coord ?? [0, 0]
		)

	while (open.size > 0) {
		let current: string | null = null
		let bestF = Number.POSITIVE_INFINITY
		for (const id of open) {
			const g = dist.get(id) ?? Number.POSITIVE_INFINITY
			const f = g + heuristic(id)
			if (f < bestF) {
				bestF = f
				current = id
			}
		}
		if (current == null) {
			break
		}
		if (current === toId) {
			break
		}
		open.delete(current)

		for (const edge of graph.edges.get(current) ?? []) {
			const bias =
				edge.kind === 'via_door' ? 0 : edge.kind === 'corridor' ? 0.2 : 0.35
			const tentative =
				(dist.get(current) ?? Number.POSITIVE_INFINITY) + edge.weight + bias
			if (tentative < (dist.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
				dist.set(edge.to, tentative)
				prev.set(edge.to, { id: current, edge })
				open.add(edge.to)
			}
		}
	}

	if (!prev.has(toId)) {
		return null
	}

	const nodeIds: string[] = [toId]
	const hops: RouteResult['hops'] = []
	let cur = toId
	while (cur !== fromId) {
		const step = prev.get(cur)
		if (step == null) {
			return null
		}
		hops.unshift({ from: step.id, to: cur, kind: step.edge.kind })
		cur = step.id
		nodeIds.unshift(cur)
	}
	return { nodeIds, hops }
}

function isAnchorNode(
	graph: IndoorGraph,
	id: string,
	endpoints: Set<string>
): boolean {
	const n = graph.nodes.get(id)
	if (n == null) {
		return false
	}
	if (endpoints.has(id)) {
		return true
	}
	if (n.kind === 'door' || n.kind === 'portal' || n.kind === 'entrance') {
		return true
	}
	if (n.kind === 'room' && n.roomCode != null) {
		const room = graph.roomsIndex.get(`${n.floor}:${n.roomCode}`)
		return isStair(room?.properties.Funktion_de)
	}
	return false
}

function isAccessAnchor(
	graph: IndoorGraph,
	id: string,
	endpoints: Set<string>
): boolean {
	if (endpoints.has(id)) {
		return true
	}
	const n = graph.nodes.get(id)
	if (n == null) {
		return false
	}
	if (n.kind === 'door' || n.kind === 'entrance') {
		return true
	}
	return false
}

function stairDoorInPath(
	graph: IndoorGraph,
	stairRoomId: string,
	nodeIds: string[]
): string | null {
	const stair = graph.nodes.get(stairRoomId)
	if (stair?.roomCode == null) {
		return null
	}
	const doorId = nodeIds.find((nid) => {
		const d = graph.nodes.get(nid)
		return (
			d?.kind === 'door' &&
			d.roomCode === stair.roomCode &&
			String(d.floor) === String(stair.floor)
		)
	})
	return doorId ?? null
}

function expandFloorSegment(graph: IndoorGraph, nodeIds: string[]): LonLat[] {
	if (nodeIds.length === 0) {
		return []
	}
	const endpoints = new Set([nodeIds[0], nodeIds[nodeIds.length - 1]])
	const first = graph.nodes.get(nodeIds[0])
	if (first == null) {
		return []
	}
	const floor = String(first.floor)
	const net = graph.corridors[floor]

	let anchors =
		net != null
			? nodeIds.filter((id) => isAccessAnchor(graph, id, endpoints))
			: nodeIds.filter((id) => isAnchorNode(graph, id, endpoints))
	if (anchors[0] !== nodeIds[0]) {
		anchors.unshift(nodeIds[0])
	}
	if (anchors[anchors.length - 1] !== nodeIds[nodeIds.length - 1]) {
		anchors.push(nodeIds[nodeIds.length - 1])
	}

	let arriveFromStair: string | null = null
	let leaveToStair: string | null = null
	if (isStairRoomId(graph, anchors[0])) {
		const doorId = stairDoorInPath(graph, anchors[0], nodeIds)
		if (doorId != null) {
			arriveFromStair = anchors[0]
			anchors[0] = doorId
		}
	}
	const last = anchors.length - 1
	if (isStairRoomId(graph, anchors[last])) {
		const doorId = stairDoorInPath(graph, anchors[last], nodeIds)
		if (doorId != null) {
			leaveToStair = anchors[last]
			anchors[last] = doorId
		}
	}
	anchors = anchors.filter((id, i) => i === 0 || id !== anchors[i - 1])

	const coords: LonLat[] = []
	if (arriveFromStair != null) {
		appendPath(coords, expandHop(graph, arriveFromStair, anchors[0]))
	} else {
		const startCoord = graph.nodes.get(anchors[0])?.coord
		if (startCoord != null) {
			coords.push(startCoord)
		}
	}

	for (let i = 1; i < anchors.length; i++) {
		const a = anchors[i - 1]
		const b = anchors[i]
		appendPath(coords, expandHop(graph, a, b))
	}

	if (leaveToStair != null) {
		appendPath(
			coords,
			expandHop(graph, anchors[anchors.length - 1], leaveToStair)
		)
	}

	if (net != null) {
		return coords
	}
	const maskSet = new Set<WalkMask>()
	for (const m of graph.circulation[floor] ?? []) {
		maskSet.add(m)
	}
	for (let i = 1; i < anchors.length; i++) {
		for (const m of masksForHop(graph, anchors[i - 1], anchors[i], floor)) {
			maskSet.add(m)
		}
	}
	return stringPull(coords, [...maskSet])
}

function hopWalkMeters(graph: IndoorGraph, from: string, to: string): number {
	const edge = graph.edges.get(from)?.find((e) => e.to === to)
	if (edge != null) {
		return edge.weight
	}
	const a = graph.nodes.get(from)?.coord
	const b = graph.nodes.get(to)?.coord
	return haversineM(a ?? [0, 0], b ?? [0, 0])
}

/** Graph-only distance/duration for detail-sheet preview (no corridor expansion). */
export function routePreview(
	graph: IndoorGraph,
	fromId: string,
	toId: string
): Pick<RouteResult, 'distanceM' | 'durationSec'> | null {
	const topo = topologicalRoute(graph, fromId, toId)
	if (topo == null) {
		return null
	}
	if (topo.nodeIds.length === 1) {
		return { distanceM: 0, durationSec: 0 }
	}
	let distanceM = 0
	let durationSec = 0
	for (const hop of topo.hops) {
		if (hop.kind === 'vertical') {
			distanceM += STAIR_DISTANCE_M
			durationSec += STAIR_DURATION_S
		} else {
			const w = hopWalkMeters(graph, hop.from, hop.to)
			distanceM += w
			durationSec += walkDurationSec(w)
		}
	}
	return { distanceM, durationSec }
}

export function route(
	graph: IndoorGraph,
	fromId: string,
	toId: string
): RouteResult | null {
	const topo = topologicalRoute(graph, fromId, toId)
	if (topo == null) {
		return null
	}

	if (topo.nodeIds.length === 1) {
		const n = graph.nodes.get(fromId)
		if (n == null) {
			return null
		}
		return {
			nodeIds: topo.nodeIds,
			coords: [n.coord],
			floors: [String(n.floor)],
			distanceM: 0,
			durationSec: 0,
			hops: [],
			segments: [
				{
					floor: String(n.floor),
					coords: [n.coord],
					distanceM: 0,
					durationSec: 0
				}
			],
			floorChanges: []
		}
	}

	const segments: FloorSegment[] = []
	const floorChanges: FloorChange[] = []

	let run: string[] = [topo.nodeIds[0]]
	for (let i = 0; i < topo.hops.length; i++) {
		const hop = topo.hops[i]
		if (hop.kind === 'vertical') {
			const runFloor = String(graph.nodes.get(run[0])?.floor ?? '')
			const coords = expandFloorSegment(graph, run)
			const distanceM = lineLen(coords)
			segments.push({
				floor: runFloor,
				coords,
				distanceM,
				durationSec: walkDurationSec(distanceM),
				label: routePlaceLabel(graph, hop.from),
				startNodeId: run[0],
				endNodeId: run[run.length - 1]
			})

			const fromNode = graph.nodes.get(hop.from)
			const toNode = graph.nodes.get(hop.to)
			if (fromNode == null || toNode == null) {
				return null
			}
			floorChanges.push({
				fromFloor: String(fromNode.floor),
				toFloor: String(toNode.floor),
				at: fromNode.coord,
				viaFrom: routePlaceLabel(graph, hop.from),
				viaTo: routePlaceLabel(graph, hop.to),
				fromStairCode: fromNode.roomCode,
				toStairCode: toNode.roomCode,
				distanceM: STAIR_DISTANCE_M,
				durationSec: STAIR_DURATION_S
			})

			run = [hop.to]
			continue
		}
		run.push(hop.to)
	}

	if (run.length > 0) {
		const runFloor = String(graph.nodes.get(run[0])?.floor ?? '')
		const coords = expandFloorSegment(graph, run)
		const distanceM = lineLen(coords)
		segments.push({
			floor: runFloor,
			coords,
			distanceM,
			durationSec: walkDurationSec(distanceM),
			label: routePlaceLabel(graph, run[run.length - 1]),
			startNodeId: run[0],
			endNodeId: run[run.length - 1]
		})
	}

	const merged = mergeShaftHops(segments, floorChanges)

	const walkM = merged.segments.reduce((a, s) => a + s.distanceM, 0)
	const stairM = merged.floorChanges.reduce((a, c) => a + c.distanceM, 0)
	const walkSec = merged.segments.reduce((a, s) => a + s.durationSec, 0)
	const stairSec = merged.floorChanges.reduce((a, c) => a + c.durationSec, 0)

	return {
		nodeIds: topo.nodeIds,
		coords: merged.segments.flatMap((s) => s.coords),
		floors: [...new Set(merged.segments.map((s) => s.floor))],
		distanceM: walkM + stairM,
		durationSec: walkSec + stairSec,
		hops: topo.hops,
		segments: merged.segments,
		floorChanges: merged.floorChanges
	}
}

/** Middle-floor walk below this length counts as "staying in the staircase". */
const SHAFT_MERGE_WALK_M = 1.0

function mergeShaftHops(
	segments: FloorSegment[],
	floorChanges: FloorChange[]
): { segments: FloorSegment[]; floorChanges: FloorChange[] } {
	const segs: FloorSegment[] = []
	const changes: FloorChange[] = []
	let i = 0
	while (i < segments.length) {
		let seg = segments[i]
		let change = floorChanges[i]
		while (change != null) {
			const mid = segments[i + 1]
			const next = floorChanges[i + 1]
			if (mid == null || next == null) {
				break
			}
			if (mid.distanceM > SHAFT_MERGE_WALK_M) {
				break
			}
			if (change.toFloor !== mid.floor || mid.floor !== next.fromFloor) {
				break
			}
			if (
				change.toStairCode == null ||
				change.toStairCode !== next.fromStairCode
			) {
				break
			}
			seg = {
				...seg,
				coords: [...seg.coords, ...mid.coords.slice(1)],
				distanceM: seg.distanceM + mid.distanceM,
				durationSec: seg.durationSec + mid.durationSec,
				endNodeId: mid.endNodeId ?? seg.endNodeId,
				label: mid.label ?? seg.label
			}
			change = {
				...change,
				toFloor: next.toFloor,
				viaTo: next.viaTo,
				toStairCode: next.toStairCode,
				distanceM: change.distanceM + next.distanceM,
				durationSec: change.durationSec + next.durationSec
			}
			i += 1
		}
		segs.push(seg)
		if (change != null) {
			changes.push(change)
		}
		i += 1
	}
	return { segments: segs, floorChanges: changes }
}
