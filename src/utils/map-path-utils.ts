import type { Feature, FeatureCollection, Position } from 'geojson'
import type { EntranceAccess, EntranceKind } from '@/types/asset-api'
import type { MapCoordinate } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import { getFloorLevel } from './map-constants'
import {
	closestPointsBetweenRings,
	getHaversineDistanceMeters,
	isPointInPolygonRing,
	nearestPointOnPolygonRing,
	routeWithinPolygonRing
} from './map-geometry-utils'

export type PathNodeKind =
	| 'room'
	| 'corridor'
	| 'stairs'
	| 'elevator'
	| 'entrance'

export type BuildingPortalDirection = 'enter' | 'exit'

export interface PathNode {
	id: string
	kind: PathNodeKind
	building: string
	floor: string
	center: MapCoordinate
	bbox: [number, number, number, number]
	/**
	 * Outer polygon ring for indoor nodes. Empty for entrance points.
	 * Indoor legs are constrained to these rings so routes follow Flure
	 * instead of cutting straight across courtyards (Innenhof).
	 */
	ring: MapCoordinate[]
	/** Set on real entrance GeoJSON nodes. */
	access?: EntranceAccess
	entranceKind?: EntranceKind
}

export interface CampusPathGraph {
	nodes: Map<string, PathNode>
	edges: Map<string, { to: string; meters: number }[]>
}

export type CampusRouteSurface = 'indoor' | 'outdoor'

export interface CampusPathDisplaySegment {
	coordinates: MapCoordinate[]
	surface: CampusRouteSurface
	/**
	 * Set on indoor segments: each one spans a single building + floor so the
	 * map can follow floor changes instead of painting all floors at once.
	 * Vertical hops (stairs/elevator across floors) sit between segments.
	 */
	building?: string
	floor?: string
}

export interface CampusPathResult {
	coordinates: MapCoordinate[]
	distanceMeters: number
	nodeIds: string[]
	/** Present when the route starts from GPS rather than a mapped room. */
	outdoorOrigin?: MapCoordinate
	/**
	 * Painted polylines. When set, outdoor gaps (no footpath) are omitted
	 * instead of drawing a straight chord through buildings.
	 */
	displaySegments?: CampusPathDisplaySegment[]
}

/** ~3 m padding so nearly-touching polygons still connect. */
const BBOX_PAD_DEGREES = 0.00003
const ORPHAN_ROOM_LINK_METERS = 20
const STAIR_XY_LINK_METERS = 12
const FLOOR_METERS = 5
/** Treat GPS as "inside" a building when this close to a mapped polygon. */
const INSIDE_BUILDING_METERS = 12
/** Link an entrance point to the nearest indoor node within this range. */
const ENTRANCE_LINK_METERS = 30
const ENTRANCE_POINT_BBOX_PAD = 0.00001
const INDOOR_PATH_KINDS: PathNodeKind[] = [
	'room',
	'corridor',
	'stairs',
	'elevator'
]

/** Building/room footprints used to keep outdoor bridges off indoor space. */
export function collectFootpathObstacles(
	allRooms: FeatureCollection | undefined
): Array<[number, number, number, number]> {
	const obstacles: Array<[number, number, number, number]> = []
	if (allRooms == null) {
		return obstacles
	}
	const pad = 0.000015
	for (const feature of allRooms.features) {
		const geometry = feature.geometry
		if (geometry == null || geometry.type !== 'Polygon') {
			continue
		}
		const bbox = polygonBbox(geometry.coordinates)
		if (bbox == null) {
			continue
		}
		obstacles.push([bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad])
	}
	return obstacles
}

function polygonBbox(
	coordinates: Position[][]
): [number, number, number, number] | undefined {
	const ring = coordinates[0]
	if (ring == null || ring.length === 0) {
		return undefined
	}
	let minLon = Number.POSITIVE_INFINITY
	let minLat = Number.POSITIVE_INFINITY
	let maxLon = Number.NEGATIVE_INFINITY
	let maxLat = Number.NEGATIVE_INFINITY
	for (const point of ring) {
		const lon = point[0]
		const lat = point[1]
		if (typeof lon !== 'number' || typeof lat !== 'number') {
			continue
		}
		minLon = Math.min(minLon, lon)
		minLat = Math.min(minLat, lat)
		maxLon = Math.max(maxLon, lon)
		maxLat = Math.max(maxLat, lat)
	}
	if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) {
		return undefined
	}
	return [minLon, minLat, maxLon, maxLat]
}

function polygonCenter(coordinates: Position[][]): MapCoordinate | undefined {
	const bbox = polygonBbox(coordinates)
	if (bbox == null) {
		return undefined
	}
	return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]
}

