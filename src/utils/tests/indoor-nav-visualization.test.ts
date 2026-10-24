import { describe, expect, it } from 'bun:test'
import type { JourneyStep } from '@/utils/indoor-nav/journey-copy'
import {
	activeStairCodesForStep,
	routeProgressGeoJsonForFloor,
	stepProgressState
} from '@/utils/indoor-nav/journey-visualization'
import type {
	FloorChange,
	FloorSegment,
	RouteResult
} from '@/utils/indoor-nav/types'

function segment(overrides: Partial<FloorSegment> = {}): FloorSegment {
	return {
		floor: 'EG',
		coords: [
			[0, 0],
			[1, 1]
		],
		distanceM: 10,
		durationSec: 10,
		...overrides
	}
}

function walkStep(
	overrides: Partial<Extract<JourneyStep, { kind: 'walk' }>> = {}
): JourneyStep {
	return {
		kind: 'walk',
		floor: 'EG',
		legIndex: 0,
		distanceM: 10,
		durationSec: 10,
		segment: segment(),
		phase: 'follow',
		...overrides
	}
}

function stairsChange(overrides: Partial<FloorChange> = {}): FloorChange {
	return {
		fromFloor: 'EG',
		toFloor: '1',
		at: [0, 0],
		viaFrom: 'room:EG:T1',
		viaTo: 'room:1:T1',
		fromStairCode: 'T1',
		toStairCode: 'T1',
		distanceM: 5,
		durationSec: 30,
		...overrides
	}
}

function stairsStep(
	overrides: Partial<Extract<JourneyStep, { kind: 'stairs' }>> = {}
): JourneyStep {
	return {
		kind: 'stairs',
		floor: 'EG',
		afterLegIndex: 0,
		fromFloor: 'EG',
		toFloor: '1',
		viaFrom: 'room:EG:T1',
		viaTo: 'room:1:T1',
		distanceM: 5,
		durationSec: 30,
		change: stairsChange(),
		...overrides
	}
}

function routeResult(overrides: Partial<RouteResult> = {}): RouteResult {
	return {
		nodeIds: ['room:EG:G001'],
		coords: [[0, 0]],
		floors: ['EG'],
		distanceM: 10,
		durationSec: 10,
		hops: [],
		segments: [segment()],
		floorChanges: [undefined],
		...overrides
	}
}

describe('journey-visualization stair codes', () => {
	it('returns no stair codes without a step', () => {
		expect(activeStairCodesForStep(routeResult(), undefined, 'EG')).toEqual(
			new Set()
		)
	})

	it('returns no stair codes for a stairs step without change data', () => {
		const step = stairsStep({ change: undefined as never })
		expect(activeStairCodesForStep(routeResult(), step, 'EG')).toEqual(
			new Set()
		)
	})

	it('shows the from-staircase on the departure floor', () => {
		expect(activeStairCodesForStep(routeResult(), stairsStep(), 'EG')).toEqual(
			new Set(['T1'])
		)
	})

	it('shows the to-staircase on the arrival floor', () => {
		expect(activeStairCodesForStep(routeResult(), stairsStep(), '1')).toEqual(
			new Set(['T1'])
		)
	})

	it('hides staircase shafts on unrelated floors', () => {
		expect(activeStairCodesForStep(routeResult(), stairsStep(), '2')).toEqual(
			new Set()
		)
	})

	it('omits missing stair codes', () => {
		const step = stairsStep({
			change: stairsChange({ fromStairCode: undefined })
		})
		expect(activeStairCodesForStep(routeResult(), step, 'EG')).toEqual(
			new Set()
		)
	})

	it('previews the upcoming staircase while following a walk leg', () => {
		const steps: JourneyStep[] = [walkStep(), stairsStep()]
		const result = routeResult({ floorChanges: [stairsChange()] })
		expect(activeStairCodesForStep(result, steps[0], 'EG', steps, 0)).toEqual(
			new Set(['T1'])
		)
	})

	it('keeps the staircase visible right after leaving it', () => {
		const steps: JourneyStep[] = [stairsStep(), walkStep({ floor: '1' })]
		const result = routeResult()
		expect(activeStairCodesForStep(result, steps[1], '1', steps, 1)).toEqual(
			new Set(['T1'])
		)
	})

	it('returns no stair codes for walk steps outside the follow phase', () => {
		const steps: JourneyStep[] = [walkStep({ phase: 'enter' })]
		expect(
			activeStairCodesForStep(routeResult(), steps[0], 'EG', steps, 0)
		).toEqual(new Set())
	})

	it('returns no stair codes for arrival steps', () => {
		const arrival: JourneyStep = { kind: 'arrival', floor: 'EG', legIndex: 0 }
		expect(activeStairCodesForStep(routeResult(), arrival, 'EG')).toEqual(
			new Set()
		)
	})
})

describe('journey-visualization route progress', () => {
	it('classifies step positions relative to the current step', () => {
		expect(stepProgressState(0, 1)).toBe('done')
		expect(stepProgressState(1, 1)).toBe('current')
		expect(stepProgressState(2, 1)).toBe('todo')
	})

	it('returns an empty collection without steps', () => {
		expect(routeProgressGeoJsonForFloor([], 0, 'EG')).toEqual({
			type: 'FeatureCollection',
			features: []
		})
	})

	it('skips other floors, stairs steps and single-point segments', () => {
		const steps: JourneyStep[] = [
			walkStep({ floor: '1' }),
			stairsStep(),
			walkStep({ segment: segment({ coords: [[0, 0]] }) })
		]
		const fc = routeProgressGeoJsonForFloor(steps, 2, 'EG')
		expect(fc.features).toHaveLength(0)
	})

	it('only draws walked and current chunks, tagging their state', () => {
		const steps: JourneyStep[] = [
			walkStep({ legIndex: 0 }),
			walkStep({ legIndex: 1 }),
			walkStep({ legIndex: 2 })
		]
		const fc = routeProgressGeoJsonForFloor(steps, 1, 'EG')
		expect(fc.features).toHaveLength(2)
		expect(fc.features.map((f) => f.properties?.state)).toEqual([
			'done',
			'current'
		])
		expect(fc.features[0]?.properties).toMatchObject({
			floor: 'EG',
			legIndex: 0,
			stepIndex: 0
		})
	})

	it('clamps out-of-range step indexes', () => {
		const steps: JourneyStep[] = [walkStep()]
		const fc = routeProgressGeoJsonForFloor(steps, 99, 'EG')
		expect(fc.features).toHaveLength(1)
		expect(fc.features[0]?.properties?.state).toBe('current')
	})
})
