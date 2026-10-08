import type { FeatureCollection, GeoJsonProperties } from 'geojson'
import type { MapCoordinate } from '@/types/map'
import { getHaversineDistanceMeters } from '@/utils/map-geometry-utils'

/**
 * Link near-duplicate vertices with a short edge (coordinates stay exact —
 * do not merge/average, which pulls the drawn route off the real paths).
 */
const VERTEX_LINK_METERS = 5
/**
 * If a vertex sits this close to another segment's interior, split that segment
 * and join there — otherwise T-junctions without a shared vertex force the
 * route to continue to a far endpoint (highlighting an unwalked stub).
 */
const JUNCTION_SPLIT_METERS = 12
/**
 * Connect nearby path components with a short hop. Hops whose interior
 * crosses a building/room footprint are rejected (see obstacles) so the
 * bridge never cuts through walls to keep the network connected.
 */
const COMPONENT_BRIDGE_METERS = 25
/** Refuse routes that start/end farther than this from the network. */
const MAX_SNAP_METERS = 80
/**
 * Only paint a straight connector from the door/GPS onto the network when short.
 * Longer connectors are omitted from the polyline (routing still snaps).
 */
const MAX_CONNECTOR_METERS = 15
/**
 * Outdoor legs must stay outdoors: `indoor` / `shortcut` edges describe indoor
 * passages (through halls or corridors) and are never traversed by the outdoor
 * router — a cost discount there produces detours that cut through buildings.
 * Indoor walking belongs to the room → exit / entrance → room phases instead.
 */

export type FootpathObstacleBbox = [number, number, number, number]

export type FootpathRouteSurface = 'indoor' | 'outdoor'

export interface FootpathRouteSegment {
	coordinates: MapCoordinate[]
	surface: FootpathRouteSurface
}

export interface FootpathRoute {
	coordinates: MapCoordinate[]
	distanceMeters: number
	/** Painted parts — indoor/shortcut edges use the indoor color. */
	segments: FootpathRouteSegment[]
}

interface FootpathEdgeFlags {
	shortcut: boolean
	indoor: boolean
}

interface FootpathEdge extends FootpathEdgeFlags {
	to: string
	/** Real walk distance in meters (for UI). */
	meters: number
	/** Weighted length used by Dijkstra. */
	cost: number
}

export interface FootpathGraph {
	nodes: Map<string, MapCoordinate>
	edges: Map<string, FootpathEdge[]>
}

function isFiniteCoordinate(
	value: number[] | undefined
): value is MapCoordinate {
	return (
		value != null &&
		typeof value[0] === 'number' &&
		typeof value[1] === 'number' &&
		Number.isFinite(value[0]) &&
		Number.isFinite(value[1])
	)
}

function nodeKey(coordinate: MapCoordinate): string {
	return `${coordinate[0].toFixed(7)},${coordinate[1].toFixed(7)}`
}

function isTruthyFlag(value: unknown): boolean {
	return value === true || value === 1 || value === 'true' || value === '1'
}

function readEdgeFlags(
	properties: GeoJsonProperties | null | undefined
): FootpathEdgeFlags {
	// Only explicit boolean flags count. Hand-drawn outdoor connectors share
	// the same manual source/note markers but are genuine outdoor paths.
	return {
		shortcut: isTruthyFlag(properties?.shortcut),
		indoor: isTruthyFlag(properties?.indoor)
	}
}

function edgeSurface(edge: FootpathEdge): FootpathRouteSurface {
	return edge.indoor || edge.shortcut ? 'indoor' : 'outdoor'
}

function addDirectedEdge(
	edges: Map<string, FootpathEdge[]>,
	from: string,
	to: string,
	meters: number,
	flags: FootpathEdgeFlags = { shortcut: false, indoor: false }
): void {
	const edge: FootpathEdge = {
		to,
		meters,
		cost: meters,
		shortcut: flags.shortcut,
		indoor: flags.indoor
	}
	const list = edges.get(from)
	if (list == null) {
		edges.set(from, [edge])
		return
	}
	const existingIndex = list.findIndex((existing) => existing.to === to)
	if (existingIndex >= 0) {
		if (edge.cost < list[existingIndex].cost) {
			list[existingIndex] = edge
		}
		return
	}
	list.push(edge)
}

