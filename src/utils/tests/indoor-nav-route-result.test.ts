import { describe, expect, it } from 'bun:test'
import { finalizeRouteResult } from '@/utils/indoor-nav/route-result'

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
})
