import type { FloorChange, FloorSegment, RouteResult } from './types'

/** One slot per segment index — change after leg `i`, if any. */
export function alignFloorChangesWithSegments(
	segmentCount: number,
	floorChanges: readonly (FloorChange | undefined)[]
): Array<FloorChange | undefined> {
	return Array.from({ length: segmentCount }, (_, i) => floorChanges[i])
}

export function finalizeRouteResult(
	result: Omit<RouteResult, 'floorChanges'> & {
		floorChanges: readonly (FloorChange | undefined)[]
	}
): RouteResult {
	return {
		...result,
		floorChanges: alignFloorChangesWithSegments(
			result.segments.length,
			result.floorChanges
		)
	}
}

export function floorChangeAfterLeg(
	result: RouteResult,
	legIndex: number
): FloorChange | undefined {
	return result.floorChanges[legIndex]
}

export function definedFloorChanges(
	floorChanges: readonly (FloorChange | undefined)[]
): FloorChange[] {
	return floorChanges.filter((c): c is FloorChange => c != null)
}

export function segmentFloorChangesForMerge(
	segments: FloorSegment[],
	floorChanges: readonly (FloorChange | undefined)[]
): Array<FloorChange | undefined> {
	return alignFloorChangesWithSegments(segments.length, floorChanges)
}
