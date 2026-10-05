import type { JourneyStep } from './journey-copy'
import type { RouteResult } from './types'

/** Stair room codes to draw on `floor` for the active journey step (empty = hide). */
export function activeStairCodesForStep(
	result: RouteResult,
	step: JourneyStep | undefined,
	floor: string,
	steps?: JourneyStep[],
	stepIndex?: number
): Set<string> {
	if (step == null) {
		return new Set()
	}
	if (step.kind === 'stairs') {
		const { change } = step
		if (step.fromFloor === floor && change.fromStairCode != null) {
			return new Set([change.fromStairCode])
		}
		if (step.toFloor === floor && change.toStairCode != null) {
			return new Set([change.toStairCode])
		}
		return new Set()
	}
	if (step.kind === 'walk') {
		if (
			step.phase === 'follow' &&
			step.floor === floor &&
			steps != null &&
			stepIndex != null
		) {
			const next = steps[stepIndex + 1]
			if (next?.kind === 'stairs') {
				const change = result.floorChanges[step.legIndex]
				if (change?.fromStairCode != null && change.fromFloor === floor) {
					return new Set([change.fromStairCode])
				}
			}
			const prev = steps[stepIndex - 1]
			if (prev?.kind === 'stairs') {
				const change = prev.change
				if (change.toStairCode != null && change.toFloor === floor) {
					return new Set([change.toStairCode])
				}
			}
		}
	}
	return new Set()
}

/** Progress state of a route chunk or marker relative to the current step. */
export type StepProgressState = 'done' | 'current' | 'todo'

export function stepProgressState(
	stepPosition: number,
	currentPosition: number
): StepProgressState {
	if (stepPosition < currentPosition) {
		return 'done'
	}
	if (stepPosition === currentPosition) {
		return 'current'
	}
	return 'todo'
}

/**
 * Per-chunk route lines for one floor, each tagged with done/current/todo
 * relative to the active step. Lets the map render walked path, the current
 * chunk (entry / way / stairs approach) and the remaining path differently.
 */
export function routeProgressGeoJsonForFloor(
	steps: JourneyStep[],
	stepIndex: number,
	floor: string
): GeoJSON.FeatureCollection {
	const safe =
		steps.length > 0 ? Math.max(0, Math.min(stepIndex, steps.length - 1)) : 0
	const features: GeoJSON.Feature[] = []
	steps.forEach((step, i) => {
		if (step.kind !== 'walk' || step.floor !== floor) {
			return
		}
		if (step.segment.coords.length < 2) {
			return
		}
		features.push({
			type: 'Feature',
			properties: {
				state: stepProgressState(i, safe),
				floor,
				legIndex: step.legIndex,
				phase: step.phase ?? 'walk',
				stepIndex: i
			},
			geometry: {
				type: 'LineString',
				coordinates: step.segment.coords as GeoJSON.Position[]
			}
		})
	})
	return { type: 'FeatureCollection', features }
}

/**
 * Entry / staircase / destination markers for one floor, each tagged with
 * done/current/todo relative to the active step — so the map shows which
 * staircase or entry lies before or after the current step.
 */
export function stepMarkersGeoJsonForFloor(
	result: RouteResult,
	steps: JourneyStep[],
	stepIndex: number,
	floor: string
): GeoJSON.FeatureCollection {
	const safe =
		steps.length > 0 ? Math.max(0, Math.min(stepIndex, steps.length - 1)) : 0
	const features: GeoJSON.Feature[] = []
	const stairsStepIndex = new Map<number, number>()
	steps.forEach((step, i) => {
		if (step.kind === 'stairs') {
			if (!stairsStepIndex.has(step.afterLegIndex)) {
				stairsStepIndex.set(step.afterLegIndex, i)
			}
		}
	})

	const firstSeg = result.segments[0]
	if (
		firstSeg != null &&
		firstSeg.floor === floor &&
		result.nodeIds[0]?.startsWith('entrance:')
	) {
		const at = firstSeg.coords[0]
		if (at != null) {
			features.push({
				type: 'Feature',
				properties: {
					kind: 'entry',
					state: stepProgressState(0, safe),
					floor
				},
				geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
			})
		}
	}

	result.floorChanges.forEach((change, j) => {
		const markerIndex = stairsStepIndex.get(j) ?? -1
		const state =
			markerIndex < 0 ? 'todo' : stepProgressState(markerIndex, safe)
		if (change.fromFloor === floor) {
			features.push({
				type: 'Feature',
				properties: {
					kind: 'stairs_up',
					state,
					toFloor: change.toFloor,
					floor
				},
				geometry: { type: 'Point', coordinates: change.at as GeoJSON.Position }
			})
		}
		if (change.toFloor === floor) {
			const seg = result.segments[j + 1]
			const at = seg?.coords[0] ?? change.at
			features.push({
				type: 'Feature',
				properties: {
					kind: 'stairs_arrive',
					state,
					fromFloor: change.fromFloor,
					floor
				},
				geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
			})
		}
	})

	const lastSeg = result.segments[result.segments.length - 1]
	if (
		lastSeg != null &&
		lastSeg.floor === floor &&
		result.nodeIds[result.nodeIds.length - 1]?.startsWith('room:')
	) {
		const at = lastSeg.coords[lastSeg.coords.length - 1]
		if (at != null) {
			features.push({
				type: 'Feature',
				properties: {
					kind: 'destination',
					state: safe >= steps.length - 1 ? 'current' : 'todo',
					floor
				},
				geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
			})
		}
	}

	return { type: 'FeatureCollection', features }
}