/** Finite outer-ring coordinates of a room polygon for in-polygon routing. */
function extractOuterRing(coordinates: Position[][]): MapCoordinate[] {
	const ring = coordinates[0]
	if (ring == null) {
		return []
	}
	const clean: MapCoordinate[] = []
	for (const point of ring) {
		const lon = point[0]
		const lat = point[1]
		if (typeof lon !== 'number' || typeof lat !== 'number') {
			continue
		}
		if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
			continue
		}
		const previous = clean.at(-1)
		if (previous != null && previous[0] === lon && previous[1] === lat) {
			continue
		}
		clean.push([lon, lat])
	}
	// Drop the closing duplicate so visibility vertices stay unique.
	if (
		clean.length > 1 &&
		clean[0][0] === clean[clean.length - 1][0] &&
		clean[0][1] === clean[clean.length - 1][1]
	) {
		clean.pop()
	}
	return clean
}

function bboxesTouch(
	a: [number, number, number, number],
	b: [number, number, number, number],
	pad = BBOX_PAD_DEGREES
): boolean {
	return !(
		a[2] + pad < b[0] ||
		b[2] + pad < a[0] ||
		a[3] + pad < b[1] ||
		b[3] + pad < a[1]
	)
}

function classifyPathNodeKind(
	funktionDe: unknown,
	funktionEn: unknown
): PathNodeKind {
	const blob =
		`${String(funktionDe ?? '')} ${String(funktionEn ?? '')}`.toLowerCase()
	if (
		blob.includes('treppenhaus') ||
		blob.includes('staircase') ||
		blob.includes('stair')
	) {
		return 'stairs'
	}
	if (
		blob.includes('fahrstuhl') ||
		blob.includes('elevator') ||
		blob.includes('lift')
	) {
		return 'elevator'
	}
	if (blob.includes('flur') || blob.includes('corridor')) {
		return 'corridor'
	}
	return 'room'
}

function isGroundFloor(floor: string): boolean {
	const level = getFloorLevel(floor)
	return level === 0 || floor === 'EG'
}

function addEdge(
	edges: Map<string, { to: string; meters: number }[]>,
	from: string,
	to: string,
	meters: number
): void {
	const list = edges.get(from)
	if (list == null) {
		edges.set(from, [{ to, meters }])
		return
	}
	if (list.some((edge) => edge.to === to)) {
		return
	}
	list.push({ to, meters })
}

function linkNodes(
	edges: Map<string, { to: string; meters: number }[]>,
	a: PathNode,
	b: PathNode,
	meters: number
): void {
	addEdge(edges, a.id, b.id, meters)
	addEdge(edges, b.id, a.id, meters)
}

function extractPathNode(feature: Feature): PathNode | undefined {
	const properties = feature.properties
	const geometry = feature.geometry
	if (
		properties == null ||
		geometry == null ||
		geometry.type !== 'Polygon' ||
		properties.rtype === SEARCH_TYPES.BUILDING
	) {
		return undefined
	}

	const id = typeof properties.Raum === 'string' ? properties.Raum : undefined
	const building =
		typeof properties.Gebaeude === 'string' ? properties.Gebaeude : undefined
	if (id == null || building == null) {
		return undefined
	}

	const center =
		Array.isArray(properties.center) &&
		typeof properties.center[0] === 'number' &&
		typeof properties.center[1] === 'number'
			? ([properties.center[0], properties.center[1]] as MapCoordinate)
			: polygonCenter(geometry.coordinates)
	const bbox = polygonBbox(geometry.coordinates)
	if (center == null || bbox == null) {
		return undefined
	}

	const floor =
		typeof properties.Ebene === 'string' && properties.Ebene.length > 0
			? properties.Ebene
			: 'EG'

	return {
		id,
		kind: classifyPathNodeKind(properties.Funktion_de, properties.Funktion_en),
		building,
		floor,
		center,
		bbox,
		ring: extractOuterRing(geometry.coordinates)
	}
}

function extractEntranceNode(feature: Feature): PathNode | undefined {
	const properties = feature.properties
	const geometry = feature.geometry
	if (properties == null || geometry == null || geometry.type !== 'Point') {
		return undefined
	}

	const rawId =
		typeof properties.id === 'string' && properties.id.length > 0
			? properties.id
			: undefined
	const building =
		typeof properties.Gebaeude === 'string' ? properties.Gebaeude : undefined
	const [lon, lat] = geometry.coordinates
	if (
		rawId == null ||
		building == null ||
		typeof lon !== 'number' ||
		typeof lat !== 'number'
	) {
		return undefined
	}

	const floor =
		typeof properties.Ebene === 'string' && properties.Ebene.length > 0
			? properties.Ebene
			: 'EG'
	const access =
		properties.access === 'badge' || properties.access === 'public'
			? properties.access
			: 'public'
	const entranceKind =
		properties.kind === 'entrance' ||
		properties.kind === 'exit' ||
		properties.kind === 'both'
			? properties.kind
			: 'both'

	return {
		id: `entrance:${rawId}`,
		kind: 'entrance',
		building,
		floor,
		center: [lon, lat],
		bbox: [
			lon - ENTRANCE_POINT_BBOX_PAD,
			lat - ENTRANCE_POINT_BBOX_PAD,
			lon + ENTRANCE_POINT_BBOX_PAD,
			lat + ENTRANCE_POINT_BBOX_PAD
		],
		ring: [],
		access,
		entranceKind
	}
}

