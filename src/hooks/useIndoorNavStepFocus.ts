import type { JourneyStep } from '@/utils/indoor-nav'
import { bboxOfCoords } from '@/utils/indoor-nav'
import type { IndoorNavModel } from './useIndoorNavigation'

const STEP_FIT_MARGIN_M = 8

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
	return bboxOfCoords(coords, STEP_FIT_MARGIN_M)
}
