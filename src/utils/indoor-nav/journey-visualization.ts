import { OUTDOOR_FLOOR } from './campus-route'
import { stairDirection } from './floors'
import type { JourneyStep } from './journey-copy'
import type { RouteResult } from './types'

function isStairsUp(fromFloor: string, toFloor: string): boolean {
	return stairDirection(fromFloor, toFloor, 'down') === 'up'
}

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
		const change = step.change
		if (change == null) {
			return new Set()
		}
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
		const state = stepProgressState(i, safe)
		// Only draw where you've been and the active leg — not the full future path.
		if (state === 'todo') {
			return
		}
		features.push({
			type: 'Feature',
			properties: {
				state,
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
 * Entry / exit / staircase / destination markers for one floor, each tagged
 * with done/current/todo relative to the active step — so the map shows which
 * staircase or entry lies before or after the current step.
 *
 * Cross-campus routes concatenate indoor → outdoor → indoor legs. Every
 * indoor leg that starts at an entrance (destination building after the
 * outdoor walk) and every indoor leg that ends at an entrance (source building
 * exit before the outdoor walk) gets a door marker, plus both ends of the
 * outdoor leg when viewing the campus floor. Stair markers are
 * direction-aware so going down shows a down arrow.
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
	const legFirstWalkStep = new Map<number, number>()
	const legLastWalkStep = new Map<number, number>()
	steps.forEach((step, i) => {
		if (step.kind === 'stairs') {
			if (!stairsStepIndex.has(step.afterLegIndex)) {
				stairsStepIndex.set(step.afterLegIndex, i)
			}
		}
		if (step.kind === 'walk') {
			if (!legFirstWalkStep.has(step.legIndex)) {
				legFirstWalkStep.set(step.legIndex, i)
			}
			legLastWalkStep.set(step.legIndex, i)
		}
	})

	const firstSeg = result.segments[0]
	if (
		firstSeg != null &&
		firstSeg.floor === floor &&
		firstSeg.floor !== OUTDOOR_FLOOR &&
		result.nodeIds[0]?.startsWith('room:')
	) {
		const at = firstSeg.coords[0]
		if (at != null) {
			const markerIndex = legFirstWalkStep.get(0) ?? 0
			features.push({
				type: 'Feature',
				properties: {
					kind: 'start',
					state: stepProgressState(markerIndex, safe),
					floor
				},
				geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
			})
		}
	}

	for (let i = 0; i < result.segments.length; i++) {
		const seg = result.segments[i]
		if (seg == null) {
			continue
		}
		if (seg.floor === OUTDOOR_FLOOR) {
			if (floor !== OUTDOOR_FLOOR) {
				continue
			}
			const markerIndex = legFirstWalkStep.get(i) ?? -1
			const state =
				markerIndex < 0 ? 'todo' : stepProgressState(markerIndex, safe)
			const start = seg.coords[0]
			if (start != null) {
				features.push({
					type: 'Feature',
					properties: {
						kind: 'exit',
						state,
						floor
					},
					geometry: { type: 'Point', coordinates: start as GeoJSON.Position }
				})
			}
			if (seg.coords.length > 1) {
				const end = seg.coords[seg.coords.length - 1]
				if (end != null) {
					features.push({
						type: 'Feature',
						properties: {
							kind: 'entry',
							state,
							floor
						},
						geometry: { type: 'Point', coordinates: end as GeoJSON.Position }
					})
				}
			}
			continue
		}
		if (seg.floor !== floor) {
			continue
		}
		if (seg.startNodeId?.startsWith('entrance:')) {
			const at = seg.coords[0]
			if (at != null) {
				const markerIndex = legFirstWalkStep.get(i) ?? 0
				features.push({
					type: 'Feature',
					properties: {
						kind: 'entry',
						state: stepProgressState(markerIndex, safe),
						floor
					},
					geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
				})
			}
		}
		if (seg.endNodeId?.startsWith('entrance:')) {
			const at = seg.coords[seg.coords.length - 1]
			if (at != null) {
				const markerIndex = legLastWalkStep.get(i) ?? 0
				// Skip a duplicate when a single-coord entrance→entrance leg
				// already emitted its start marker at the same position.
				const start = seg.coords[0]
				const isDuplicate =
					seg.startNodeId?.startsWith('entrance:') &&
					start != null &&
					start[0] === at[0] &&
					start[1] === at[1]
				if (!isDuplicate) {
					features.push({
						type: 'Feature',
						properties: {
							kind: 'exit',
							state: stepProgressState(markerIndex, safe),
							floor
						},
						geometry: { type: 'Point', coordinates: at as GeoJSON.Position }
					})
				}
			}
		}
	}

	result.floorChanges.forEach((change, j) => {
		if (change == null) {
			return
		}
		const markerIndex = stairsStepIndex.get(j) ?? -1
		const state =
			markerIndex < 0 ? 'todo' : stepProgressState(markerIndex, safe)
		const up = isStairsUp(change.fromFloor, change.toFloor)
		if (change.fromFloor === floor) {
			features.push({
				type: 'Feature',
				properties: {
					kind: up ? 'stairs_up' : 'stairs_down',
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
					kind: up ? 'stairs_arrive_up' : 'stairs_arrive_down',
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