function isCirculationKind(kind: PathNodeKind): boolean {
	return kind === 'corridor' || kind === 'stairs' || kind === 'elevator'
}

/** Rooms connect into Flur/stairs/elevators — never room→room shortcuts. */
function canLinkIndoorKinds(a: PathNodeKind, b: PathNodeKind): boolean {
	if (a === 'room' && b === 'room') {
		return false
	}
	return true
}

/**
 * Walking distance from a point to a node polygon: zero inside, otherwise to
 * the nearest boundary point. Ranks the polygon a door actually opens into
 * above a farther polygon whose center happens to be near.
 */
function distanceToNodePolygon(point: MapCoordinate, node: PathNode): number {
	if (node.ring.length >= 3) {
		if (isPointInPolygonRing(point, node.ring)) {
			return 0
		}
		return getHaversineDistanceMeters(
			point,
			nearestPointOnPolygonRing(point, node.ring)
		)
	}
	return getHaversineDistanceMeters(point, node.center)
}

function linkEntranceToIndoorGraph(
	edges: Map<string, { to: string; meters: number }[]>,
	entrance: PathNode,
	indoorNodes: PathNode[]
): void {
	const linkNearest = (preferCirculation: boolean): boolean => {
		let nearest: PathNode | undefined
		let nearestMeters = Number.POSITIVE_INFINITY
		for (const candidate of indoorNodes) {
			if (candidate.building !== entrance.building) {
				continue
			}
			// Doors are reached via EG only — never shortcut through upper floors.
			if (!isGroundFloor(candidate.floor)) {
				continue
			}
			if (preferCirculation && !isCirculationKind(candidate.kind)) {
				continue
			}
			const meters = distanceToNodePolygon(entrance.center, candidate)
			if (meters < nearestMeters) {
				nearestMeters = meters
				nearest = candidate
			}
		}
		if (nearest == null || nearestMeters > ENTRANCE_LINK_METERS) {
			return false
		}
		linkNodes(edges, entrance, nearest, nearestMeters)
		return true
	}

	if (!linkNearest(true)) {
		linkNearest(false)
	}
}

export function buildCampusPathGraph(
	allRooms: FeatureCollection | undefined,
	entrances?: FeatureCollection | undefined
): CampusPathGraph {
	const nodes = new Map<string, PathNode>()
	const edges = new Map<string, { to: string; meters: number }[]>()

	if (allRooms == null) {
		return { nodes, edges }
	}

	for (const feature of allRooms.features) {
		const node = extractPathNode(feature)
		if (node != null) {
			nodes.set(node.id, node)
		}
	}

	const indoorNodes = Array.from(nodes.values())

	// Same building + floor: connect touching polygons, but never room→room.
	// Indoor routes must leave a room into Flur/stairs/elevator circulation.
	for (let i = 0; i < indoorNodes.length; i++) {
		const a = indoorNodes[i]
		for (let j = i + 1; j < indoorNodes.length; j++) {
			const b = indoorNodes[j]
			if (a.building !== b.building || a.floor !== b.floor) {
				continue
			}
			if (!canLinkIndoorKinds(a.kind, b.kind)) {
				continue
			}
			if (!bboxesTouch(a.bbox, b.bbox)) {
				continue
			}
			linkNodes(edges, a, b, getHaversineDistanceMeters(a.center, b.center))
		}
	}

	// Orphan rooms → nearest corridor/stairs/elevator on same floor.
	for (const room of indoorNodes) {
		if (room.kind !== 'room') {
			continue
		}
		const degree = edges.get(room.id)?.length ?? 0
		if (degree > 0) {
			continue
		}
		let nearest: PathNode | undefined
		let nearestMeters = Number.POSITIVE_INFINITY
		for (const candidate of indoorNodes) {
			if (
				candidate.id === room.id ||
				candidate.building !== room.building ||
				candidate.floor !== room.floor ||
				candidate.kind === 'room'
			) {
				continue
			}
			const meters = distanceToNodePolygon(room.center, candidate)
			if (meters < nearestMeters) {
				nearestMeters = meters
				nearest = candidate
			}
		}
		if (nearest != null && nearestMeters <= ORPHAN_ROOM_LINK_METERS) {
			linkNodes(edges, room, nearest, nearestMeters)
		}
	}

	// Vertical links via stairs/elevators with nearby XY centers.
	const verticals = indoorNodes.filter(
		(node) => node.kind === 'stairs' || node.kind === 'elevator'
	)
	for (let i = 0; i < verticals.length; i++) {
		const a = verticals[i]
		for (let j = i + 1; j < verticals.length; j++) {
			const b = verticals[j]
			if (a.building !== b.building || a.floor === b.floor) {
				continue
			}
			const horizontal = getHaversineDistanceMeters(a.center, b.center)
			if (horizontal > STAIR_XY_LINK_METERS) {
				continue
			}
			const floorDelta = Math.abs(
				getFloorLevel(a.floor) - getFloorLevel(b.floor)
			)
			if (!Number.isFinite(floorDelta) || floorDelta <= 0) {
				continue
			}
			linkNodes(edges, a, b, horizontal + floorDelta * FLOOR_METERS)
		}
	}

	// Real entrance points from the asset API — outdoor footpaths end here.
	if (entrances != null) {
		for (const feature of entrances.features) {
			const entrance = extractEntranceNode(feature)
			if (entrance == null || nodes.has(entrance.id)) {
				continue
			}
			nodes.set(entrance.id, entrance)
			linkEntranceToIndoorGraph(edges, entrance, indoorNodes)
		}
	}

	return { nodes, edges }
}