function linkNodes(
	edges: Map<string, FootpathEdge[]>,
	a: string,
	b: string,
	meters: number,
	flags: FootpathEdgeFlags = { shortcut: false, indoor: false }
): void {
	if (a === b) {
		return
	}
	addDirectedEdge(edges, a, b, meters, flags)
	addDirectedEdge(edges, b, a, meters, flags)
}

function findEdge(
	edges: Map<string, FootpathEdge[]>,
	from: string,
	to: string
): FootpathEdge | undefined {
	return (edges.get(from) ?? []).find((edge) => edge.to === to)
}

function stripEdge(
	edges: Map<string, FootpathEdge[]>,
	from: string,
	to: string
): void {
	const list = edges.get(from)
	if (list == null) {
		return
	}
	edges.set(
		from,
		list.filter((edge) => edge.to !== to)
	)
}

function listUndirectedEdges(
	edges: Map<string, FootpathEdge[]>
): Array<{ a: string; b: string }> {
	const undirected: Array<{ a: string; b: string }> = []
	for (const [from, outgoing] of edges) {
		for (const edge of outgoing) {
			if (from < edge.to) {
				undirected.push({ a: from, b: edge.to })
			}
		}
	}
	return undirected
}

function pointInObstacle(
	point: MapCoordinate,
	obstacle: FootpathObstacleBbox
): boolean {
	const [lon, lat] = point
	return (
		lon >= obstacle[0] &&
		lon <= obstacle[2] &&
		lat >= obstacle[1] &&
		lat <= obstacle[3]
	)
}

/** True when a straight hop would cut through a building/room footprint. */
export function segmentCrossesObstacles(
	from: MapCoordinate,
	to: MapCoordinate,
	obstacles: FootpathObstacleBbox[]
): boolean {
	if (obstacles.length === 0) {
		return false
	}
	for (let step = 1; step <= 9; step++) {
		const t = step / 10
		const point: MapCoordinate = [
			from[0] + (to[0] - from[0]) * t,
			from[1] + (to[1] - from[1]) * t
		]
		for (const obstacle of obstacles) {
			if (pointInObstacle(point, obstacle)) {
				return true
			}
		}
	}
	return false
}

/**
 * Build a walkable outdoor graph from Neuland footpath LineStrings.
 * `indoor` / `shortcut` features describe indoor passages (through halls or
 * corridors) and are skipped: outdoor legs (exit → entrance) must stay
 * outdoors, indoor walking belongs to the indoor route phases. Geometry stays
 * on the source vertices — only tiny topological links are added, and none
 * of them may cut through a building/room footprint (obstacles).
 */
export function buildFootpathGraph(
	collection: FeatureCollection | undefined,
	obstacles: FootpathObstacleBbox[] = []
): FootpathGraph {
	const nodes = new Map<string, MapCoordinate>()
	const edges = new Map<string, FootpathEdge[]>()
	if (collection == null) {
		return { nodes, edges }
	}

	for (const feature of collection.features) {
		const geometry = feature.geometry
		if (geometry == null || geometry.type !== 'LineString') {
			continue
		}
		const flags = readEdgeFlags(feature.properties)
		if (flags.indoor || flags.shortcut) {
			continue
		}
		const coordinates = geometry.coordinates.filter(isFiniteCoordinate)
		for (let index = 0; index < coordinates.length; index++) {
			const coordinate = coordinates[index]
			const key = nodeKey(coordinate)
			if (!nodes.has(key)) {
				nodes.set(key, coordinate)
			}
			if (index === 0) {
				continue
			}
			const previous = coordinates[index - 1]
			const previousKey = nodeKey(previous)
			if (previousKey === key) {
				continue
			}
			linkNodes(
				edges,
				previousKey,
				key,
				getHaversineDistanceMeters(previous, coordinate),
				flags
			)
		}
	}

	// Topological join for near-miss endpoints — keep both exact coordinates.
	const ids = Array.from(nodes.keys())
	for (let i = 0; i < ids.length; i++) {
		const a = ids[i]
		const aCoord = nodes.get(a)
		if (aCoord == null) {
			continue
		}
		for (let j = i + 1; j < ids.length; j++) {
			const b = ids[j]
			const bCoord = nodes.get(b)
			if (bCoord == null) {
				continue
			}
			const meters = getHaversineDistanceMeters(aCoord, bCoord)
			if (
				meters > 0 &&
				meters <= VERTEX_LINK_METERS &&
				!segmentCrossesObstacles(aCoord, bCoord, obstacles)
			) {
				linkNodes(edges, a, b, meters)
			}
		}
	}

	splitEdgesAtNearbyNodes(nodes, edges, obstacles)
	splitCrossingEdges(nodes, edges, obstacles)
	bridgeNearbyComponents(nodes, edges, obstacles)

	return { nodes, edges }
}

