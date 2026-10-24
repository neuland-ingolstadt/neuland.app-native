import {
	appendPathDistinct as appendDistinct,
	distM,
	hasLineOfSightM,
	lonLatFromXY,
	M_PER_DEG_LAT,
	M_PER_DEG_LON,
	polylineLengthPlanarM,
	projectOnSegment,
	xyAt
} from './geometry'
import type { LonLat } from './types'
import { stringPull, type WalkMask } from './walkable'

const LOS_STEP_M = 0.35
const KEY_DEC = 7

export interface CorridorFeature extends GeoJSON.Feature {
	geometry: GeoJSON.LineString
	properties: GeoJSON.GeoJsonProperties & {
		id?: string
		kind?: string
		Etage?: string
	}
}

export interface CorridorNet {
	floor: string
	vertices: Map<string, LonLat>
	adj: Map<string, Array<{ to: string; weightM: number; via: LonLat[] }>>
	segments: Array<{ a: LonLat; b: LonLat; aKey: string; bKey: string }>
	axes: [LonLat, LonLat]
}

function vKey(c: LonLat): string {
	return `${c[0].toFixed(KEY_DEC)},${c[1].toFixed(KEY_DEC)}`
}

function roundCoord(c: LonLat): LonLat {
	return [Number(c[0].toFixed(KEY_DEC)), Number(c[1].toFixed(KEY_DEC))]
}

function hasLineOfSight(a: LonLat, b: LonLat, masks: WalkMask[]): boolean {
	if (masks.length === 0) {
		return true
	}
	return hasLineOfSightM(a, b, masks, LOS_STEP_M)
}

function addEdge(
	adj: Map<string, Array<{ to: string; weightM: number; via: LonLat[] }>>,
	aKey: string,
	bKey: string,
	a: LonLat,
	b: LonLat
): void {
	const w = distM(a, b)
	if (w < 1e-4) {
		return
	}
	if (!adj.has(aKey)) {
		adj.set(aKey, [])
	}
	if (!adj.has(bKey)) {
		adj.set(bKey, [])
	}
	adj.get(aKey)?.push({ to: bKey, weightM: w, via: [a, b] })
	adj.get(bKey)?.push({ to: aKey, weightM: w, via: [b, a] })
}

/** Infer two orthogonal building axes from corridor segment bearings. */
function inferAxes(segments: CorridorNet['segments']): [LonLat, LonLat] {
	if (segments.length === 0) {
		return [
			[1, 0],
			[0, 1]
		]
	}
	const bearings: number[] = []
	for (const s of segments) {
		const dx = (s.b[0] - s.a[0]) * M_PER_DEG_LON
		const dy = (s.b[1] - s.a[1]) * M_PER_DEG_LAT
		if (Math.hypot(dx, dy) < 0.5) {
			continue
		}
		let ang = Math.atan2(dy, dx)
		ang = ((ang % Math.PI) + Math.PI) % Math.PI
		if (ang >= Math.PI / 2) {
			ang -= Math.PI / 2
		}
		bearings.push(ang)
	}
	if (bearings.length === 0) {
		return [
			[1, 0],
			[0, 1]
		]
	}
	bearings.sort((a, b) => a - b)
	const primary = bearings[Math.floor(bearings.length / 2)]
	const ax0: LonLat = [Math.cos(primary), Math.sin(primary)]
	const ax1: LonLat = [-Math.sin(primary), Math.cos(primary)]
	return [ax0, ax1]
}

export function buildCorridorNet(
	floor: string,
	features: CorridorFeature[]
): CorridorNet | null {
	const vertices = new Map<string, LonLat>()
	const adj = new Map<
		string,
		Array<{ to: string; weightM: number; via: LonLat[] }>
	>()
	const segments: CorridorNet['segments'] = []

	for (const ft of features) {
		const coords = ft.geometry?.coordinates
		if (coords == null || coords.length < 2) {
			continue
		}
		for (let i = 0; i < coords.length - 1; i++) {
			const a = roundCoord(coords[i] as LonLat)
			const b = roundCoord(coords[i + 1] as LonLat)
			const aKey = vKey(a)
			const bKey = vKey(b)
			vertices.set(aKey, a)
			vertices.set(bKey, b)
			addEdge(adj, aKey, bKey, a, b)
			segments.push({ a, b, aKey, bKey })
		}
	}

	if (segments.length === 0) {
		return null
	}
	return { floor, vertices, adj, segments, axes: inferAxes(segments) }
}

