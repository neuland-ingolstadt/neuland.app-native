import { buildingForEndpoint } from './campus-route'
import { getIndoorBuildingForCode, getIndoorRoomFloorsForCode } from './data'
import {
	defaultStartForBuilding,
	INDOOR_DEFAULT_START_ID,
	roomNodeId
} from './ids'
import type { IndoorData, IndoorGraph } from './types'

export function isCrossBuildingRoute(
	fromId: string,
	toId: string,
	entrances: IndoorData['entrances']
): boolean {
	const from = buildingForEndpoint(fromId, entrances)
	const to = buildingForEndpoint(toId, entrances)
	return from != null && to != null && from !== to
}

export function resolveIndoorNavEndpoints(
	graph: IndoorGraph,
	roomCode: string,
	fromId: string,
	overlayFloor: string | null
): { effectiveFromId: string; toId: string } | null {
	const floors = getIndoorRoomFloorsForCode(roomCode)
	if (floors.length === 0) {
		return null
	}
	const viewFloor = overlayFloor ?? floors[0] ?? 'EG'
	const floor = floors.find((f) => f === viewFloor) ?? floors[0] ?? viewFloor
	const toId = roomNodeId(floor, roomCode)
	if (!graph.nodes.has(toId)) {
		return null
	}
	const destinationBuilding = getIndoorBuildingForCode(roomCode) ?? 'G'
	const effectiveFromId =
		fromId === INDOOR_DEFAULT_START_ID
			? defaultStartForBuilding(destinationBuilding)
			: fromId
	if (!graph.nodes.has(effectiveFromId)) {
		return null
	}
	return { effectiveFromId, toId }
}

export function roomRouteNeedsOutdoorRouter(
	graph: IndoorGraph,
	data: IndoorData,
	roomCode: string,
	fromId: string,
	overlayFloor: string | null
): boolean {
	const endpoints = resolveIndoorNavEndpoints(
		graph,
		roomCode,
		fromId,
		overlayFloor
	)
	if (endpoints == null) {
		return false
	}
	return isCrossBuildingRoute(
		endpoints.effectiveFromId,
		endpoints.toId,
		data.entrances
	)
}