function connectedComponents(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>
): string[][] {
	const visited = new Set<string>()
	const components: string[][] = []
	for (const id of nodes.keys()) {
		if (visited.has(id)) {
			continue
		}
		const component: string[] = []
		const stack = [id]
		while (stack.length > 0) {
			const current = stack.pop()
			if (current == null || visited.has(current)) {
				continue
			}
			visited.add(current)
			component.push(current)
			for (const edge of edges.get(current) ?? []) {
				stack.push(edge.to)
			}
		}
		components.push(component)
	}
	return components
}

/**
 * Join nearby path components so fragmented street data stays routable.
 * The hop must not cut through a building/room footprint — a blocked hop is
 * skipped (the gap is left open rather than drawn through walls).
 */
function bridgeNearbyComponents(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	obstacles: FootpathObstacleBbox[]
): void {
	const components = connectedComponents(nodes, edges)
	if (components.length < 2) {
		return
	}

	for (let i = 0; i < components.length; i++) {
		for (let j = i + 1; j < components.length; j++) {
			let bestMeters = Number.POSITIVE_INFINITY
			let bestA: string | undefined
			let bestB: string | undefined
			for (const a of components[i]) {
				const aCoord = nodes.get(a)
				if (aCoord == null) {
					continue
				}
				for (const b of components[j]) {
					const bCoord = nodes.get(b)
					if (bCoord == null) {
						continue
					}
					const meters = getHaversineDistanceMeters(aCoord, bCoord)
					if (meters >= bestMeters || meters > COMPONENT_BRIDGE_METERS) {
						continue
					}
					if (segmentCrossesObstacles(aCoord, bCoord, obstacles)) {
						continue
					}
					bestMeters = meters
					bestA = a
					bestB = b
				}
			}
			if (bestA != null && bestB != null) {
				linkNodes(edges, bestA, bestB, bestMeters)
			}
		}
	}
}

interface SegmentProjection {
	point: MapCoordinate
	distanceMeters: number
	t: number
}

function projectOntoSegment(
	point: MapCoordinate,
	start: MapCoordinate,
	end: MapCoordinate
): SegmentProjection {
	const [px, py] = point
	const [ax, ay] = start
	const [bx, by] = end
	const dx = bx - ax
	const dy = by - ay
	const lengthSq = dx * dx + dy * dy
	const t =
		lengthSq === 0
			? 0
			: Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq))
	const projected: MapCoordinate = [ax + t * dx, ay + t * dy]
	return {
		point: projected,
		distanceMeters: getHaversineDistanceMeters(point, projected),
		t
	}
}

/**
 * Split segments where another vertex nearly touches their interior so routes
 * can turn at the geometric junction instead of walking past it. The new
 * transverse join must not cut through a building/room footprint — a blocked
 * join is skipped (the T-junction stays unlinked rather than crossing walls).
 */