interface Snap {
	coord: LonLat
	enterKey: string
	tempKey?: string
	tempEdges?: Array<{ to: string; weightM: number; via: LonLat[] }>
	stub: LonLat[]
	costM: number
}

function projectOntoSegment(
	p: LonLat,
	a: LonLat,
	b: LonLat
): { foot: LonLat; t: number; dist: number } {
	return projectOnSegment(p, a, b)
}

/**
 * Attach an off-network point to the corridor.
 * @param directOnly If true, only use nearest projection / vertex (no Manhattan L).
 *   Use for doors on the room boundary so stubs do not zigzag back into the room.
 */
export function attachToCorridor(
	from: LonLat,
	net: CorridorNet,
	masks: WalkMask[],
	directOnly = false
): Snap {
	interface Cand {
		foot: LonLat
		seg: CorridorNet['segments'][0]
		stub: LonLat[]
		cost: number
		ortho: boolean
	}
	const cands: Cand[] = []

	const consider = (cand: Cand): void => {
		cands.push(cand)
	}

	for (const seg of net.segments) {
		const { foot, t, dist } = projectOntoSegment(from, seg.a, seg.b)
		const interior = t > 0.02 && t < 0.98
		if (directOnly || hasLineOfSight(from, foot, masks)) {
			consider({
				foot,
				seg,
				stub: [from, foot],
				cost: dist,
				ortho: interior
			})
		}

		if (!directOnly) {
			const man = manhattanStub(from, foot, net.axes, masks)
			if (man != null) {
				consider({ foot, seg, stub: man, cost: pathLen(man), ortho: true })
			}
		}
	}

	if (!directOnly) {
		for (const [, v] of net.vertices) {
			const man = manhattanStub(from, v, net.axes, masks)
			if (man == null) {
				continue
			}
			const seg =
				net.segments.find(
					(s) => distM(s.a, v) < 0.05 || distM(s.b, v) < 0.05
				) ?? net.segments[0]
			consider({
				foot: v,
				seg,
				stub: man,
				cost: pathLen(man),
				ortho: true
			})
		}
	}

	let best: Cand | null = null
	for (const cand of cands) {
		if (
			best == null ||
			cand.cost < best.cost - 1e-6 ||
			(Math.abs(cand.cost - best.cost) < 1e-6 && cand.ortho && !best.ortho)
		) {
			best = cand
		}
	}

	if (best == null) {
		let bestVert: {
			foot: LonLat
			seg: CorridorNet['segments'][0]
			dist: number
		} | null = null
		for (const seg of net.segments) {
			for (const v of [seg.a, seg.b]) {
				const d = distM(from, v)
				if (!directOnly && !hasLineOfSight(from, v, masks)) {
					continue
				}
				if (bestVert == null || d < bestVert.dist) {
					bestVert = { foot: v, seg, dist: d }
				}
			}
		}
		if (bestVert != null) {
			return snapOnSegment(from, bestVert.foot, bestVert.seg, bestVert.dist)
		}
		let nearest: {
			foot: LonLat
			seg: CorridorNet['segments'][0]
			dist: number
		} | null = null
		for (const seg of net.segments) {
			const { foot, dist } = projectOntoSegment(from, seg.a, seg.b)
			if (nearest == null || dist < nearest.dist) {
				nearest = { foot, seg, dist }
			}
		}
		if (nearest == null) {
			const [anyKey, anyCoord] = [...net.vertices.entries()][0]
			return {
				coord: anyCoord,
				enterKey: anyKey,
				stub: [from, anyCoord],
				costM: distM(from, anyCoord)
			}
		}
		return snapOnSegment(from, nearest.foot, nearest.seg, nearest.dist)
	}

	const snap = snapOnSegment(from, best.foot, best.seg, best.cost)
	snap.stub = best.stub
	return snap
}

