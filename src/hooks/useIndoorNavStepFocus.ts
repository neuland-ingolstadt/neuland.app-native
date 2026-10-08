import type { JourneyStep } from '@/utils/indoor-nav'
import { bboxOfCoords } from '@/utils/indoor-nav'
import { OUTDOOR_FLOOR } from '@/utils/indoor-nav/campus-route'
import type { IndoorNavModel } from './useIndoorNavigation'

export const STEP_FIT_MARGIN_M = 8

export function stepFloor(step: JourneyStep): string {
	if (step.kind === 'stairs') {
		return step.fromFloor
	}
	if (step.kind === 'arrival') {
		return step.floor
	}
	return step.segment.floor
}

export function boundsForJourneyStep(
	step: JourneyStep,
	routeResult: IndoorNavModel['routeResult']
) {
	const coords =
		step.kind === 'walk' && step.phase != null
			? step.segment.coords
			: step.kind === 'walk' || step.kind === 'arrival'
				? (routeResult?.segments[step.legIndex]?.coords ?? [])
				: []
	const margin =
		step.kind === 'walk' && step.floor === OUTDOOR_FLOOR
			? 28
			: STEP_FIT_MARGIN_M
	return bboxOfCoords(coords, margin)
}
