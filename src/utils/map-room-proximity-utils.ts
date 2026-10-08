import type { FeatureCollection } from 'geojson'
import type { MapCoordinate } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import {
	getFloorDistance,
	normalizeCampusKey,
	ROOMS_ALL
} from './map-constants'
import { getHaversineDistanceMeters } from './map-geometry-utils'

export interface RoomLocationInfo {
	room: string
	building: string
	floor: string
	campus?: 'IN' | 'ND'
	center?: MapCoordinate
}

export interface RoomSuggestionAnchor {
	room?: string
	coordinate?: MapCoordinate
	building?: string
	floor?: string
	campus?: 'IN' | 'ND'
}

export function buildRoomLocationIndex(
	allRooms: FeatureCollection | undefined
): Map<string, RoomLocationInfo> {
	const index = new Map<string, RoomLocationInfo>()
	if (allRooms == null) {
		return index
	}

	for (const feature of allRooms.features) {
		const properties = feature.properties
		if (properties == null) {
			continue
		}
		if (properties.rtype != null && properties.rtype !== SEARCH_TYPES.ROOM) {
			continue
		}
		const room =
			typeof properties.Raum === 'string' ? properties.Raum : undefined
		const building =
			typeof properties.Gebaeude === 'string' ? properties.Gebaeude : undefined
		if (room == null || building == null) {
			continue
		}
		const floor =
			typeof properties.Ebene === 'string' && properties.Ebene.length > 0
				? properties.Ebene
				: 'EG'
		const center = properties.center
		index.set(room, {
			room,
			building,
			floor,
			campus: normalizeCampusKey(properties.Standort),
			center:
				Array.isArray(center) &&
				typeof center[0] === 'number' &&
				typeof center[1] === 'number'
					? [center[0], center[1]]
					: undefined
		})
	}

	return index
}

export function findNearestRoomLocation(
	coordinate: MapCoordinate,
	roomLocations: Map<string, RoomLocationInfo>
): RoomLocationInfo | undefined {
	let nearest: RoomLocationInfo | undefined
	let nearestDistance = Number.POSITIVE_INFINITY

	for (const location of roomLocations.values()) {
		if (location.center == null) {
			continue
		}
		const distance = getHaversineDistanceMeters(coordinate, location.center)
		if (distance < nearestDistance) {
			nearestDistance = distance
			nearest = location
		}
	}

	return nearest
}

/**
 * Resolve a suggestion anchor from the next lecture room first,
 * then fall back to the nearest mapped room for a user GPS coordinate.
 */
export function resolveRoomSuggestionAnchor(options: {
	preferredRoom?: string | null
	userCoordinate?: MapCoordinate
	roomLocations: Map<string, RoomLocationInfo>
}): RoomSuggestionAnchor | undefined {
	const preferredRoom = options.preferredRoom?.trim()
	if (preferredRoom != null && preferredRoom.length > 0) {
		const location = options.roomLocations.get(preferredRoom)
		if (location != null) {
			return {
				room: location.room,
				coordinate: location.center,
				building: location.building,
				floor: location.floor,
				campus: location.campus
			}
		}
		return { room: preferredRoom }
	}

	if (options.userCoordinate == null) {
		return undefined
	}

	const nearest = findNearestRoomLocation(
		options.userCoordinate,
		options.roomLocations
	)
	if (nearest == null) {
		return { coordinate: options.userCoordinate }
	}

	return {
		room: nearest.room,
		coordinate: options.userCoordinate,
		building: nearest.building,
		floor: nearest.floor,
		campus: nearest.campus
	}
}

function compareAvailableRoomsByProximity(
	a: AvailableRoom,
	b: AvailableRoom,
	anchor: RoomSuggestionAnchor,
	roomLocations: Map<string, RoomLocationInfo>
): number {
	const aInfo = roomLocations.get(a.room)
	const bInfo = roomLocations.get(b.room)

	if (anchor.campus != null) {
		const aCampusMismatch = aInfo?.campus !== anchor.campus ? 1 : 0
		const bCampusMismatch = bInfo?.campus !== anchor.campus ? 1 : 0
		if (aCampusMismatch !== bCampusMismatch) {
			return aCampusMismatch - bCampusMismatch
		}
	}

	if (anchor.building != null) {
		const aBuildingMismatch = aInfo?.building !== anchor.building ? 1 : 0
		const bBuildingMismatch = bInfo?.building !== anchor.building ? 1 : 0
		if (aBuildingMismatch !== bBuildingMismatch) {
			return aBuildingMismatch - bBuildingMismatch
		}
	}

	if (anchor.floor != null) {
		const aFloorDistance =
			aInfo == null
				? Number.POSITIVE_INFINITY
				: getFloorDistance(anchor.floor, aInfo.floor)
		const bFloorDistance =
			bInfo == null
				? Number.POSITIVE_INFINITY
				: getFloorDistance(anchor.floor, bInfo.floor)
		if (aFloorDistance !== bFloorDistance) {
			return aFloorDistance - bFloorDistance
		}
	}

	if (anchor.coordinate != null) {
		const aDistance =
			aInfo?.center == null
				? Number.POSITIVE_INFINITY
				: getHaversineDistanceMeters(anchor.coordinate, aInfo.center)
		const bDistance =
			bInfo?.center == null
				? Number.POSITIVE_INFINITY
				: getHaversineDistanceMeters(anchor.coordinate, bInfo.center)
		if (aDistance !== bDistance) {
			return aDistance - bDistance
		}
	}

	return a.room.localeCompare(b.room)
}

/** Rank free rooms near an anchor (lecture / selection / GPS). Keeps `Alle` first. */
export function rankAvailableRoomsByProximity(
	rooms: AvailableRoom[],
	anchor: RoomSuggestionAnchor | undefined,
	roomLocations: Map<string, RoomLocationInfo>
): AvailableRoom[] {
	if (rooms.length <= 1 || anchor == null) {
		return rooms
	}

	const allRoomsAvailable = rooms.filter((room) => room.room === ROOMS_ALL)
	const rankedRooms = rooms
		.filter((room) => room.room !== ROOMS_ALL)
		.slice()
		.sort((a, b) =>
			compareAvailableRoomsByProximity(a, b, anchor, roomLocations)
		)

	return [...allRoomsAvailable, ...rankedRooms]
}
