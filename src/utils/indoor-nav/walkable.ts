import {
	bboxOfGeom,
	distM,
	hasLineOfSightM,
	M_PER_DEG_LAT,
	M_PER_DEG_LON,
	type PolygonGeom,
	pointInAnyMask
} from './geometry'
import type { LonLat } from './types'

const CELL_M = 0.75
const LOS_STEP_M = 0.4

export type WalkMask = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>

function maskGeom(m: WalkMask): PolygonGeom {
	return m.geometry as PolygonGeom
}

function lonLatToCell(
	lon: number,
	lat: number,
	origin: LonLat,
	cellLon: number,
	cellLat: number
): { c: number; r: number } {
	const c = Math.floor((lon - origin[0]) / cellLon)
	const r = Math.floor((lat - origin[1]) / cellLat)
	return { c, r }
}

function cellCenter(
	c: number,
	r: number,
	origin: LonLat,
	cellLon: number,
	cellLat: number
): LonLat {
	return [origin[0] + (c + 0.5) * cellLon, origin[1] + (r + 0.5) * cellLat]
}

function pointInAny(coord: LonLat, masks: WalkMask[]): boolean {
	return pointInAnyMask(coord, masks)
}

/** True if the straight segment stays inside walkable masks. */
function hasLineOfSight(a: LonLat, b: LonLat, masks: WalkMask[]): boolean {
	if (masks.length === 0) {
		return distM(a, b) < 1e-6
	}
	return hasLineOfSightM(a, b, masks, LOS_STEP_M)
}

/**
 * Pull the string: keep endpoints, skip intermediates whenever a direct
 * walkable line exists. Yields long straight corridor segments.
 */
export function stringPull(path: LonLat[], masks: WalkMask[]): LonLat[] {
	if (path.length <= 2) {
		return path
	}
	const out: LonLat[] = [path[0]]
	let i = 0
	while (i < path.length - 1) {
		let best = i + 1
		for (let j = path.length - 1; j > i + 1; j--) {
			if (hasLineOfSight(path[i], path[j], masks)) {
				best = j
				break
			}
		}
		out.push(path[best])
		i = best
	}
	const cleaned: LonLat[] = [out[0]]
	for (let k = 1; k < out.length; k++) {
		if (distM(cleaned[cleaned.length - 1], out[k]) > 0.2) {
			cleaned.push(out[k])
		}
	}
	return cleaned
}

/** Snap a coordinate onto the nearest walkable cell center (search spiral). */
export function snapToWalkable(
	coord: LonLat,
	masks: WalkMask[],
	maxM = 8
): LonLat | null {
	if (pointInAny(coord, masks)) {
		return coord
	}
	const cellLon = CELL_M / M_PER_DEG_LON
	const cellLat = CELL_M / M_PER_DEG_LAT
	const maxSteps = Math.ceil(maxM / CELL_M)
	for (let s = 1; s <= maxSteps; s++) {
		for (let dc = -s; dc <= s; dc++) {
			for (let dr = -s; dr <= s; dr++) {
				if (Math.max(Math.abs(dc), Math.abs(dr)) !== s) {
					continue
				}
				const cand: LonLat = [coord[0] + dc * cellLon, coord[1] + dr * cellLat]
				if (pointInAny(cand, masks)) {
					return cand
				}
			}
		}
	}
	return null
}

/**
 * Grid A* through polygon mask(s), then string-pull to the straightest
 * walkable polyline. Returns path including original start/end.
 */
