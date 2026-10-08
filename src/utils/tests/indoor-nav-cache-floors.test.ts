import { describe, expect, it } from 'bun:test'
import {
	campusRouteCacheKey,
	clearCampusRouteCache,
	fullRouteCacheKey,
	getCachedCampusRoute,
	getCachedFullRoute
} from '@/utils/indoor-nav/campus-route-cache'
import { stairDirection } from '@/utils/indoor-nav/floors'
import type { RouteResult } from '@/utils/indoor-nav/types'

const RESULT: RouteResult = {
	nodeIds: [],
	coords: [],
	floors: ['EG'],
	distanceM: 1,
	durationSec: 1,
	hops: [],
	segments: [],
	floorChanges: []
}

describe('campus-route-cache', () => {
	it('builds keys that separate outdoor routing', () => {
		expect(campusRouteCacheKey('a', 'b', false)).toBe('a:b:no-out')
		expect(campusRouteCacheKey('a', 'b', true)).toBe('a:b:out')
		expect(campusRouteCacheKey('a', 'b', true)).not.toBe(
			campusRouteCacheKey('a', 'b', false)
		)
	})

	it('computes once and replays cached results', () => {
		clearCampusRouteCache()
		let calls = 0
		const compute = () => {
			calls += 1
			return RESULT
		}
		expect(getCachedCampusRoute('k', compute)).toBe(RESULT)
		expect(getCachedCampusRoute('k', compute)).toBe(RESULT)
		expect(calls).toBe(1)
	})

	it('caches null results too', () => {
		clearCampusRouteCache()
		let calls = 0
		const compute = () => {
			calls += 1
			return null
		}
		expect(getCachedCampusRoute('missing', compute)).toBeNull()
		expect(getCachedCampusRoute('missing', compute)).toBeNull()
		expect(calls).toBe(1)
		clearCampusRouteCache()
	})

	it('caches same-building full routes separately from campus routes', () => {
		clearCampusRouteCache()
		expect(fullRouteCacheKey('a', 'b')).toBe('full:a:b')
		let calls = 0
		const compute = () => {
			calls += 1
			return RESULT
		}
		const key = fullRouteCacheKey('a', 'b')
		expect(getCachedFullRoute(key, compute)).toBe(RESULT)
		expect(getCachedFullRoute(key, compute)).toBe(RESULT)
		expect(calls).toBe(1)
		clearCampusRouteCache()
	})

	it('evicts the oldest entry past capacity', () => {
		clearCampusRouteCache()
		for (let i = 0; i < 48; i++) {
			getCachedCampusRoute(`key-${i}`, () => RESULT)
		}
		let recomputed = 0
		getCachedCampusRoute('fresh', () => {
			recomputed += 1
			return RESULT
		})
		expect(recomputed).toBe(1)
		// The oldest key was evicted to make room.
		getCachedCampusRoute('key-0', () => {
			recomputed += 1
			return RESULT
		})
		expect(recomputed).toBe(2)
		clearCampusRouteCache()
	})
})

describe('indoor-nav floors', () => {
	it('resolves stair direction between floors', () => {
		expect(stairDirection('EG', '1')).toBe('up')
		expect(stairDirection('2', '1')).toBe('down')
		expect(stairDirection('EG', 'EG')).toBe('up')
		expect(stairDirection('EG', 'EG', 'down')).toBe('down')
		expect(stairDirection('1', '1', 'down')).toBe('down')
	})
})
