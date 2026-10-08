import type { Position } from 'geojson'
import type { MapCoordinate } from '@/types/map'
import { haversineM } from './indoor-nav/geometry'
import { INGOLSTADT_CENTER } from './map-constants'

export function getCenter(rooms: Position[][][]): MapCoordinate {
	const centers = rooms.map((room) => bboxCenter(room[0] ?? []))
	return averageCoords(centers)
}

export function getCenterSingle(
	coordinates: number[][][] | undefined
): MapCoordinate {
	if (
		coordinates == null ||
		coordinates.length === 0 ||
		coordinates[0]?.length === 0
	) {
		return INGOLSTADT_CENTER
	}
	return averageCoords(coordinates[0] as Position[])
}

/** Centroid of a point list (bbox midpoint for rings, mean for point lists). */
function bboxCenter(points: Position[]): MapCoordinate {
	const xs = points.map((p) => p[0] as number)
	const ys = points.map((p) => p[1] as number)
	return [
		(Math.min(...xs) + Math.max(...xs)) / 2,
		(Math.min(...ys) + Math.max(...ys)) / 2
	]
}

function averageCoords(points: Array<Position | MapCoordinate>): MapCoordinate {
	let lon = 0
	let lat = 0
	let count = 0
	for (const p of points) {
		const x = p[0]
		const y = p[1]
		if (typeof x !== 'number' || typeof y !== 'number') {
			continue
		}
		lon += x
		lat += y
		count += 1
	}
	if (count === 0) {
		return INGOLSTADT_CENTER
	}
	return [lon / count, lat / count]
}

export function getPolygonArea(coordinates: Position[][] | undefined): number {
	const ring = coordinates?.[0]
	if (ring == null || ring.length < 3) {
		return 0
	}

	let area = 0
	for (let i = 0; i < ring.length - 1; i++) {
		const [x1, y1] = ring[i]
		const [x2, y2] = ring[i + 1]
		if (
			typeof x1 !== 'number' ||
			typeof y1 !== 'number' ||
			typeof x2 !== 'number' ||
			typeof y2 !== 'number'
		) {
			return 0
		}
		area += x1 * y2 - x2 * y1
	}

	return Math.abs(area) / 2
}

/** Great-circle distance between two coordinates in meters. */
export function getHaversineDistanceMeters(
	a: Position | MapCoordinate,
	b: Position | MapCoordinate
): number {
	return haversineM([a[0] ?? 0, a[1] ?? 0], [b[0] ?? 0, b[1] ?? 0])
}

type RingPoint = Position | MapCoordinate

function asTuple(point: RingPoint): MapCoordinate {
	return [point[0] ?? 0, point[1] ?? 0]
}

function isClosedRing(ring: RingPoint[]): boolean {
	if (ring.length < 2) {
		return false
	}
	const first = ring[0]
	const last = ring[ring.length - 1]
	return first?.[0] === last?.[0] && first?.[1] === last?.[1]
}

/** Ring vertices without the duplicated GeoJSON closing point. */
function openRing(ring: RingPoint[]): RingPoint[] {
	if (ring.length > 1 && isClosedRing(ring)) {
		return ring.slice(0, -1)
	}
	return ring
}

/** Ray-cast point-in-ring test (scale-invariant, works in degrees). */
export function isPointInPolygonRing(
	point: RingPoint,
	ring: RingPoint[]
): boolean {
	const open = openRing(ring)
	if (open.length < 3) {
		return false
	}
	const [px, py] = asTuple(point)
	let inside = false
	for (let i = 0, j = open.length - 1; i < open.length; j = i++) {
		const [xi, yi] = asTuple(open[i] ?? [0, 0])
		const [xj, yj] = asTuple(open[j] ?? [0, 0])
		if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
			inside = !inside
		}
	}
	return inside
}

const METERS_PER_DEGREE_LAT = 111_320

function projectOntoSegment(
	point: MapCoordinate,
	a: MapCoordinate,
	b: MapCoordinate
): { foot: MapCoordinate; distanceMeters: number } {
	const midLat = (point[1] + a[1] + b[1]) / 3
	const kx = METERS_PER_DEGREE_LAT * Math.cos((midLat * Math.PI) / 180)
	const bx = (b[0] - a[0]) * kx
	const by = (b[1] - a[1]) * METERS_PER_DEGREE_LAT
	const px = (point[0] - a[0]) * kx
	const py = (point[1] - a[1]) * METERS_PER_DEGREE_LAT
	const len2 = bx * bx + by * by
	const t =
		len2 < 1e-12 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / len2))
	return {
		foot: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
		distanceMeters: Math.hypot(px - bx * t, py - by * t)
	}
}

