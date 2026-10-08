import { campusRouteCacheKey, getCachedCampusRoute } from './campus-route-cache'
import {
	buildCorridorNet,
	corridorFeaturesFromFC,
	routeOnCorridor
} from './corridor'
import {
	getIndoorBuildingForCode,
	INDOOR_BUILDINGS,
	type IndoorBuilding
} from './data'
import { walkDurationSec } from './format'
import { polylineLengthPlanarM } from './geometry'
import { entranceNodeId } from './ids'
import { finalizeRouteResult } from './route-result'
import { route } from './routing'
import type {
	EntranceFeature,
	IndoorData,
	IndoorGraph,
	LonLat,
	RouteResult
} from './types'

/** Synthetic floor id for outdoor walk legs (map + journey). */
export const OUTDOOR_FLOOR = 'OUT'

export const FOOTPATHS_URL =
	'https://assets.neuland.app/footpaths_neuland.geojson'

export type OutdoorRouter = {
	route(
		a: LonLat,
		b: LonLat
	): {
		coords: LonLat[]
		distanceM: number
		durationSec: number
	} | null
}

function lineLen(coords: LonLat[]) {
	return polylineLengthPlanarM(coords)
}

export function buildOutdoorRouter(
	fc: GeoJSON.FeatureCollection
): OutdoorRouter | null {
	const features = corridorFeaturesFromFC(fc)
	const net = buildCorridorNet(OUTDOOR_FLOOR, features)
	if (!net) {
		return null
	}
	return {
		route(a, b) {
			const path = routeOnCorridor(a, b, net, [], {
				directStubFrom: true,
				directStubTo: true
			})
			if (!path || path.length < 2) {
				return null
			}
			const distanceM = lineLen(path)
			return {
				coords: path,
				distanceM,
				durationSec: walkDurationSec(distanceM)
			}
		}
	}
}

function parseBuildingId(value: string): IndoorBuilding | null {
	const letter = value.toUpperCase()
	if ((INDOOR_BUILDINGS as readonly string[]).includes(letter)) {
		return letter as IndoorBuilding
	}
	return null
}

export function buildingForEndpoint(
	id: string,
	entrances: EntranceFeature[]
): IndoorBuilding | null {
	if (id.startsWith('entrance:')) {
		const eid = id.slice('entrance:'.length)
		const e = entrances.find((x) => x.properties.id === eid)
		if (e?.properties.Gebaeude) {
			return parseBuildingId(e.properties.Gebaeude)
		}
		const m = /^IN-([A-Z])-/.exec(eid)
		if (m?.[1]) {
			return parseBuildingId(m[1])
		}
		return null
	}
	if (id.startsWith('room:')) {
		const code = id.split(':')[2]
		if (code == null || code === '') {
			return null
		}
		const fromData = getIndoorBuildingForCode(code)
		if (fromData != null) {
			return parseBuildingId(fromData)
		}
		const letter = code[0]
		if (letter) {
			return parseBuildingId(letter)
		}
	}
	return null
}

function outdoorLeg(
	fromEntranceId: string,
	toEntranceId: string,
	outdoor: OutdoorRouter,
	fromCoord: LonLat,
	toCoord: LonLat
): RouteResult | null {
	const path = outdoor.route(fromCoord, toCoord)
	if (!path) {
		return null
	}
	return finalizeRouteResult({
		nodeIds: [fromEntranceId, toEntranceId],
		coords: path.coords,
		floors: [OUTDOOR_FLOOR],
		distanceM: path.distanceM,
		durationSec: path.durationSec,
		hops: [
			{ from: fromEntranceId, to: toEntranceId, kind: 'outdoor' as const }
		],
		segments: [
			{
				floor: OUTDOOR_FLOOR,
				coords: path.coords,
				distanceM: path.distanceM,
				durationSec: path.durationSec,
				startNodeId: fromEntranceId,
				endNodeId: toEntranceId
			}
		],
		floorChanges: []
	})
}