function dijkstra(
	graph: CampusPathGraph,
	startId: string,
	endId: string
): CampusPathResult | undefined {
	if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
		return undefined
	}
	if (startId === endId) {
		const node = graph.nodes.get(startId)
		if (node == null) {
			return undefined
		}
		return {
			coordinates: [node.center],
			distanceMeters: 0,
			nodeIds: [startId]
		}
	}

	const dist = new Map<string, number>()
	const prev = new Map<string, string>()
	const visited = new Set<string>()
	dist.set(startId, 0)

	while (visited.size < graph.nodes.size) {
		let current: string | undefined
		let currentDist = Number.POSITIVE_INFINITY
		for (const [id, value] of dist) {
			if (!visited.has(id) && value < currentDist) {
				current = id
				currentDist = value
			}
		}
		if (current == null || currentDist === Number.POSITIVE_INFINITY) {
			break
		}
		if (current === endId) {
			break
		}
		visited.add(current)

		for (const edge of graph.edges.get(current) ?? []) {
			if (visited.has(edge.to)) {
				continue
			}
			// Indoor routes run on Flure/stairs — never cut through seminar
			// rooms as a shortcut. Rooms stay usable as route endpoints.
			if (edge.to !== endId) {
				if (graph.nodes.get(edge.to)?.kind === 'room') {
					continue
				}
			}
			const next = currentDist + edge.meters
			if (next < (dist.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
				dist.set(edge.to, next)
				prev.set(edge.to, current)
			}
		}
	}

	if (!prev.has(endId) && startId !== endId) {
		return undefined
	}

	const nodeIds: string[] = []
	let cursor: string | undefined = endId
	while (cursor != null) {
		nodeIds.push(cursor)
		cursor = prev.get(cursor)
	}
	nodeIds.reverse()
	if (nodeIds[0] !== startId) {
		return undefined
	}

	return {
		coordinates: buildIndoorDoorCoordinates(graph, nodeIds),
		distanceMeters: dist.get(endId) ?? 0,
		nodeIds
	}
}

export function findNearestPathNodeId(
	coordinate: MapCoordinate,
	graph: CampusPathGraph,
	kinds?: PathNodeKind[],
	building?: string
): string | undefined {
	let nearestId: string | undefined
	let nearestMeters = Number.POSITIVE_INFINITY
	for (const node of graph.nodes.values()) {
		if (kinds != null && !kinds.includes(node.kind)) {
			continue
		}
		if (building != null && node.building !== building) {
			continue
		}
		const meters = getHaversineDistanceMeters(coordinate, node.center)
		if (meters < nearestMeters) {
			nearestMeters = meters
			nearestId = node.id
		}
	}
	return nearestId
}

function pointInBbox(
	coordinate: MapCoordinate,
	bbox: [number, number, number, number]
): boolean {
	const [lon, lat] = coordinate
	return lon >= bbox[0] && lon <= bbox[2] && lat >= bbox[1] && lat <= bbox[3]
}

/** Building containing the coordinate, or nearby enough to count as indoors. */
export function findBuildingAtCoordinate(
	coordinate: MapCoordinate,
	graph: CampusPathGraph
): string | undefined {
	for (const node of graph.nodes.values()) {
		if (node.kind === 'entrance') {
			continue
		}
		if (pointInBbox(coordinate, node.bbox)) {
			return node.building
		}
	}

	const nearestId = findNearestPathNodeId(coordinate, graph, INDOOR_PATH_KINDS)
	if (nearestId == null) {
		return undefined
	}
	const nearest = graph.nodes.get(nearestId)
	if (nearest == null) {
		return undefined
	}
	const meters = getHaversineDistanceMeters(coordinate, nearest.center)
	return meters <= INSIDE_BUILDING_METERS ? nearest.building : undefined
}