function splitEdgesAtNearbyNodes(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	obstacles: FootpathObstacleBbox[]
): void {
	for (let pass = 0; pass < 8; pass++) {
		let splitApplied = false
		const undirected = listUndirectedEdges(edges)

		for (const nodeId of nodes.keys()) {
			const coordinate = nodes.get(nodeId)
			if (coordinate == null) {
				continue
			}

			let best:
				| {
						a: string
						b: string
						projection: SegmentProjection
				  }
				| undefined

			for (const { a, b } of undirected) {
				if (a === nodeId || b === nodeId) {
					continue
				}
				const aCoord = nodes.get(a)
				const bCoord = nodes.get(b)
				if (aCoord == null || bCoord == null) {
					continue
				}
				const projection = projectOntoSegment(coordinate, aCoord, bCoord)
				if (projection.t <= 0.05 || projection.t >= 0.95) {
					continue
				}
				if (projection.distanceMeters > JUNCTION_SPLIT_METERS) {
					continue
				}
				if (
					best == null ||
					projection.distanceMeters < best.projection.distanceMeters
				) {
					best = { a, b, projection }
				}
			}

			if (best == null) {
				continue
			}

			const { a, b, projection } = best
			const aCoord = nodes.get(a)
			const bCoord = nodes.get(b)
			if (aCoord == null || bCoord == null) {
				continue
			}

			// Never join across a building — the transverse hop would cut walls.
			if (segmentCrossesObstacles(coordinate, projection.point, obstacles)) {
				continue
			}

			const neighbors = edges.get(nodeId) ?? []
			if (
				neighbors.some((edge) => edge.to === a) &&
				neighbors.some((edge) => edge.to === b)
			) {
				continue
			}

			const parent = findEdge(edges, a, b)
			const flags: FootpathEdgeFlags = {
				shortcut: parent?.shortcut === true,
				indoor: parent?.indoor === true
			}
			stripEdge(edges, a, b)
			stripEdge(edges, b, a)

			let junctionId = nodeId
			if (projection.distanceMeters > VERTEX_LINK_METERS) {
				junctionId = `junc:${nodeKey(projection.point)}:${a}:${b}`
				if (!nodes.has(junctionId)) {
					nodes.set(junctionId, projection.point)
				}
				linkNodes(edges, nodeId, junctionId, projection.distanceMeters)
			}

			const junctionCoord = nodes.get(junctionId) ?? projection.point
			linkNodes(
				edges,
				a,
				junctionId,
				getHaversineDistanceMeters(aCoord, junctionCoord),
				flags
			)
			linkNodes(
				edges,
				junctionId,
				b,
				getHaversineDistanceMeters(junctionCoord, bCoord),
				flags
			)
			splitApplied = true
			break
		}

		if (!splitApplied) {
			return
		}
	}
}

interface SegmentPairClosest {
	pointOnA: MapCoordinate
	pointOnB: MapCoordinate
	tA: number
	tB: number
	distanceMeters: number
}

/** Closest points between two segments (planar lon/lat OK at campus scale). */
function closestPointsBetweenSegments(
	a1: MapCoordinate,
	a2: MapCoordinate,
	b1: MapCoordinate,
	b2: MapCoordinate
): SegmentPairClosest {
	const ax = a2[0] - a1[0]
	const ay = a2[1] - a1[1]
	const bx = b2[0] - b1[0]
	const by = b2[1] - b1[1]
	const cx = a1[0] - b1[0]
	const cy = a1[1] - b1[1]
	const aa = ax * ax + ay * ay
	const bb = bx * bx + by * by
	const ab = ax * bx + ay * by
	const ac = ax * cx + ay * cy
	const bc = bx * cx + by * cy
	const denom = aa * bb - ab * ab
	let tA = 0
	let tB = 0
	if (denom > 1e-20) {
		tA = Math.max(0, Math.min(1, (ab * bc - bb * ac) / denom))
	}
	tB = bb <= 1e-20 ? 0 : (ab * tA + bc) / bb
	if (tB < 0) {
		tB = 0
		tA = aa <= 1e-20 ? 0 : Math.max(0, Math.min(1, -ac / aa))
	} else if (tB > 1) {
		tB = 1
		tA = aa <= 1e-20 ? 0 : Math.max(0, Math.min(1, (ab - ac) / aa))
	}
	const pointOnA: MapCoordinate = [a1[0] + ax * tA, a1[1] + ay * tA]
	const pointOnB: MapCoordinate = [b1[0] + bx * tB, b1[1] + by * tB]
	return {
		pointOnA,
		pointOnB,
		tA,
		tB,
		distanceMeters: getHaversineDistanceMeters(pointOnA, pointOnB)
	}
}

