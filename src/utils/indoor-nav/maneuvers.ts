import type { TFunction } from 'i18next'
import { FLOOR_ORDER } from './floors'
import { haversineM } from './geometry'
import { isCirculation, isStairRoomId } from './graph-room-utils'
import {
	indoorNavFloorLabel,
	indoorNavPlaceForFunction
} from './indoor-nav-i18n'
import type {
	FloorChange,
	FloorSegment,
	IndoorGraph,
	LonLat,
	RouteResult
} from './types'

/** Prefer Funktion over room codes for navigation copy (Flur / Treppenhaus). */
export function placeLabel(
	graph: IndoorGraph,
	nodeId: string,
	t: TFunction<'indoor-nav'>
): string {
	const n = graph.nodes.get(nodeId)
	if (n == null) {
		return nodeId
	}
	if (n.kind === 'entrance') {
		return n.label || t('place.entranceFallback')
	}
	if (n.roomCode != null) {
		const room = graph.roomsIndex.get(`${n.floor}:${n.roomCode}`)
		const fn = room?.properties.Funktion_de
		const place = indoorNavPlaceForFunction(t, fn)
		if (place != null) {
			return place
		}
		if (n.label != null) {
			return n.label
		}
		return n.roomCode
	}
	return n.label || nodeId
}

// Turn-by-turn maneuvers ported verbatim from neuland-map-data/indoor-nav/g/src/lib/graph.ts — keep in sync.
function isRoutableRoom(graph: IndoorGraph, nodeId: string): boolean {
	const n = graph.nodes.get(nodeId)
	if (n == null || n.kind !== 'room' || n.roomCode == null) {
		return false
	}
	const fn = graph.roomsIndex.get(`${n.floor}:${n.roomCode}`)?.properties
		.Funktion_de
	if (fn === 'Luftraum') {
		return false
	}
	return !isCirculation(fn)
}

/** Turn-by-turn headline for one floor-walk leg. */
export function walkStepManeuver(
	graph: IndoorGraph,
	fromId: string,
	toId: string,
	result: RouteResult,
	legIndex: number,
	t: TFunction<'indoor-nav'>,
	opts?: {
		nextIsStairs?: boolean
		isLastJourneyStep?: boolean
		isFirstWalkStep?: boolean
	}
): { headline: string; subline?: string } {
	const seg = result.segments[legIndex]
	if (!seg) {
		return {
			headline: t('guidance.followPath'),
			subline: t('guidance.followBlueLine')
		}
	}

	const firstLeg = legIndex === 0
	const lastLeg = legIndex === result.segments.length - 1
	const firstWalk = opts?.isFirstWalkStep ?? firstLeg
	const lastWalk = opts?.isLastJourneyStep ?? lastLeg
	const nextIsStairs =
		opts?.nextIsStairs ?? Boolean(result.floorChanges[legIndex])
	const flWord = indoorNavFloorLabel(t, seg.floor)
	const startId = seg.startNodeId
	const endId = seg.endNodeId

	const fromRoom = isRoutableRoom(graph, fromId)
	const toRoom = isRoutableRoom(graph, toId)
	const fromCode = fromRoom ? graph.nodes.get(fromId)?.roomCode : undefined
	const toCode = toRoom ? graph.nodes.get(toId)?.roomCode : undefined
	const entranceName = (id: string) => placeLabel(graph, id, t)

	if (firstWalk && lastWalk) {
		if (fromId.startsWith('entrance:') && toRoom) {
			return {
				headline: t('guidance.enterRoom', { code: toCode ?? '' }),
				subline: t('guidance.fromEntrance', {
					name: entranceName(fromId)
				})
			}
		}
		if (fromRoom && toRoom && fromCode !== toCode) {
			return {
				headline: t('guidance.goToRoom', { code: toCode ?? '' }),
				subline: t('guidance.leaveAndFollow', {
					from: fromCode ?? ''
				})
			}
		}
		if (fromRoom && toId.startsWith('entrance:')) {
			return {
				headline: t('guidance.leaveBuilding'),
				subline: t('guidance.exitVia', { name: entranceName(toId) })
			}
		}
		if (fromId.startsWith('entrance:') && toId.startsWith('entrance:')) {
			return {
				headline: t('guidance.walkExit'),
				subline: entranceName(toId)
			}
		}
	}

	if (firstWalk && !lastWalk) {
		if (fromId.startsWith('entrance:')) {
			return {
				headline: t('guidance.enterBuilding'),
				subline: t('guidance.viaEntrance', {
					name: entranceName(fromId)
				})
			}
		}
		if (fromRoom) {
			return {
				headline: t('guidance.leaveRoom', { code: fromCode ?? '' }),
				subline: t('guidance.headCorridor')
			}
		}
		return {
			headline: t('guidance.walkCorridor'),
			subline: t('guidance.followBlue')
		}
	}

	if (lastWalk && !firstWalk) {
		if (toId.startsWith('entrance:')) {
			return {
				headline: t('guidance.leaveBuilding'),
				subline: t('guidance.exitVia', { name: entranceName(toId) })
			}
		}
		if (toRoom) {
			return {
				headline: t('guidance.enterRoom', { code: toCode ?? '' }),
				subline: t('guidance.toDoor')
			}
		}
		return {
			headline: t('guidance.continueDest'),
			subline: t('guidance.followBlue')
		}
	}

	if (nextIsStairs) {
		if (endId && isStairRoomId(graph, endId)) {
			return {
				headline: t('guidance.enterStaircase'),
				subline: t('guidance.followBlue')
			}
		}
		return {
			headline: t('guidance.walkStairs'),
			subline: t('guidance.followBlue')
		}
	}

	if (legIndex > 0 && startId && isStairRoomId(graph, startId)) {
		return {
			headline: t('guidance.leaveStaircase'),
			subline: `${flWord}`
		}
	}

	if (legIndex > 0 && result.floorChanges[legIndex - 1]) {
		return {
			headline: t('guidance.continueCorridor'),
			subline: flWord
		}
	}

	return {
		headline: t('guidance.continueFloor'),
		subline: t('guidance.followBlue')
	}
}