function isLegacyPortalNode(node: PathNode): boolean {
	return (
		isGroundFloor(node.floor) &&
		(node.kind === 'corridor' ||
			node.kind === 'stairs' ||
			node.kind === 'elevator')
	)
}

/** Soft ranking penalty so public enter/exit doors win over badge-only / wrong-kind. */
function entranceDirectionPenalty(
	node: PathNode,
	direction: BuildingPortalDirection
): number {
	let penalty = 0
	if (node.access === 'badge') {
		penalty += 200
	}
	if (direction === 'enter' && node.entranceKind === 'exit') {
		penalty += 150
	}
	if (direction === 'exit' && node.entranceKind === 'entrance') {
		penalty += 150
	}
	return penalty
}

/**
 * Prefer a real entrance GeoJSON point facing the approach.
 * Falls back to ground-floor Flur/stairs when entrances are missing.
 * Portals are always on the ground floor — leaving through an upper floor
 * would cut through walls instead of using the stairs.
 */
export function findBuildingPortal(
	graph: CampusPathGraph,
	building: string,
	near: MapCoordinate,
	direction: BuildingPortalDirection = 'enter'
): PathNode | undefined {
	let bestEntrance: PathNode | undefined
	let bestEntranceScore = Number.POSITIVE_INFINITY
	for (const node of graph.nodes.values()) {
		if (node.building !== building || node.kind !== 'entrance') {
			continue
		}
		const score =
			getHaversineDistanceMeters(near, node.center) +
			entranceDirectionPenalty(node, direction)
		if (score < bestEntranceScore) {
			bestEntranceScore = score
			bestEntrance = node
		}
	}
	if (bestEntrance != null) {
		return bestEntrance
	}

	let bestLegacy: PathNode | undefined
	let bestLegacyMeters = Number.POSITIVE_INFINITY
	for (const node of graph.nodes.values()) {
		if (node.building !== building || !isLegacyPortalNode(node)) {
			continue
		}
		const meters = getHaversineDistanceMeters(near, node.center)
		if (meters < bestLegacyMeters) {
			bestLegacyMeters = meters
			bestLegacy = node
		}
	}
	if (bestLegacy != null) {
		return bestLegacy
	}

	// Last resort: nearest ground-floor node so the exit still runs down the
	// stairs instead of leaving through an upper floor. Circulation wins ties
	// via a small penalty so rooms are not used as doors.
	let fallback: PathNode | undefined
	let fallbackScore = Number.POSITIVE_INFINITY
	for (const node of graph.nodes.values()) {
		if (
			node.building !== building ||
			node.kind === 'entrance' ||
			!isGroundFloor(node.floor)
		) {
			continue
		}
		const score =
			getHaversineDistanceMeters(near, node.center) +
			(isCirculationKind(node.kind) ? 0 : 50)
		if (score < fallbackScore) {
			fallbackScore = score
			fallback = node
		}
	}
	return fallback
}

/**
 * Approximate door/portal between two indoor polygons: midpoint of the
 * closest pair of boundary points. Touching polygons meet on their shared
 * edge; bbox overlaps instead can sit in a courtyard, so boundaries win.
 * Corridor centers are never used (those cut walls).
 */
export function doorPointBetween(a: PathNode, b: PathNode): MapCoordinate {
	if (a.kind === 'entrance') {
		return a.center
	}
	if (b.kind === 'entrance') {
		return b.center
	}

	if (a.ring.length >= 3 && b.ring.length >= 3) {
		const [pointA, pointB] = closestPointsBetweenRings(a.ring, b.ring)
		return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2]
	}

	const pad = BBOX_PAD_DEGREES
	const minLon = Math.max(a.bbox[0] - pad, b.bbox[0] - pad)
	const minLat = Math.max(a.bbox[1] - pad, b.bbox[1] - pad)
	const maxLon = Math.min(a.bbox[2] + pad, b.bbox[2] + pad)
	const maxLat = Math.min(a.bbox[3] + pad, b.bbox[3] + pad)

	if (minLon <= maxLon && minLat <= maxLat) {
		return [(minLon + maxLon) / 2, (minLat + maxLat) / 2]
	}

	return [(a.center[0] + b.center[0]) / 2, (a.center[1] + b.center[1]) / 2]
}

function isIndoorAnchorKind(kind: PathNodeKind): boolean {
	return (
		kind === 'room' ||
		kind === 'entrance' ||
		kind === 'stairs' ||
		kind === 'elevator'
	)
}

/**
 * One indoor leg, routed inside its polygon ring.
 * Exterior endpoints (data-gap chords) cross to the nearest boundary point
 * first; the rest stays on walkable ground instead of cutting courtyards.
 */
