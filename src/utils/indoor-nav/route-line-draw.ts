import type { Feature, FeatureCollection, LineString, Position } from 'geojson'
import { haversineM } from './geometry'

export const ROUTE_DRAW_MS = 1100

type LonLat = [number, number]

export function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3
}

function haversineDeg(a: LonLat, b: LonLat): number {
	return haversineM(a, b)
}

export function cumulativeM(coords: LonLat[]): number[] {
	const cum: number[] = [0]
	for (let i = 1; i < coords.length; i++) {
		const prevCum = cum[i - 1] ?? 0
		const a = coords[i - 1]
		const b = coords[i]
		if (a == null || b == null) {
			continue
		}
		cum.push(prevCum + haversineDeg(a, b))
	}
	return cum
}

function pointAtDistance(
	coords: LonLat[],
	cum: number[],
	distM: number
): LonLat {
	if (coords.length === 0) {
		return [0, 0]
	}
	const total = cum[cum.length - 1] ?? 0
	const d = Math.max(0, Math.min(distM, total))
	if (coords.length === 1) {
		return coords[0] ?? [0, 0]
	}
	let i = 1
	while (i < cum.length - 1 && (cum[i] ?? 0) < d) {
		i++
	}
	const segLen = (cum[i] ?? 0) - (cum[i - 1] ?? 0)
	const t = segLen > 0 ? (d - (cum[i - 1] ?? 0)) / segLen : 0
	const a = coords[i - 1]
	const b = coords[i]
	if (a == null || b == null) {
		return [0, 0]
	}
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** First `distM` meters of the polyline (clamped). */
export function sliceByDistance(
	coords: LonLat[],
	cum: number[],
	distM: number
): LonLat[] {
	if (coords.length === 0) {
		return []
	}
	const total = cum[cum.length - 1] ?? 0
	if (distM >= total) {
		return coords
	}
	const first = coords[0]
	if (first == null) {
		return []
	}
	if (distM <= 0.01) {
		return [first]
	}
	const out: LonLat[] = [first]
	for (let i = 1; i < coords.length; i++) {
		const c = coords[i]
		if (c != null && (cum[i] ?? 0) <= distM) {
			out.push(c)
		} else {
			out.push(pointAtDistance(coords, cum, distM))
			break
		}
	}
	return out.length >= 2 ? out : [first, first]
}

function lineCoords(feature: Feature): LonLat[] {
	const geom = feature.geometry
	if (geom?.type !== 'LineString') {
		return []
	}
	return (geom as LineString).coordinates as LonLat[]
}

function stepIndexOf(feature: Feature): number {
	const raw = feature.properties?.stepIndex
	return typeof raw === 'number' ? raw : 0
}

function routeStateOf(feature: Feature): string | undefined {
	const raw = feature.properties?.state
	return typeof raw === 'string' ? raw : undefined
}

function clipFeatureLine(feature: Feature, progress: number): Feature | null {
	const coords = lineCoords(feature)
	if (coords.length < 2) {
		return null
	}
	if (progress >= 1) {
		return feature
	}
	const cum = cumulativeM(coords)
	const total = cum[cum.length - 1] ?? 0
	if (total <= 0) {
		return feature
	}
	const clipped = sliceByDistance(coords, cum, total * Math.max(0, progress))
	if (clipped.length < 2) {
		const start = coords[0]
		if (start == null) {
			return null
		}
		return {
			...feature,
			geometry: {
				type: 'LineString',
				coordinates: [start, start]
			}
		}
	}
	return {
		...feature,
		geometry: {
			type: 'LineString',
			coordinates: clipped as Position[]
		}
	}
}

/** Done legs stay fully drawn; only the active leg animates in. */
function clipRouteProgressByStepState(
	fc: FeatureCollection,
	progress: number
): FeatureCollection {
	const sorted = [...fc.features].sort(
		(a, b) => stepIndexOf(a) - stepIndexOf(b)
	)
	const out: Feature[] = []
	for (const feature of sorted) {
		const state = routeStateOf(feature)
		if (state === 'done') {
			if (lineCoords(feature).length >= 2) {
				out.push(feature)
			}
			continue
		}
		if (state === 'current') {
			const clipped = clipFeatureLine(feature, progress)
			if (clipped != null) {
				out.push(clipped)
			}
		}
	}
	return { type: 'FeatureCollection', features: out }
}

/**
 * Reveal progress for walk segments on one floor (0 = start dot, 1 = full).
 * When features are tagged done/current, completed legs stay visible while
 * only the current leg draws in.
 */
export function clipRouteProgressGeoJson(
	fc: FeatureCollection,
	progress: number
): FeatureCollection {
	if (progress >= 1) {
		return fc
	}
	if (fc.features.length === 0) {
		return fc
	}

	const hasStepStates = fc.features.some(
		(f) => routeStateOf(f) === 'done' || routeStateOf(f) === 'current'
	)
	if (hasStepStates) {
		return clipRouteProgressByStepState(fc, progress)
	}

	const sorted = [...fc.features].sort(
		(a, b) => stepIndexOf(a) - stepIndexOf(b)
	)
	const segments: {
		feature: Feature
		coords: LonLat[]
		cum: number[]
		len: number
		cumStart: number
	}[] = []
	let offset = 0
	for (const feature of sorted) {
		const coords = lineCoords(feature)
		if (coords.length < 2) {
			continue
		}
		const cum = cumulativeM(coords)
		const len = cum[cum.length - 1] ?? 0
		segments.push({
			feature,
			coords,
			cum,
			len,
			cumStart: offset
		})
		offset += len
	}

	if (segments.length === 0) {
		return fc
	}

	const total = offset
	if (total <= 0) {
		return fc
	}

	const target = total * Math.max(0, progress)
	const out: Feature[] = []

	for (const seg of segments) {
		const segEnd = seg.cumStart + seg.len
		if (target <= seg.cumStart) {
			continue
		}
		if (target >= segEnd) {
			out.push(seg.feature)
			continue
		}
		const localDist = target - seg.cumStart
		const clipped = sliceByDistance(seg.coords, seg.cum, localDist)
		out.push({
			...seg.feature,
			geometry: {
				type: 'LineString',
				coordinates: clipped as Position[]
			}
		})
	}

	if (out.length === 0 && progress <= 0) {
		const start = segments[0]?.coords[0]
		if (start != null) {
			out.push({
				type: 'Feature',
				properties: segments[0]?.feature.properties ?? {},
				geometry: {
					type: 'LineString',
					coordinates: [start, start]
				}
			})
		}
	}

	return { type: 'FeatureCollection', features: out }
}

function maxStepIndexWithState(fc: FeatureCollection, state: string): number {
	let max = -1
	for (const feature of fc.features) {
		if (feature.properties?.state === state) {
			max = Math.max(max, stepIndexOf(feature))
		}
	}
	return max
}

/** True while there is still path left to walk on this floor (not arrival / all done). */
export function shouldPlayRouteDrawAnimation(fc: FeatureCollection): boolean {
	if (fc.features.length === 0) {
		return false
	}
	return fc.features.some(
		(feature) =>
			feature.properties?.state === 'current' ||
			feature.properties?.state === 'todo'
	)
}

/**
 * Bump when the active step or floor view changes so the line can draw in again.
 * On arrival every chunk is `done` and there is no `current` — keep the last
 * walked step index so the key does not reset to 0 and replay the line.
 */
export function routeDrawAnimationKey(fc: FeatureCollection): string | null {
	if (fc.features.length === 0) {
		return null
	}
	const floor = String(fc.features[0]?.properties?.floor ?? '')
	let step = maxStepIndexWithState(fc, 'current')
	if (step < 0) {
		step = maxStepIndexWithState(fc, 'done')
	}
	if (step < 0) {
		step = 0
	}
	return `${floor}:${step}:${fc.features.length}`
}