/** Nearest point on a polygon boundary to the given coordinate. */
export function nearestPointOnPolygonRing(
	point: RingPoint,
	ring: RingPoint[]
): MapCoordinate {
	const from = asTuple(point)
	const open = openRing(ring)
	if (open.length === 0) {
		return from
	}
	if (open.length === 1) {
		return asTuple(open[0] ?? from)
	}
	let best = asTuple(open[0] ?? from)
	let bestDist = Number.POSITIVE_INFINITY
	for (let i = 0; i < open.length; i++) {
		const a = asTuple(open[i] ?? from)
		const b = asTuple(open[(i + 1) % open.length] ?? from)
		const { foot, distanceMeters } = projectOntoSegment(from, a, b)
		if (distanceMeters < bestDist) {
			bestDist = distanceMeters
			best = foot
		}
	}
	return best
}

/**
 * Closest boundary pair between two rings. Touching polygons meet at
 * distance zero on their shared edge; disjoint ones use vertex-to-edge
 * projections in both directions.
 */
export function closestPointsBetweenRings(
	aRing: RingPoint[],
	bRing: RingPoint[]
): [MapCoordinate, MapCoordinate] {
	const aOpen = openRing(aRing)
	const bOpen = openRing(bRing)
	const fallbackA = asTuple(aOpen[0] ?? [0, 0])
	const fallbackB = asTuple(bOpen[0] ?? [0, 0])
	if (aOpen.length === 0 || bOpen.length === 0) {
		return [fallbackA, fallbackB]
	}
	let best: [MapCoordinate, MapCoordinate] = [fallbackA, fallbackB]
	let bestDist = Number.POSITIVE_INFINITY
	for (const vertex of aOpen) {
		const from = asTuple(vertex)
		const foot = nearestPointOnPolygonRing(from, bOpen)
		const dist = getHaversineDistanceMeters(from, foot)
		if (dist < bestDist) {
			bestDist = dist
			best = [from, foot]
		}
	}
	for (const vertex of bOpen) {
		const to = asTuple(vertex)
		const foot = nearestPointOnPolygonRing(to, aOpen)
		const dist = getHaversineDistanceMeters(foot, to)
		if (dist < bestDist) {
			bestDist = dist
			best = [foot, to]
		}
	}
	return best
}

function nearestRingVertexIndex(
	ring: RingPoint[],
	point: MapCoordinate
): number {
	let bestIndex = 0
	let bestDist = Number.POSITIVE_INFINITY
	for (let i = 0; i < ring.length; i++) {
		const dist = getHaversineDistanceMeters(point, asTuple(ring[i] ?? point))
		if (dist < bestDist) {
			bestDist = dist
			bestIndex = i
		}
	}
	return bestIndex
}

function walkRingVertices(
	ring: RingPoint[],
	fromIndex: number,
	toIndex: number,
	direction: 1 | -1
): MapCoordinate[] {
	const points: MapCoordinate[] = []
	let index = fromIndex
	for (let guard = 0; guard <= ring.length; guard++) {
		points.push(asTuple(ring[index] ?? [0, 0]))
		if (index === toIndex) {
			break
		}
		index = (index + direction + ring.length) % ring.length
	}
	return points
}

function polylineLength(points: MapCoordinate[]): number {
	let total = 0
	for (let i = 1; i < points.length; i++) {
		total += getHaversineDistanceMeters(points[i - 1], points[i])
	}
	return total
}

/**
 * Path from `start` to `end` hugging a polygon boundary: both endpoints snap
 * to their nearest boundary point, then the shorter way around the ring wins.
 * Always includes `start` first and `end` last so callers can splice it inline.
 */
export function routeWithinPolygonRing(
	ring: RingPoint[],
	start: RingPoint,
	end: RingPoint
): MapCoordinate[] {
	const from = asTuple(start)
	const to = asTuple(end)
	const open = openRing(ring)
	if (open.length < 3) {
		return [from, to]
	}
	const entry = nearestPointOnPolygonRing(from, open)
	const exit = nearestPointOnPolygonRing(to, open)
	if (getHaversineDistanceMeters(entry, exit) < 0.05) {
		return [from, to]
	}
	const enterIndex = nearestRingVertexIndex(open, entry)
	const exitIndex = nearestRingVertexIndex(open, exit)
	const forward = walkRingVertices(open, enterIndex, exitIndex, 1)
	const backward = walkRingVertices(open, enterIndex, exitIndex, -1)
	const forwardPath = [entry, ...forward.slice(1, -1), exit]
	const backwardPath = [entry, ...backward.slice(1, -1), exit]
	const chosen =
		polylineLength(forwardPath) <= polylineLength(backwardPath)
			? forwardPath
			: backwardPath
	return [from, ...chosen, to]
}