function appendConstrainedLeg(
	target: MapCoordinate[],
	ring: MapCoordinate[],
	from: MapCoordinate,
	to: MapCoordinate
): void {
	const append = (coordinate: MapCoordinate): void => {
		const previous = target.at(-1)
		if (
			previous != null &&
			previous[0] === coordinate[0] &&
			previous[1] === coordinate[1]
		) {
			return
		}
		target.push(coordinate)
	}
	if (from[0] === to[0] && from[1] === to[1]) {
		return
	}
	if (ring.length < 3) {
		append(to)
		return
	}
	const startInside = isPointInPolygonRing(from, ring)
	const start = startInside ? from : nearestPointOnPolygonRing(from, ring)
	if (!startInside) {
		append(start)
	}
	const endInside = isPointInPolygonRing(to, ring)
	const end = endInside ? to : nearestPointOnPolygonRing(to, ring)
	for (const point of routeWithinPolygonRing(ring, start, end).slice(1)) {
		append(point)
	}
	if (!endInside) {
		append(to)
	}
}

/**
 * Indoor polyline aimed at doors/portals, routed inside room polygons.
 * Rooms, stairs and entrances contribute their centers; corridors contribute
 * boundary points only — every leg stays on walkable ground instead of
 * cutting straight across the Innenhof or through neighboring rooms.
 */
export function buildIndoorDoorCoordinates(
	graph: CampusPathGraph,
	nodeIds: string[],
	startCoordinate?: MapCoordinate
): MapCoordinate[] {
	const nodes = nodeIds
		.map((id) => graph.nodes.get(id))
		.filter((node): node is PathNode => node != null)
	if (nodes.length === 0) {
		return startCoordinate != null ? [startCoordinate] : []
	}

	const first = nodes[0]
	const coordinates: MapCoordinate[] = []
	// Corridor-first paths start at the corridor center (inside its polygon);
	// room/stair/entrance starts begin at their centers as well.
	const start: MapCoordinate = startCoordinate ?? first.center
	coordinates.push(start)

	for (let index = 0; index < nodes.length; index++) {
		const node = nodes[index]
		const entry = index === 0 ? start : doorPointBetween(nodes[index - 1], node)
		const exit =
			index === nodes.length - 1
				? isIndoorAnchorKind(node.kind)
					? node.center
					: entry
				: doorPointBetween(node, nodes[index + 1])
		if (isIndoorAnchorKind(node.kind)) {
			appendConstrainedLeg(coordinates, node.ring, entry, node.center)
			appendConstrainedLeg(coordinates, node.ring, node.center, exit)
		} else {
			appendConstrainedLeg(coordinates, node.ring, entry, exit)
		}
	}

	if (coordinates.length === 0) {
		coordinates.push(nodes[0].center)
	}

	return coordinates
}

function pathFromNodeIds(
	graph: CampusPathGraph,
	nodeIds: string[],
	distanceMeters: number,
	outdoorOrigin?: MapCoordinate
): CampusPathResult | undefined {
	if (nodeIds.length === 0) {
		return undefined
	}
	const indoorCoordinates = buildIndoorDoorCoordinates(graph, nodeIds)
	if (indoorCoordinates.length === 0) {
		return undefined
	}
	const coordinates =
		outdoorOrigin == null
			? indoorCoordinates
			: [outdoorOrigin, ...indoorCoordinates]
	const outdoorMeters =
		outdoorOrigin == null
			? 0
			: getHaversineDistanceMeters(outdoorOrigin, indoorCoordinates[0])
	return {
		coordinates,
		distanceMeters: distanceMeters + outdoorMeters,
		nodeIds,
		outdoorOrigin
	}
}

function joinIndoorPaths(
	graph: CampusPathGraph,
	parts: CampusPathResult[]
): CampusPathResult | undefined {
	const nodeIds: string[] = []
	let distanceMeters = 0
	for (const part of parts) {
		distanceMeters += part.distanceMeters
		for (const id of part.nodeIds) {
			if (nodeIds.at(-1) === id) {
				continue
			}
			nodeIds.push(id)
		}
	}
	return pathFromNodeIds(graph, nodeIds, distanceMeters)
}

function indoorPathBetweenRooms(
	graph: CampusPathGraph,
	fromRoom: string,
	toRoom: string
): CampusPathResult | undefined {
	const from = graph.nodes.get(fromRoom)
	const to = graph.nodes.get(toRoom)
	if (from == null || to == null || from.building !== to.building) {
		return undefined
	}
	return dijkstra(graph, fromRoom, toRoom)
}

/**
 * Footpaths outdoors (on-device via materialize), Flur only inside buildings.
 * GPS outside → footpath to destination entrance → indoor Flur to room.
 */