function splitEdgeAtPoint(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	a: string,
	b: string,
	point: MapCoordinate
): string {
	const aCoord = nodes.get(a)
	const bCoord = nodes.get(b)
	if (aCoord == null || bCoord == null) {
		const id = nodeKey(point)
		nodes.set(id, point)
		return id
	}
	const projection = projectOntoSegment(point, aCoord, bCoord)
	if (projection.t <= 0.05) {
		return a
	}
	if (projection.t >= 0.95) {
		return b
	}
	const junctionId = `junc:${nodeKey(projection.point)}:${a}:${b}`
	if (nodes.has(junctionId)) {
		return junctionId
	}
	const parent = findEdge(edges, a, b)
	const flags: FootpathEdgeFlags = {
		shortcut: parent?.shortcut === true,
		indoor: parent?.indoor === true
	}
	nodes.set(junctionId, projection.point)
	stripEdge(edges, a, b)
	stripEdge(edges, b, a)
	linkNodes(
		edges,
		a,
		junctionId,
		getHaversineDistanceMeters(aCoord, projection.point),
		flags
	)
	linkNodes(
		edges,
		junctionId,
		b,
		getHaversineDistanceMeters(projection.point, bCoord),
		flags
	)
	return junctionId
}

/**
 * Split both edges where paths cross / nearly cross so turns do not keep the
 * unwalked stub past the junction. The transverse link between the two
 * junctions must not cut through a building/room footprint.
 */
function splitCrossingEdges(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	obstacles: FootpathObstacleBbox[]
): void {
	for (let pass = 0; pass < 12; pass++) {
		let splitApplied = false
		const undirected = listUndirectedEdges(edges)

		for (let i = 0; i < undirected.length; i++) {
			const edgeA = undirected[i]
			const a1 = nodes.get(edgeA.a)
			const a2 = nodes.get(edgeA.b)
			if (a1 == null || a2 == null) {
				continue
			}
			for (let j = i + 1; j < undirected.length; j++) {
				const edgeB = undirected[j]
				if (
					edgeA.a === edgeB.a ||
					edgeA.a === edgeB.b ||
					edgeA.b === edgeB.a ||
					edgeA.b === edgeB.b
				) {
					continue
				}
				const b1 = nodes.get(edgeB.a)
				const b2 = nodes.get(edgeB.b)
				if (b1 == null || b2 == null) {
					continue
				}
				const closest = closestPointsBetweenSegments(a1, a2, b1, b2)
				if (closest.distanceMeters > JUNCTION_SPLIT_METERS) {
					continue
				}
				if (
					closest.tA <= 0.05 ||
					closest.tA >= 0.95 ||
					closest.tB <= 0.05 ||
					closest.tB >= 0.95
				) {
					continue
				}

				const junctionA = splitEdgeAtPoint(
					nodes,
					edges,
					edgeA.a,
					edgeA.b,
					closest.pointOnA
				)
				const junctionB = splitEdgeAtPoint(
					nodes,
					edges,
					edgeB.a,
					edgeB.b,
					closest.pointOnB
				)
				if (junctionA !== junctionB) {
					const ja = nodes.get(junctionA)
					const jb = nodes.get(junctionB)
					if (
						ja != null &&
						jb != null &&
						!segmentCrossesObstacles(ja, jb, obstacles)
					) {
						linkNodes(
							edges,
							junctionA,
							junctionB,
							getHaversineDistanceMeters(ja, jb)
						)
					}
				}
				splitApplied = true
				break
			}
			if (splitApplied) {
				break
			}
		}

		if (!splitApplied) {
			return
		}
	}
}

interface NetworkSnap {
	nodeId: string
	coordinate: MapCoordinate
	distanceMeters: number
	/** When set, the snap splits this undirected edge. */
	edge?: { a: string; b: string }
}

