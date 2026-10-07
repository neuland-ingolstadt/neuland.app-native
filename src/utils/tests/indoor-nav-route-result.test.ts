import { describe, expect, it } from 'bun:test'
import {
	definedFloorChanges,
	finalizeRouteResult,
	floorChangeAfterLeg,
	segmentFloorChangesForMerge
} from '@/utils/indoor-nav/route-result'

describe('route-result', () => {
	it('aligns floorChanges length with segments', () => {
		const result = finalizeRouteResult({
			nodeIds: [],
			coords: [],
			floors: ['EG'],
			distanceM: 1,
			durationSec: 1,
			hops: [],
			segments: [
				{
					floor: 'EG',
					coords: [[0, 0]],
					distanceM: 1,
					durationSec: 1
				},
				{
					floor: '1',
					coords: [[0, 0]],
					distanceM: 0,
					durationSec: 0
				}
			],
			floorChanges: [
				{
					fromFloor: 'EG',
					toFloor: '1',
					at: [0, 0],
					viaFrom: 'a',
					viaTo: 'b',
					distanceM: 1,
					durationSec: 1
				}
			]
		})
		expect(result.floorChanges).toHaveLength(2)
		expect(result.floorChanges[0]?.fromFloor).toBe('EG')
		expect(result.floorChanges[1]).toBeUndefined()
	})

	it('reads and filters floor changes per leg', () => {
		const change = {
			fromFloor: 'EG',
			toFloor: '1',
			at: [0, 0] as [number, number],
			viaFrom: 'a',
			viaTo: 'b',
			distanceM: 1,
			durationSec: 1
		}
		const result = finalizeRouteResult({
			nodeIds: [],
			coords: [],
			floors: ['EG', '1'],
			distanceM: 1,
			durationSec: 1,
			hops: [],
			segments: [
				{
					floor: 'EG',
					coords: [[0, 0]],
					distanceM: 1,
					durationSec: 1
				}
			],
			floorChanges: [change, undefined]
		})
		expect(floorChangeAfterLeg(result, 0)).toEqual(change)
		expect(floorChangeAfterLeg(result, 1)).toBeUndefined()
		expect(definedFloorChanges(result.floorChanges)).toEqual([change])
		expect(definedFloorChanges([undefined])).toEqual([])
		expect(segmentFloorChangesForMerge(result.segments, [change])).toHaveLength(
			1
		)
	})
})