export function findCampusPath(options: {
	graph: CampusPathGraph
	fromRoom?: string | null
	fromCoordinate?: MapCoordinate
	toRoom: string
}): CampusPathResult | undefined {
	const { graph, toRoom } = options
	const destination = graph.nodes.get(toRoom)
	if (destination == null) {
		return undefined
	}

	const fromRoom = options.fromRoom?.trim()
	const hasFromRoom =
		fromRoom != null && fromRoom.length > 0 && graph.nodes.has(fromRoom)

	// Same-building indoor room → room
	if (hasFromRoom && fromRoom != null) {
		const start = graph.nodes.get(fromRoom)
		if (start != null && start.building === destination.building) {
			return indoorPathBetweenRooms(graph, fromRoom, toRoom)
		}
		if (start != null) {
			const exitPortal = findBuildingPortal(
				graph,
				start.building,
				destination.center,
				'exit'
			)
			const enterPortal = findBuildingPortal(
				graph,
				destination.building,
				exitPortal?.center ?? start.center,
				'enter'
			)
			if (exitPortal == null || enterPortal == null) {
				return undefined
			}
			const toExit = indoorPathBetweenRooms(graph, fromRoom, exitPortal.id)
			const fromEntrance = indoorPathBetweenRooms(graph, enterPortal.id, toRoom)
			if (toExit == null || fromEntrance == null) {
				return undefined
			}
			return joinIndoorPaths(graph, [toExit, fromEntrance])
		}
	}

	if (options.fromCoordinate == null) {
		return undefined
	}

	const gps = options.fromCoordinate
	const buildingHere = findBuildingAtCoordinate(gps, graph)

	// GPS inside destination building → indoor Flur only
	if (buildingHere === destination.building) {
		const startId = findNearestPathNodeId(
			gps,
			graph,
			INDOOR_PATH_KINDS,
			destination.building
		)
		if (startId == null) {
			return undefined
		}
		return dijkstra(graph, startId, toRoom)
	}

	// GPS inside another building → Flur to exit, footpath to entrance, Flur to room
	if (buildingHere != null) {
		const startId = findNearestPathNodeId(
			gps,
			graph,
			INDOOR_PATH_KINDS,
			buildingHere
		)
		const exitPortal = findBuildingPortal(
			graph,
			buildingHere,
			destination.center,
			'exit'
		)
		const enterPortal = findBuildingPortal(
			graph,
			destination.building,
			exitPortal?.center ?? gps,
			'enter'
		)
		if (startId == null || exitPortal == null || enterPortal == null) {
			return undefined
		}
		const toExit = dijkstra(graph, startId, exitPortal.id)
		const fromEntrance = indoorPathBetweenRooms(graph, enterPortal.id, toRoom)
		if (toExit == null || fromEntrance == null) {
			return undefined
		}
		return joinIndoorPaths(graph, [toExit, fromEntrance])
	}

	// GPS outdoors → footpaths to destination entrance, then indoor Flur only
	const enterPortal = findBuildingPortal(
		graph,
		destination.building,
		gps,
		'enter'
	)
	if (enterPortal == null) {
		return undefined
	}
	const fromEntrance = indoorPathBetweenRooms(graph, enterPortal.id, toRoom)
	if (fromEntrance == null) {
		return pathFromNodeIds(graph, [enterPortal.id], 0, gps)
	}
	return pathFromNodeIds(
		graph,
		fromEntrance.nodeIds,
		fromEntrance.distanceMeters,
		gps
	)
}

/**
 * Maximal runs of consecutive nodes on one building + floor.
 * Runs follow the room → floor → exit/stairs phase order; vertical hops
 * (stairs/elevator across floors) and outdoor hops (building changes) sit
 * between runs, so every painted segment stays on a single floor and the map
 * can follow floor changes instead of drawing all floors at once.
 */
function sliceIndoorRuns(
	graph: CampusPathGraph,
	nodeIds: string[]
): string[][] {
	const runs: string[][] = []
	let index = 0
	while (index < nodeIds.length) {
		const startNode = graph.nodes.get(nodeIds[index])
		if (startNode == null) {
			index += 1
			continue
		}

		let end = index + 1
		while (end < nodeIds.length) {
			const previous = graph.nodes.get(nodeIds[end - 1])
			const next = graph.nodes.get(nodeIds[end])
			if (
				previous == null ||
				next == null ||
				previous.building !== next.building ||
				previous.floor !== next.floor
			) {
				break
			}
			end += 1
		}
		runs.push(nodeIds.slice(index, end))
		index = Math.max(end, index + 1)
	}
	return runs
}

function sumPolylineMeters(coordinates: MapCoordinate[]): number {
	let meters = 0
	for (let index = 0; index < coordinates.length - 1; index++) {
		meters += getHaversineDistanceMeters(
			coordinates[index],
			coordinates[index + 1]
		)
	}
	return meters
}

/**
 * Replace straight outdoor jumps with on-device footpath geometry.
 * Indoor hops aim at doors/portals (not corridor centers). Outdoor hops without
 * a footpath are left as a gap (never a chord through buildings).
 */
