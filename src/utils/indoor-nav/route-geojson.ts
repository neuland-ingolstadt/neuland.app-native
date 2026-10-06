import type { ClickedMapElement } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import { getIndoorBuildingForCode } from './data'
import type { IndoorData, RouteResult } from './types'

/** Staircase shaft polygons on a floor that belong to the active route. */
export function stairShaftsGeoJsonForFloor(
	data: IndoorData,
	result: RouteResult | null,
	floor: string,
	onlyCodes?: Set<string>
): GeoJSON.FeatureCollection {
	if (result == null) {
		return { type: 'FeatureCollection', features: [] }
	}
	const codes = new Set<string>()
	for (const change of result.floorChanges) {
		if (change.fromFloor === floor && change.fromStairCode != null) {
			codes.add(change.fromStairCode)
		}
		if (change.toFloor === floor && change.toStairCode != null) {
			codes.add(change.toStairCode)
		}
	}
	if (onlyCodes != null) {
		if (onlyCodes.size === 0) {
			return { type: 'FeatureCollection', features: [] }
		}
		for (const code of codes) {
			if (!onlyCodes.has(code)) {
				codes.delete(code)
			}
		}
	}
	if (codes.size === 0) {
		return { type: 'FeatureCollection', features: [] }
	}
	return {
		type: 'FeatureCollection',
		features: (data.roomsByFloor[floor] ?? []).filter((room) =>
			codes.has(room.properties.Raum)
		)
	}
}

/** Index of the route leg to show when a floor appears more than once (e.g. EG → 1 → EG). */
export function pickLegForFloor(
	result: RouteResult,
	floor: string,
	preferFromLeg = 0
): number {
	const legs = result.segments
		.map((s, i) => (s.floor === floor ? i : -1))
		.filter((i) => i >= 0)
	if (legs.length === 0) {
		return 0
	}
	if (legs.length === 1) {
		return legs[0]
	}
	return legs.find((i) => i >= preferFromLeg) ?? legs[legs.length - 1]
}

/** Destination room polygon while navigating on the destination floor. */
export function destinationRoomGeoJsonForFloor(
	data: IndoorData,
	floor: string,
	roomCode: string,
	highlight: boolean
): GeoJSON.FeatureCollection {
	if (!highlight) {
		return { type: 'FeatureCollection', features: [] }
	}
	const room = (data.roomsByFloor[floor] ?? []).find(
		(r) => r.properties.Raum === roomCode
	)
	if (room == null) {
		return { type: 'FeatureCollection', features: [] }
	}
	return { type: 'FeatureCollection', features: [room] }
}

export function entrancesGeoJsonForFloor(
	data: IndoorData,
	floor: string
): GeoJSON.FeatureCollection {
	if (floor !== 'EG') {
		return { type: 'FeatureCollection', features: [] }
	}
	return {
		type: 'FeatureCollection',
		features: data.entrances
	}
}

/**
 * Entrances for the currently selected building on the ground floor.
 * Outside navigation the map only marks the selected room's building —
 * nothing when there is no selection — so other buildings stay uncluttered.
 */
export function entrancesGeoJsonForSelection(
	data: IndoorData,
	floor: string,
	clicked: ClickedMapElement | null
): GeoJSON.FeatureCollection {
	if (floor !== 'EG' || clicked == null) {
		return { type: 'FeatureCollection', features: [] }
	}
	let standort: string | null = null
	let gebaeude: string | null = null
	if (clicked.type === SEARCH_TYPES.BUILDING) {
		gebaeude = clicked.data
	} else if (clicked.type === SEARCH_TYPES.ROOM) {
		const building = getIndoorBuildingForCode(clicked.data)
		standort = building?.standort ?? null
		gebaeude = building?.gebaeude ?? null
	}
	if (gebaeude == null) {
		return { type: 'FeatureCollection', features: [] }
	}
	return {
		type: 'FeatureCollection',
		features: data.entrances.filter(
			(feature) =>
				feature.geometry?.type === 'Point' &&
				feature.properties?.Gebaeude === gebaeude &&
				(standort == null || feature.properties?.Standort === standort)
		)
	}
}