export function gridPath(
	from: LonLat,
	to: LonLat,
	masks: WalkMask[]
): LonLat[] | null {
	if (masks.length === 0) {
		return null
	}

	if (hasLineOfSight(from, to, masks)) {
		return [from, to]
	}

	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	for (const m of masks) {
		const b = bboxOfGeom(maskGeom(m))
		minX = Math.min(minX, b[0])
		minY = Math.min(minY, b[1])
		maxX = Math.max(maxX, b[2])
		maxY = Math.max(maxY, b[3])
	}
	const cellLon = CELL_M / M_PER_DEG_LON
	const cellLat = CELL_M / M_PER_DEG_LAT
	minX -= cellLon
	minY -= cellLat
	maxX += cellLon
	maxY += cellLat
	const origin: LonLat = [minX, minY]
	const cols = Math.ceil((maxX - minX) / cellLon) + 1
	const rows = Math.ceil((maxY - minY) / cellLat) + 1

	const walkable = new Uint8Array(cols * rows)
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const p = cellCenter(c, r, origin, cellLon, cellLat)
			if (pointInAny(p, masks)) {
				walkable[r * cols + c] = 1
			}
		}
	}

	const startSnap = snapToWalkable(from, masks) ?? from
	const endSnap = snapToWalkable(to, masks) ?? to
	let { c: sc, r: sr } = lonLatToCell(
		startSnap[0],
		startSnap[1],
		origin,
		cellLon,
		cellLat
	)
	let { c: ec, r: er } = lonLatToCell(
		endSnap[0],
		endSnap[1],
		origin,
		cellLon,
		cellLat
	)
	sc = Math.max(0, Math.min(cols - 1, sc))
	sr = Math.max(0, Math.min(rows - 1, sr))
	ec = Math.max(0, Math.min(cols - 1, ec))
	er = Math.max(0, Math.min(rows - 1, er))

	const nearestWalkable = (
		c0: number,
		r0: number
	): { c: number; r: number } | null => {
		if (walkable[r0 * cols + c0] === 1) {
			return { c: c0, r: r0 }
		}
		for (let s = 1; s < 40; s++) {
			for (let dc = -s; dc <= s; dc++) {
				for (let dr = -s; dr <= s; dr++) {
					if (Math.max(Math.abs(dc), Math.abs(dr)) !== s) {
						continue
					}
					const c = c0 + dc
					const r = r0 + dr
					if (c < 0 || r < 0 || c >= cols || r >= rows) {
						continue
					}
					if (walkable[r * cols + c] === 1) {
						return { c, r }
					}
				}
			}
		}
		return null
	}
	const sCell = nearestWalkable(sc, sr)
	const eCell = nearestWalkable(ec, er)
	if (sCell == null || eCell == null) {
		return null
	}

	const key = (c: number, r: number): number => r * cols + c
	const open: Array<{ c: number; r: number; g: number; f: number }> = []
	const gScore = new Float64Array(cols * rows).fill(Number.POSITIVE_INFINITY)
	const came = new Int32Array(cols * rows).fill(-1)
	const startK = key(sCell.c, sCell.r)
	gScore[startK] = 0
	open.push({
		c: sCell.c,
		r: sCell.r,
		g: 0,
		f: Math.hypot(eCell.c - sCell.c, eCell.r - sCell.r) * CELL_M
	})

	const orth = CELL_M
	const diag = CELL_M * Math.SQRT2
	const neighbors = [
		[1, 0, orth],
		[-1, 0, orth],
		[0, 1, orth],
		[0, -1, orth],
		[1, 1, diag],
		[1, -1, diag],
		[-1, 1, diag],
		[-1, -1, diag]
	] as const

	let found = false
	const closed = new Uint8Array(cols * rows)
	while (open.length > 0) {
		let bi = 0
		for (let i = 1; i < open.length; i++) {
			if (open[i].f < open[bi].f) {
				bi = i
			}
		}
		const cur = open[bi]
		open[bi] = open[open.length - 1]
		open.pop()
		const ck = key(cur.c, cur.r)
		if (closed[ck] === 1) {
			continue
		}
		closed[ck] = 1
		if (cur.c === eCell.c && cur.r === eCell.r) {
			found = true
			break
		}
		for (const [dc, dr, w] of neighbors) {
			const nc = cur.c + dc
			const nr = cur.r + dr
			if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) {
				continue
			}
			if (dc !== 0 && dr !== 0) {
				if (
					walkable[cur.r * cols + nc] === 0 ||
					walkable[nr * cols + cur.c] === 0
				) {
					continue
				}
			}
			const nk = key(nc, nr)
			if (walkable[nk] === 0 || closed[nk] === 1) {
				continue
			}
			const tg = cur.g + w
			if (tg >= gScore[nk]) {
				continue
			}
			gScore[nk] = tg
			came[nk] = ck
			const f = tg + Math.hypot(eCell.c - nc, eCell.r - nr) * CELL_M
			open.push({ c: nc, r: nr, g: tg, f })
		}
	}

	if (!found) {
		return null
	}

	const raw: LonLat[] = [from]
	const pathCells: Array<{ c: number; r: number }> = []
	let ck = key(eCell.c, eCell.r)
	while (ck >= 0) {
		pathCells.push({ c: ck % cols, r: Math.floor(ck / cols) })
		ck = came[ck]
	}
	pathCells.reverse()
	for (const cell of pathCells) {
		raw.push(cellCenter(cell.c, cell.r, origin, cellLon, cellLat))
	}
	raw.push(to)

	return stringPull(raw, masks)
}