export async function materializeCampusPathGeometry(
	path: CampusPathResult,
	graph: CampusPathGraph,
	fetchFootRoute: (
		from: MapCoordinate,
		to: MapCoordinate
	) => Promise<
		| {
				coordinates: MapCoordinate[]
				distanceMeters: number
				segments?: Array<{
					coordinates: MapCoordinate[]
					surface: CampusRouteSurface
				}>
		  }
		| undefined
	> = async () => undefined
): Promise<CampusPathResult> {
	const segments: CampusPathDisplaySegment[] = []
	let distanceMeters = 0
	const nodeIds = path.nodeIds

	const pushOutdoor = async (
		from: MapCoordinate,
		to: MapCoordinate
	): Promise<void> => {
		const foot = await fetchFootRoute(from, to)
		if (foot == null || foot.coordinates.length < 2) {
			return
		}
		const painted =
			foot.segments != null && foot.segments.length > 0
				? foot.segments
				: [{ coordinates: foot.coordinates, surface: 'outdoor' as const }]
		for (const part of painted) {
			if (part.coordinates.length < 2) {
				continue
			}
			segments.push({
				coordinates: part.coordinates,
				surface: part.surface === 'indoor' ? 'indoor' : 'outdoor'
			})
		}
		distanceMeters += foot.distanceMeters
	}

	const pushIndoor = (indoorIds: string[], anchor: PathNode): void => {
		const coordinates = buildIndoorDoorCoordinates(graph, indoorIds)
		if (coordinates.length < 2) {
			return
		}
		segments.push({
			coordinates,
			surface: 'indoor',
			building: anchor.building,
			floor: anchor.floor
		})
		distanceMeters += sumPolylineMeters(coordinates)
	}

	if (nodeIds.length === 0) {
		return path
	}

	if (path.outdoorOrigin != null) {
		const first = graph.nodes.get(nodeIds[0])
		if (first != null) {
			await pushOutdoor(path.outdoorOrigin, first.center)
		}
	}

	const runs = sliceIndoorRuns(graph, nodeIds)
	for (let runIndex = 0; runIndex < runs.length; runIndex++) {
		const run = runs[runIndex]
		const anchor = graph.nodes.get(run[0])
		if (anchor == null) {
			continue
		}
		pushIndoor(run, anchor)

		// Outdoor hop between buildings; vertical hops (same building, other
		// floor) stay implicit between the single-floor runs.
		const nextRun = runs[runIndex + 1]
		const fromNode = graph.nodes.get(run[run.length - 1])
		const toNode = nextRun == null ? undefined : graph.nodes.get(nextRun[0])
		if (
			fromNode != null &&
			toNode != null &&
			fromNode.building !== toNode.building
		) {
			await pushOutdoor(fromNode.center, toNode.center)
		}
	}

	const coordinates = segments.flatMap((segment, segmentIndex) =>
		segmentIndex === 0 ? segment.coordinates : segment.coordinates.slice(1)
	)

	return {
		...path,
		coordinates: coordinates.length >= 2 ? coordinates : path.coordinates,
		displaySegments: segments,
		distanceMeters
	}
}

/** Split skeleton coordinates at outdoor building hops so we never paint chords. */
export function campusPathDisplaySegments(
	path: CampusPathResult,
	graph: CampusPathGraph
): CampusPathDisplaySegment[] {
	if (path.displaySegments != null) {
		return path.displaySegments.filter(
			(segment) => segment.coordinates.length >= 2
		)
	}

	const segments: CampusPathDisplaySegment[] = []
	for (const run of sliceIndoorRuns(graph, path.nodeIds)) {
		const anchor = graph.nodes.get(run[0])
		if (anchor == null) {
			continue
		}
		const coordinates = buildIndoorDoorCoordinates(graph, run)
		if (coordinates.length >= 2) {
			segments.push({
				coordinates,
				surface: 'indoor',
				building: anchor.building,
				floor: anchor.floor
			})
		}
	}

	return segments
}

export function campusPathToFeatureCollection(
	path: CampusPathResult | undefined,
	graph?: CampusPathGraph
): FeatureCollection {
	if (path == null) {
		return { type: 'FeatureCollection', features: [] }
	}

	const segments =
		graph != null
			? campusPathDisplaySegments(path, graph)
			: (path.displaySegments ??
				(path.coordinates.length >= 2
					? [{ coordinates: path.coordinates, surface: 'indoor' as const }]
					: []))

	const rounded = Math.round(path.distanceMeters)
	return {
		type: 'FeatureCollection',
		features: segments
			.filter((segment) => segment.coordinates.length >= 2)
			.map((segment) => ({
				type: 'Feature' as const,
				properties: {
					distanceMeters: rounded,
					surface: segment.surface,
					...(segment.building != null ? { building: segment.building } : {}),
					// Indoor segments carry their floor so the map can show only
					// the selected floor; outdoor segments have none and always show.
					...(segment.floor != null ? { floor: segment.floor } : {})
				},
				geometry: {
					type: 'LineString' as const,
					coordinates: segment.coordinates
				}
			}))
	}
}