function findNearestSnap(
	graph: FootpathGraph,
	point: MapCoordinate
): NetworkSnap | undefined {
	let best: NetworkSnap | undefined

	for (const [id, coordinate] of graph.nodes) {
		const distanceMeters = getHaversineDistanceMeters(point, coordinate)
		if (
			best == null ||
			distanceMeters < best.distanceMeters ||
			(distanceMeters === best.distanceMeters && id < best.nodeId)
		) {
			best = { nodeId: id, coordinate, distanceMeters }
		}
	}

	for (const [fromId, outgoing] of graph.edges) {
		const fromCoord = graph.nodes.get(fromId)
		if (fromCoord == null) {
			continue
		}
		for (const edge of outgoing) {
			if (fromId >= edge.to) {
				continue
			}
			const toCoord = graph.nodes.get(edge.to)
			if (toCoord == null) {
				continue
			}
			const projection = projectOntoSegment(point, fromCoord, toCoord)
			if (
				projection.distanceMeters > (best?.distanceMeters ?? MAX_SNAP_METERS)
			) {
				continue
			}
			if (projection.t <= 0.02) {
				if (best == null || projection.distanceMeters < best.distanceMeters) {
					best = {
						nodeId: fromId,
						coordinate: fromCoord,
						distanceMeters: projection.distanceMeters
					}
				}
				continue
			}
			if (projection.t >= 0.98) {
				if (best == null || projection.distanceMeters < best.distanceMeters) {
					best = {
						nodeId: edge.to,
						coordinate: toCoord,
						distanceMeters: projection.distanceMeters
					}
				}
				continue
			}
			const snapId = `snap:${nodeKey(projection.point)}:${fromId}:${edge.to}`
			if (best == null || projection.distanceMeters < best.distanceMeters) {
				best = {
					nodeId: snapId,
					coordinate: projection.point,
					distanceMeters: projection.distanceMeters,
					edge: { a: fromId, b: edge.to }
				}
			}
		}
	}

	if (best == null || best.distanceMeters > MAX_SNAP_METERS) {
		return undefined
	}
	return best
}

function cloneEdges(
	source: Map<string, FootpathEdge[]>
): Map<string, FootpathEdge[]> {
	const clone = new Map<string, FootpathEdge[]>()
	for (const [from, list] of source) {
		clone.set(
			from,
			list.map((edge) => ({
				to: edge.to,
				meters: edge.meters,
				cost: edge.cost,
				shortcut: edge.shortcut,
				indoor: edge.indoor
			}))
		)
	}
	return clone
}

function ensureSnapNode(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	snap: NetworkSnap
): string {
	if (nodes.has(snap.nodeId)) {
		return snap.nodeId
	}
	if (snap.edge == null) {
		nodes.set(snap.nodeId, snap.coordinate)
		return snap.nodeId
	}

	const { a, b } = snap.edge
	const aCoord = nodes.get(a)
	const bCoord = nodes.get(b)
	if (aCoord == null || bCoord == null) {
		nodes.set(snap.nodeId, snap.coordinate)
		return snap.nodeId
	}

	const parent = findEdge(edges, a, b)
	const flags: FootpathEdgeFlags = {
		shortcut: parent?.shortcut === true,
		indoor: parent?.indoor === true
	}
	nodes.set(snap.nodeId, snap.coordinate)
	stripEdge(edges, a, b)
	stripEdge(edges, b, a)
	linkNodes(
		edges,
		a,
		snap.nodeId,
		getHaversineDistanceMeters(aCoord, snap.coordinate),
		flags
	)
	linkNodes(
		edges,
		snap.nodeId,
		b,
		getHaversineDistanceMeters(snap.coordinate, bCoord),
		flags
	)
	return snap.nodeId
}

function reconstructNodeIds(
	prev: Map<string, string>,
	startId: string,
	endId: string
): string[] | undefined {
	const nodeIds: string[] = []
	let cursor: string | undefined = endId
	while (cursor != null) {
		nodeIds.push(cursor)
		if (cursor === startId) {
			break
		}
		cursor = prev.get(cursor)
	}
	if (nodeIds.at(-1) !== startId) {
		return undefined
	}
	nodeIds.reverse()
	return nodeIds
}