export function stairStepManeuver(
	change: FloorChange,
	t: TFunction<'indoor-nav'>
): { headline: string; subline: string } {
	const up =
		(FLOOR_ORDER[change.toFloor] ?? 0) > (FLOOR_ORDER[change.fromFloor] ?? 0)
	return {
		headline: t(`guidance.${up ? 'stairsUp' : 'stairsDown'}`),
		subline: t('guidance.stairsSub', {
			from: indoorNavFloorLabel(t, change.fromFloor),
			to: indoorNavFloorLabel(t, change.toFloor)
		})
	}
}
function legNodeIdsForSegment(
	result: RouteResult,
	segment: FloorSegment
): string[] {
	const start = segment.startNodeId
	const end = segment.endNodeId
	if (start == null || end == null) {
		return []
	}
	const all = result.nodeIds
	const i0 = all.indexOf(start)
	const i1 = all.indexOf(end)
	if (i0 < 0 || i1 < 0 || i1 < i0) {
		return []
	}
	return all.slice(i0, i1 + 1)
}

const ROOM_ENTRY_DOOR_MAX_M = 4

/**
 * Split a floor leg that ends at a room: corridor polyline up to the door,
 * then the short stub from door into the room (off the main indoor path).
 */
export function splitSegmentAtRoomEntry(
	graph: IndoorGraph,
	result: RouteResult,
	segment: FloorSegment
): { corridor: LonLat[]; roomStub: LonLat[] } | null {
	const endId = segment.endNodeId
	const endNode = endId != null ? graph.nodes.get(endId) : undefined
	if (endNode?.kind !== 'room') {
		return null
	}
	const legNodes = legNodeIdsForSegment(result, segment)
	let doorId: string | undefined
	for (let i = legNodes.length - 2; i >= 0; i--) {
		const id = legNodes[i]
		if (graph.nodes.get(id)?.kind === 'door') {
			doorId = id
			break
		}
	}
	if (doorId == null) {
		return null
	}
	const doorCoord = graph.nodes.get(doorId)?.coord
	if (doorCoord == null) {
		return null
	}
	const coords = segment.coords
	if (coords.length < 2) {
		return null
	}
	let bestI = 0
	let bestD = Number.POSITIVE_INFINITY
	for (let i = 0; i < coords.length; i++) {
		const d = haversineM(coords[i], doorCoord)
		if (d < bestD) {
			bestD = d
			bestI = i
		}
	}
	if (bestD > ROOM_ENTRY_DOOR_MAX_M) {
		return null
	}
	const corridor = coords.slice(0, bestI + 1)
	const roomStub = coords.slice(bestI)
	if (corridor.length < 2 || roomStub.length < 2) {
		return null
	}
	let stubLen = 0
	for (let i = 1; i < roomStub.length; i++) {
		stubLen += haversineM(roomStub[i - 1], roomStub[i])
	}
	if (!(stubLen > 0.05)) {
		return null
	}
	return { corridor, roomStub }
}
