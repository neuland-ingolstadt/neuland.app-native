import { FLOORS } from './floors'
import { distM, type PolygonGeom, polygonCentroid } from './geometry'
import { isStair } from './graph-room-utils'
import type { JourneyStep } from './journey-copy'
import type { IndoorData, LonLat } from './types'

/** Vertical stack spacing between floors in the ghost cutaway (meters). */
export const GHOST_FLOOR_STACK_M = 5.5
const GHOST_PLATE_M = 0.55
/** Nearly spans to the next plate so the shaft reads continuous. */
const GHOST_STAIR_H_M = 5.2
/** Include nearby rooms / shafts within this radius of the hop. */
const GHOST_NEAR_M = 22

/** Active staircase hop — triggers pitched multi-floor cutaway on the map. */
export interface StairMoment {
	fromFloor: string
	toFloor: string
	fromStairCode?: string
	toStairCode?: string
	at: LonLat
}

function floorsBetween(fromFloor: string, toFloor: string): string[] {
	const a = FLOORS.indexOf(fromFloor as (typeof FLOORS)[number])
	const b = FLOORS.indexOf(toFloor as (typeof FLOORS)[number])
	if (a < 0 || b < 0) {
		return [fromFloor, toFloor]
	}
	const lo = Math.min(a, b)
	const hi = Math.max(a, b)
	return FLOORS.slice(lo, hi + 1)
}

function roomCentroid(room: GeoJSON.Feature): LonLat | null {
	const geom = room.geometry
	if (geom?.type !== 'Polygon' && geom?.type !== 'MultiPolygon') {
		return null
	}
	try {
		return polygonCentroid(geom as PolygonGeom)
	} catch {
		return null
	}
}
function nearHop(
	room: GeoJSON.Feature,
	hop: LonLat,
	isRouteStair: boolean
): boolean {
	if (isRouteStair) {
		return true
	}
	const c = roomCentroid(room)
	if (c == null) {
		return false
	}
	return distM(c, hop) <= GHOST_NEAR_M
}

export function stairMomentFromStep(
	step: JourneyStep | undefined
): StairMoment | null {
	if (step?.kind !== 'stairs') {
		return null
	}
	const ch = step.change
	if (ch == null) {
		return null
	}
	return {
		fromFloor: ch.fromFloor,
		toFloor: ch.toFloor,
		fromStairCode: ch.fromStairCode,
		toStairCode: ch.toStairCode,
		at: ch.at
	}
}

/** Soft stacked cutaway near the active stair hop (other floors + shaft). */
export function ghostFloorsGeoJson(
	data: IndoorData,
	moment: StairMoment | null | undefined,
	viewFloor: string
): GeoJSON.FeatureCollection {
	if (moment == null) {
		return { type: 'FeatureCollection', features: [] }
	}
	const hop = moment.at
	const range = floorsBetween(moment.fromFloor, moment.toFloor)
	const fromIdx = FLOORS.indexOf(moment.fromFloor as (typeof FLOORS)[number])
	const toIdx = FLOORS.indexOf(moment.toFloor as (typeof FLOORS)[number])
	const climbing = toIdx >= fromIdx
	const ordered = (climbing ? range : [...range].reverse()).filter(
		(fl) => fl !== viewFloor
	)
	const features: GeoJSON.Feature[] = []

	const pushRoom = (room: GeoJSON.Feature, base: number, stair: boolean) => {
		features.push({
			type: 'Feature',
			properties: {
				...room.properties,
				ghostBase: base,
				ghostHeight: base + (stair ? GHOST_STAIR_H_M : GHOST_PLATE_M),
				ghostKind: stair ? 'stair' : 'room'
			},
			geometry: room.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
		})
	}

	for (const room of data.roomsByFloor[viewFloor] ?? []) {
		const fn = String(room.properties.Funktion_de ?? '')
		if (!isStair(fn)) {
			continue
		}
		const code = String(room.properties.Raum ?? '')
		const isRouteStair =
			code === moment.fromStairCode || code === moment.toStairCode
		if (!nearHop(room as GeoJSON.Feature, hop, isRouteStair)) {
			continue
		}
		pushRoom(room as GeoJSON.Feature, 0, true)
	}

	ordered.forEach((fl, stackIdx) => {
		const base = (stackIdx + 1) * GHOST_FLOOR_STACK_M

		for (const room of data.roomsByFloor[fl] ?? []) {
			const fn = String(room.properties.Funktion_de ?? '')
			const code = String(room.properties.Raum ?? '')
			const stair = isStair(fn)
			const isRouteStair =
				code === moment.fromStairCode || code === moment.toStairCode
			if (!nearHop(room as GeoJSON.Feature, hop, isRouteStair)) {
				continue
			}
			if (fn === 'Luftraum') {
				continue
			}
			if (!stair) {
				const c = roomCentroid(room as GeoJSON.Feature)
				if (c != null && distM(c, hop) < 4) {
					continue
				}
			}
			pushRoom(room as GeoJSON.Feature, base, stair)
		}
	})
	return { type: 'FeatureCollection', features }
}