function pathLen(coords: LonLat[]): number {
	return polylineLengthPlanarM(coords)
}

/** Two-leg stub along building axes (≈90° turns), if walkable. */
function manhattanStub(
	from: LonLat,
	target: LonLat,
	axes: [LonLat, LonLat],
	masks: WalkMask[]
): LonLat[] | null {
	if (distM(from, target) < 0.15) {
		return [from, target]
	}
	if (hasLineOfSight(from, target, masks)) {
		const [dx, dy] = xyAt(target, from)
		const [ax0x, ax0y] = axes[0]
		const [ax1x, ax1y] = axes[1]
		const len = Math.hypot(dx, dy) || 1
		const align0 = Math.abs((dx * ax0x + dy * ax0y) / len)
		const align1 = Math.abs((dx * ax1x + dy * ax1y) / len)
		if (align0 > 0.92 || align1 > 0.92) {
			return [from, target]
		}
	}

	const o = from
	const [tx, ty] = xyAt(target, o)
	const [ax0x, ax0y] = axes[0]
	const [ax1x, ax1y] = axes[1]
	const c0 = tx * ax0x + ty * ax0y
	const c1 = tx * ax1x + ty * ax1y
	const cornerA = lonLatFromXY([ax0x * c0, ax0y * c0], o)
	const cornerB = lonLatFromXY([ax1x * c1, ax1y * c1], o)

	const candidates: LonLat[][] = [
		[from, cornerA, target],
		[from, cornerB, target]
	]
	let best: LonLat[] | null = null
	let bestLen = Number.POSITIVE_INFINITY
	for (const path of candidates) {
		if (distM(path[0], path[1]) < 0.1 || distM(path[1], path[2]) < 0.1) {
			if (hasLineOfSight(from, target, masks)) {
				const p = [from, target]
				const len = pathLen(p)
				if (len < bestLen) {
					best = p
					bestLen = len
				}
			}
			continue
		}
		if (!hasLineOfSight(path[0], path[1], masks)) {
			continue
		}
		if (!hasLineOfSight(path[1], path[2], masks)) {
			continue
		}
		const len = pathLen(path)
		if (len < bestLen) {
			best = path
			bestLen = len
		}
	}
	return best
}

function snapOnSegment(
	from: LonLat,
	foot: LonLat,
	seg: CorridorNet['segments'][0],
	stubDist: number
): Snap {
	const footR = roundCoord(foot)
	const footKey = vKey(footR)
	if (footKey === seg.aKey || distM(footR, seg.a) < 0.05) {
		return {
			coord: seg.a,
			enterKey: seg.aKey,
			stub: [from, seg.a],
			costM: stubDist
		}
	}
	if (footKey === seg.bKey || distM(footR, seg.b) < 0.05) {
		return {
			coord: seg.b,
			enterKey: seg.bKey,
			stub: [from, seg.b],
			costM: stubDist
		}
	}
	const tempKey = `tmp:${footKey}`
	return {
		coord: footR,
		enterKey: tempKey,
		tempKey,
		tempEdges: [
			{ to: seg.aKey, weightM: distM(footR, seg.a), via: [footR, seg.a] },
			{ to: seg.bKey, weightM: distM(footR, seg.b), via: [footR, seg.b] }
		],
		stub: [from, footR],
		costM: stubDist
	}
}