function concatRouteResults(parts: RouteResult[]): RouteResult {
	const segments: RouteResult['segments'] = []
	const floorChanges: RouteResult['floorChanges'] = []
	const nodeIds: string[] = []
	const hops: RouteResult['hops'] = []

	for (const p of parts) {
		nodeIds.push(...p.nodeIds)
		hops.push(...p.hops)
		for (let i = 0; i < p.segments.length; i++) {
			const seg = p.segments[i]
			if (!seg) {
				continue
			}
			segments.push(seg)
			floorChanges.push(p.floorChanges[i])
		}
	}

	const coords = segments.flatMap((s) => s.coords)
	const walkM = segments.reduce((a, s) => a + s.distanceM, 0)
	const stairM = floorChanges.reduce((a, c) => a + (c?.distanceM ?? 0), 0)
	const walkSec = segments.reduce((a, s) => a + s.durationSec, 0)
	const stairSec = floorChanges.reduce((a, c) => a + (c?.durationSec ?? 0), 0)
	return finalizeRouteResult({
		nodeIds,
		coords,
		floors: [...new Set(segments.map((s) => s.floor))],
		distanceM: walkM + stairM,
		durationSec: walkSec + stairSec,
		hops,
		segments,
		floorChanges
	})
}

/**
 * Route between any two supported endpoints (rooms or entrances) on campus.
 * Same-building legs use the indoor graph; cross-building legs pick the best
 * entrance pair and walk the published footpath network outdoors.
 */
export function routeCampus(
	graph: IndoorGraph,
	outdoor: OutdoorRouter | null,
	data: IndoorData,
	fromId: string,
	toId: string
): RouteResult | null {
	const entrances = data.entrances
	const bFrom = buildingForEndpoint(fromId, entrances)
	const bTo = buildingForEndpoint(toId, entrances)
	if (!bFrom || !bTo) {
		return null
	}

	if (bFrom === bTo) {
		return route(graph, fromId, toId)
	}

	if (outdoor == null || typeof outdoor.route !== 'function') {
		return null
	}

	const exitsFrom = entrances.filter(
		(e) =>
			e.properties.Gebaeude === bFrom &&
			graph.nodes.has(entranceNodeId(e.properties.id))
	)
	const exitsTo = entrances.filter(
		(e) =>
			e.properties.Gebaeude === bTo &&
			graph.nodes.has(entranceNodeId(e.properties.id))
	)
	if (exitsFrom.length === 0 || exitsTo.length === 0) {
		return null
	}

	let best: RouteResult | null = null
	let bestCost = Number.POSITIVE_INFINITY

	for (const eFrom of exitsFrom) {
		const eFromId = entranceNodeId(eFrom.properties.id)
		const fromCoord = eFrom.geometry.coordinates as LonLat
		const legIn = route(graph, fromId, eFromId)
		if (!legIn) {
			continue
		}

		for (const eTo of exitsTo) {
			const eToId = entranceNodeId(eTo.properties.id)
			const toCoord = eTo.geometry.coordinates as LonLat
			const legOut = outdoorLeg(eFromId, eToId, outdoor, fromCoord, toCoord)
			const legTo = route(graph, eToId, toId)
			if (!legOut || !legTo) {
				continue
			}

			const merged = concatRouteResults([legIn, legOut, legTo])
			if (merged.distanceM < bestCost) {
				bestCost = merged.distanceM
				best = merged
			}
		}
	}

	return best
}

export function routeCampusPreview(
	graph: IndoorGraph,
	outdoor: OutdoorRouter | null,
	data: IndoorData,
	fromId: string,
	toId: string
): { distanceM: number; durationSec: number } | null {
	const cacheKey = campusRouteCacheKey(fromId, toId, outdoor != null)
	const result = getCachedCampusRoute(cacheKey, () =>
		routeCampus(graph, outdoor, data, fromId, toId)
	)
	if (result == null) {
		return null
	}
	return { distanceM: result.distanceM, durationSec: result.durationSec }
}