function appendCoordinate(
	target: MapCoordinate[],
	coordinate: MapCoordinate
): void {
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

/** Build painted segments; indoor/shortcut edges get the indoor color. */
function buildFootpathRouteFromPath(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	nodeIds: string[],
	options?: {
		fromConnector?: MapCoordinate
		toConnector?: MapCoordinate
	}
): FootpathRoute | undefined {
	if (nodeIds.length === 0) {
		return undefined
	}

	const segments: FootpathRouteSegment[] = []
	let currentCoords: MapCoordinate[] = []
	let currentSurface: FootpathRouteSurface = 'outdoor'
	let distanceMeters = 0

	const flush = (): void => {
		if (currentCoords.length >= 2) {
			segments.push({
				coordinates: currentCoords,
				surface: currentSurface
			})
		}
		currentCoords = []
	}

	const startOnSurface = (
		surface: FootpathRouteSurface,
		coordinate: MapCoordinate
	): void => {
		if (currentCoords.length > 0 && currentSurface !== surface) {
			const bridge = currentCoords.at(-1)
			flush()
			if (bridge != null) {
				appendCoordinate(currentCoords, bridge)
			}
		}
		currentSurface = surface
		appendCoordinate(currentCoords, coordinate)
	}

	const first = nodes.get(nodeIds[0])
	if (first == null) {
		return undefined
	}

	if (options?.fromConnector != null) {
		startOnSurface('outdoor', options.fromConnector)
		distanceMeters += getHaversineDistanceMeters(options.fromConnector, first)
	}
	startOnSurface('outdoor', first)

	for (let index = 0; index < nodeIds.length - 1; index++) {
		const fromId = nodeIds[index]
		const toId = nodeIds[index + 1]
		const toCoord = nodes.get(toId)
		const edge = findEdge(edges, fromId, toId)
		if (toCoord == null) {
			continue
		}
		const surface = edge != null ? edgeSurface(edge) : 'outdoor'
		distanceMeters +=
			edge?.meters ??
			getHaversineDistanceMeters(nodes.get(fromId) ?? toCoord, toCoord)
		startOnSurface(surface, toCoord)
	}

	if (options?.toConnector != null) {
		const last = nodes.get(nodeIds.at(-1) ?? '')
		if (last != null) {
			distanceMeters += getHaversineDistanceMeters(last, options.toConnector)
		}
		startOnSurface('outdoor', options.toConnector)
	}
	flush()

	const coordinates = segments.flatMap((segment, segmentIndex) =>
		segmentIndex === 0 ? segment.coordinates : segment.coordinates.slice(1)
	)
	if (coordinates.length < 2) {
		return undefined
	}

	return { coordinates, distanceMeters, segments }
}

function dijkstraPath(
	nodes: Map<string, MapCoordinate>,
	edges: Map<string, FootpathEdge[]>,
	startId: string,
	endId: string
): string[] | undefined {
	if (!nodes.has(startId) || !nodes.has(endId)) {
		return undefined
	}
	if (startId === endId) {
		return [startId]
	}

	const cost = new Map<string, number>()
	const prev = new Map<string, string>()
	const visited = new Set<string>()
	cost.set(startId, 0)

	while (visited.size < nodes.size) {
		let current: string | undefined
		let currentCost = Number.POSITIVE_INFINITY
		for (const [id, value] of cost) {
			if (!visited.has(id) && value < currentCost) {
				current = id
				currentCost = value
			}
		}
		if (current == null || currentCost === Number.POSITIVE_INFINITY) {
			break
		}
		if (current === endId) {
			break
		}
		visited.add(current)

		for (const edge of edges.get(current) ?? []) {
			if (visited.has(edge.to)) {
				continue
			}
			const next = currentCost + edge.cost
			if (next < (cost.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
				cost.set(edge.to, next)
				prev.set(edge.to, current)
			}
		}
	}

	return reconstructNodeIds(prev, startId, endId)
}

/**
 * Shortest outdoor walk along the campus footpath/street network.
 * Indoor `shortcut` / `indoor` passages are not part of this graph — outdoor
 * legs run exit → entrance on outdoor paths only.
 */
export function findFootpathRoute(
	graph: FootpathGraph,
	from: MapCoordinate,
	to: MapCoordinate
): FootpathRoute | undefined {
	if (graph.nodes.size === 0) {
		return undefined
	}

	const fromSnap = findNearestSnap(graph, from)
	const toSnap = findNearestSnap(graph, to)
	if (fromSnap == null || toSnap == null) {
		return undefined
	}

	const nodes = new Map(graph.nodes)
	const edges = cloneEdges(graph.edges)
	const fromId = ensureSnapNode(nodes, edges, fromSnap)
	const toId = ensureSnapNode(nodes, edges, toSnap)

	const nodeIds = dijkstraPath(nodes, edges, fromId, toId)
	if (nodeIds == null || nodeIds.length === 0) {
		return undefined
	}

	return buildFootpathRouteFromPath(nodes, edges, nodeIds, {
		fromConnector:
			fromSnap.distanceMeters <= MAX_CONNECTOR_METERS ? from : undefined,
		toConnector: toSnap.distanceMeters <= MAX_CONNECTOR_METERS ? to : undefined
	})
}