function dijkstra(
	net: CorridorNet,
	startKey: string,
	endKey: string,
	extraAdj?: Map<string, Array<{ to: string; weightM: number; via: LonLat[] }>>
): LonLat[] | null {
	const getNeighbors = (
		key: string
	): Array<{ to: string; weightM: number; via: LonLat[] }> => {
		const base = net.adj.get(key) ?? []
		const extra = extraAdj?.get(key) ?? []
		return [...base, ...extra]
	}

	const dist = new Map<string, number>()
	const prev = new Map<string, { key: string; via: LonLat[] }>()
	const open = new Set<string>([startKey])
	dist.set(startKey, 0)

	while (open.size > 0) {
		let cur: string | null = null
		let best = Number.POSITIVE_INFINITY
		for (const k of open) {
			const d = dist.get(k) ?? Number.POSITIVE_INFINITY
			if (d < best) {
				best = d
				cur = k
			}
		}
		if (cur == null) {
			break
		}
		if (cur === endKey) {
			break
		}
		open.delete(cur)
		for (const e of getNeighbors(cur)) {
			const tentative = (dist.get(cur) ?? Number.POSITIVE_INFINITY) + e.weightM
			if (tentative < (dist.get(e.to) ?? Number.POSITIVE_INFINITY)) {
				dist.set(e.to, tentative)
				prev.set(e.to, { key: cur, via: e.via })
				open.add(e.to)
			}
		}
	}

	if (!prev.has(endKey) && startKey !== endKey) {
		return null
	}
	if (startKey === endKey) {
		const c = net.vertices.get(startKey)
		return c != null ? [c] : null
	}

	const chunks: LonLat[][] = []
	let cur = endKey
	while (cur !== startKey) {
		const step = prev.get(cur)
		if (step == null) {
			return null
		}
		chunks.push(step.via)
		cur = step.key
	}
	chunks.reverse()
	const out: LonLat[] = []
	for (const via of chunks) {
		for (const p of via) {
			const last = out[out.length - 1]
			if (last == null || distM(last, p) > 0.05) {
				out.push(p)
			}
		}
	}
	return out
}

/**
 * Route between two points using the indoor corridor path.
 * Stubs to/from the network prefer allowed 90° (orthogonal) lines.
 */
export function routeOnCorridor(
	from: LonLat,
	to: LonLat,
	net: CorridorNet,
	masks: WalkMask[],
	opts?: { directStubFrom?: boolean; directStubTo?: boolean }
): LonLat[] | null {
	if (distM(from, to) < 0.15) {
		return [from, to]
	}

	const snapA = attachToCorridor(
		from,
		net,
		masks,
		opts?.directStubFrom === true
	)
	const snapB = attachToCorridor(to, net, masks, opts?.directStubTo === true)

	const extra = new Map<
		string,
		Array<{ to: string; weightM: number; via: LonLat[] }>
	>()
	const registerTemp = (snap: Snap): void => {
		if (snap.tempKey == null || snap.tempEdges == null) {
			return
		}
		extra.set(snap.tempKey, snap.tempEdges)
		for (const e of snap.tempEdges) {
			if (!extra.has(e.to)) {
				extra.set(e.to, [])
			}
			extra.get(e.to)?.push({
				to: snap.tempKey,
				weightM: e.weightM,
				via: [...e.via].reverse()
			})
		}
	}
	registerTemp(snapA)
	registerTemp(snapB)

	const netPath = dijkstra(net, snapA.enterKey, snapB.enterKey, extra)
	if (netPath == null || netPath.length < 1) {
		if (hasLineOfSight(from, to, masks)) {
			return [from, to]
		}
		return null
	}

	const out: LonLat[] = []
	const append = (pts: LonLat[]): void => {
		appendDistinct(out, pts)
	}
	append(snapA.stub)
	append(netPath)
	append([...snapB.stub].reverse())
	if (out.length < 2) {
		return null
	}
	return masks.length > 0 ? stringPull(out, masks) : out
}

/** Flatten FeatureCollection corridors for a floor. */
export function corridorFeaturesFromFC(
	fc: GeoJSON.FeatureCollection | null | undefined
): CorridorFeature[] {
	if (fc?.features == null) {
		return []
	}
	return fc.features.filter(
		(f): f is CorridorFeature =>
			f != null &&
			f.geometry?.type === 'LineString' &&
			Array.isArray((f.geometry as GeoJSON.LineString).coordinates) &&
			(f.geometry as GeoJSON.LineString).coordinates.length >= 2
	)
}
