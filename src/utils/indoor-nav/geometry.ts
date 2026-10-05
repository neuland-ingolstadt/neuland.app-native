import type { FitBounds, LonLat } from './types'

const M_PER_DEG_LAT = 111_320
const REF_LAT = 48.7662
const M_PER_DEG_LON = M_PER_DEG_LAT * Math.cos((REF_LAT * Math.PI) / 180)

export function haversineM(a: LonLat, b: LonLat): number {
	const dLat = ((b[1] - a[1]) * Math.PI) / 180
	const dLon = ((b[0] - a[0]) * Math.PI) / 180
	const lat1 = (a[1] * Math.PI) / 180
	const lat2 = (b[1] * Math.PI) / 180
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
	return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Fast planar distance in meters (equirectangular around THI). */
export function distM(a: LonLat, b: LonLat): number {
	const dx = (a[0] - b[0]) * M_PER_DEG_LON
	const dy = (a[1] - b[1]) * M_PER_DEG_LAT
	return Math.hypot(dx, dy)
}

export function xyAt(c: LonLat, origin: LonLat): [number, number] {
	return [
		(c[0] - origin[0]) * M_PER_DEG_LON,
		(c[1] - origin[1]) * M_PER_DEG_LAT
	]
}

export function lonLatFromXY(
	xy: [number, number],
	origin: LonLat,
	decimals = 7
): LonLat {
	const round = (n: number): number => {
		const f = 10 ** decimals
		return Math.round(n * f) / f
	}
	return [
		round(origin[0] + xy[0] / M_PER_DEG_LON),
		round(origin[1] + xy[1] / M_PER_DEG_LAT)
	]
}

function pointInRing(coord: LonLat, ring: LonLat[]): boolean {
	let inside = false
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i][0]
		const yi = ring[i][1]
		const xj = ring[j][0]
		const yj = ring[j][1]
		if (
			yi > coord[1] !== yj > coord[1] &&
			coord[0] < ((xj - xi) * (coord[1] - yi)) / (yj - yi) + xi
		) {
			inside = !inside
		}
	}
	return inside
}

export type PolygonGeom = GeoJSON.Polygon | GeoJSON.MultiPolygon

export function pointInPolygonGeom(coord: LonLat, geom: PolygonGeom): boolean {
	if (geom.type === 'Polygon') {
		if (geom.coordinates.length === 0) {
			return false
		}
		if (!pointInRing(coord, geom.coordinates[0] as LonLat[])) {
			return false
		}
		for (let h = 1; h < geom.coordinates.length; h++) {
			if (pointInRing(coord, geom.coordinates[h] as LonLat[])) {
				return false
			}
		}
		return true
	}
	for (const poly of geom.coordinates) {
		if (poly.length === 0) {
			continue
		}
		if (!pointInRing(coord, poly[0] as LonLat[])) {
			continue
		}
		let inHole = false
		for (let h = 1; h < poly.length; h++) {
			if (pointInRing(coord, poly[h] as LonLat[])) {
				inHole = true
				break
			}
		}
		if (!inHole) {
			return true
		}
	}
	return false
}

export function polygonCentroid(geom: PolygonGeom): LonLat {
	let best: LonLat | null = null
	let bestArea = 0
	const polys: number[][][][] =
		geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
	for (const poly of polys) {
		const ring = poly[0] as LonLat[] | undefined
		if (ring == null || ring.length < 3) {
			continue
		}
		let area2 = 0
		let cx = 0
		let cy = 0
		for (let i = 0; i < ring.length - 1; i++) {
			const [x0, y0] = xyAt(ring[i], ring[0])
			const [x1, y1] = xyAt(ring[i + 1], ring[0])
			const cross = x0 * y1 - x1 * y0
			area2 += cross
			cx += (x0 + x1) * cross
			cy += (y0 + y1) * cross
		}
		const area = Math.abs(area2) / 2
		if (area > bestArea) {
			bestArea = area
			best =
				Math.abs(area2) < 1e-9
					? ([...ring[0]] as LonLat)
					: lonLatFromXY([cx / (3 * area2), cy / (3 * area2)], ring[0])
		}
	}
	if (best != null) {
		return best
	}
	const ring = polys[0]?.[0] as LonLat[] | undefined
	return ring?.[0] != null ? ([...ring[0]] as LonLat) : [0, 0]
}

/** Project p onto segment a–b; returns foot point + t in [0,1] + distance in meters. */
export function projectOnSegment(
	p: LonLat,
	a: LonLat,
	b: LonLat
): { foot: LonLat; t: number; dist: number } {
	const [px, py] = xyAt(p, a)
	const [bx, by] = xyAt(b, a)
	const len2 = bx * bx + by * by
	let t = len2 < 1e-12 ? 0 : (px * bx + py * by) / len2
	t = Math.max(0, Math.min(1, t))
	const foot = lonLatFromXY([bx * t, by * t], a)
	return { foot, t, dist: distM(p, foot) }
}

/** Minimum distance in meters from coord to any ring of the polygon. */
export function distanceToPolygonM(coord: LonLat, geom: PolygonGeom): number {
	if (pointInPolygonGeom(coord, geom)) {
		return 0
	}
	let best = Number.POSITIVE_INFINITY
	const polys: number[][][][] =
		geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
	for (const poly of polys) {
		for (const ring of poly) {
			const pts = ring as LonLat[]
			for (let i = 0; i < pts.length - 1; i++) {
				const { dist } = projectOnSegment(coord, pts[i], pts[i + 1])
				if (dist < best) {
					best = dist
				}
			}
		}
	}
	return best
}

/** Nearest point on any ring of the polygon to the given coordinate. */
export function nearestPointOnPolygon(
	coord: LonLat,
	geom: PolygonGeom
): LonLat {
	let best: LonLat = coord
	let bestD = Number.POSITIVE_INFINITY
	const polys: number[][][][] =
		geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
	for (const poly of polys) {
		for (const ring of poly) {
			const pts = ring as LonLat[]
			for (let i = 0; i < pts.length - 1; i++) {
				const { foot, dist } = projectOnSegment(coord, pts[i], pts[i + 1])
				if (dist < bestD) {
					bestD = dist
					best = foot
				}
			}
		}
	}
	return best
}

export function bboxOfGeom(
	geom: PolygonGeom
): [number, number, number, number] {
	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	const polys: number[][][][] =
		geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
	for (const poly of polys) {
		for (const ring of poly) {
			for (const c of ring as LonLat[]) {
				if (c[0] < minX) {
					minX = c[0]
				}
				if (c[1] < minY) {
					minY = c[1]
				}
				if (c[0] > maxX) {
					maxX = c[0]
				}
				if (c[1] > maxY) {
					maxY = c[1]
				}
			}
		}
	}
	return [minX, minY, maxX, maxY]
}

/** Minimum ring-to-ring distance in meters between two polygons. */
export function polygonsMinGapM(a: PolygonGeom, b: PolygonGeom): number {
	const rings = (g: PolygonGeom): LonLat[][] => {
		const polys: number[][][][] =
			g.type === 'Polygon' ? [g.coordinates] : g.coordinates
		return polys.flatMap((poly) => poly.map((ring) => ring as LonLat[]))
	}
	let best = Number.POSITIVE_INFINITY
	for (const ra of rings(a)) {
		for (const p of ra) {
			if (pointInPolygonGeom(p, b)) {
				return 0
			}
		}
	}
	for (const rb of rings(b)) {
		for (const p of rb) {
			if (pointInPolygonGeom(p, a)) {
				return 0
			}
		}
	}
	for (const ra of rings(a)) {
		for (let i = 0; i < ra.length - 1; i++) {
			for (const rb of rings(b)) {
				for (let j = 0; j < rb.length - 1; j++) {
					const d = segmentsDistM(ra[i], ra[i + 1], rb[j], rb[j + 1])
					if (d < best) {
						best = d
					}
					if (best === 0) {
						return 0
					}
				}
			}
		}
	}
	return best
}

function segmentsDistM(p1: LonLat, p2: LonLat, p3: LonLat, p4: LonLat): number {
	if (segmentsIntersect(p1, p2, p3, p4)) {
		return 0
	}
	return Math.min(
		projectOnSegment(p1, p3, p4).dist,
		projectOnSegment(p2, p3, p4).dist,
		projectOnSegment(p3, p1, p2).dist,
		projectOnSegment(p4, p1, p2).dist
	)
}

function segmentsIntersect(
	p1: LonLat,
	p2: LonLat,
	p3: LonLat,
	p4: LonLat
): boolean {
	const d = (a: LonLat, b: LonLat, c: LonLat): number =>
		(c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])
	const d1 = d(p3, p4, p1)
	const d2 = d(p3, p4, p2)
	const d3 = d(p1, p2, p3)
	const d4 = d(p1, p2, p4)
	if (
		((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
		((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
	) {
		return true
	}
	return false
}

/** Bounding corners of a coordinate list, expanded by marginM each side. */
export function bboxOfCoords(coords: LonLat[], marginM = 0): FitBounds | null {
	if (coords.length === 0) {
		return null
	}
	let minLon = Number.POSITIVE_INFINITY
	let minLat = Number.POSITIVE_INFINITY
	let maxLon = Number.NEGATIVE_INFINITY
	let maxLat = Number.NEGATIVE_INFINITY
	for (const c of coords) {
		if (c[0] < minLon) {
			minLon = c[0]
		}
		if (c[1] < minLat) {
			minLat = c[1]
		}
		if (c[0] > maxLon) {
			maxLon = c[0]
		}
		if (c[1] > maxLat) {
			maxLat = c[1]
		}
	}
	const midLat = (minLat + maxLat) / 2
	const dLat = marginM / 111320
	const dLon = marginM / (111320 * Math.cos((midLat * Math.PI) / 180))
	return {
		northEast: [maxLon + dLon, maxLat + dLat],
		southWest: [minLon - dLon, minLat - dLat]
	}
}
