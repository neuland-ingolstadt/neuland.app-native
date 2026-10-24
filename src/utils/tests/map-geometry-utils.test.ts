import { describe, expect, it } from 'bun:test'
import { INGOLSTADT_CENTER } from '@/utils/map-constants'
import {
	closestPointsBetweenRings,
	getCenter,
	getCenterSingle,
	getHaversineDistanceMeters,
	getPolygonArea,
	isPointInPolygonRing,
	nearestPointOnPolygonRing,
	routeWithinPolygonRing
} from '@/utils/map-geometry-utils'

const SQUARE = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1],
	[0, 0]
]

describe('map-geometry centers and areas', () => {
	it('centers rooms by bounding box', () => {
		expect(
			getCenter([
				[
					[
						[0, 0],
						[2, 0],
						[2, 2],
						[0, 2],
						[0, 0]
					]
				]
			])
		).toEqual([1, 1])
		expect(getCenter([])).toEqual(INGOLSTADT_CENTER)
	})

	it('centers a single coordinate set with fallbacks', () => {
		expect(getCenterSingle(undefined)).toEqual(INGOLSTADT_CENTER)
		expect(getCenterSingle([])).toEqual(INGOLSTADT_CENTER)
		expect(getCenterSingle([[]])).toEqual(INGOLSTADT_CENTER)
		expect(
			getCenterSingle([
				[
					[0, 0],
					[2, 2]
				]
			])
		).toEqual([1, 1])
	})

	it('measures polygon areas', () => {
		expect(getPolygonArea([SQUARE])).toBe(1)
		expect(getPolygonArea(undefined)).toBe(0)
		expect(
			getPolygonArea([
				[
					[0, 0],
					[1, 1]
				]
			])
		).toBe(0)
		expect(
			getPolygonArea([
				[[0, 0], ['a', 1] as unknown as [number, number], [1, 1], [0, 0]]
			])
		).toBe(0)
	})

	it('measures haversine distances', () => {
		expect(getHaversineDistanceMeters([0, 0], [0, 0])).toBe(0)
		expect(
			getHaversineDistanceMeters([11.43, 48.76], [11.44, 48.77])
		).toBeGreaterThan(1000)
	})
})

describe('map-geometry ring predicates', () => {
	it('tests points against closed and open rings', () => {
		expect(isPointInPolygonRing([0.5, 0.5], SQUARE)).toBe(true)
		expect(isPointInPolygonRing([2, 2], SQUARE)).toBe(false)
		expect(
			isPointInPolygonRing(
				[0.5, 0.5],
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1]
				]
			)
		).toBe(true)
		expect(
			isPointInPolygonRing(
				[0.5, 0.5],
				[
					[0, 0],
					[1, 1]
				]
			)
		).toBe(false)
	})

	it('snaps points onto ring boundaries', () => {
		expect(nearestPointOnPolygonRing([0.5, 2], SQUARE)).toEqual([0.5, 1])
		expect(nearestPointOnPolygonRing([0.5, 0.1], SQUARE)).toEqual([0.5, 0])
		expect(nearestPointOnPolygonRing([3, 4], [])).toEqual([3, 4])
		expect(nearestPointOnPolygonRing([3, 4], [[5, 5]])).toEqual([5, 5])
		// Degenerate zero-length segment clamps to its start.
		expect(
			nearestPointOnPolygonRing(
				[0, 1],
				[
					[0, 0],
					[0, 0],
					[2, 0]
				]
			)
		).toEqual([0, 0])
	})
})

describe('map-geometry ring pairs and routing', () => {
	const rightOfSquare = [
		[1, 0],
		[2, 0],
		[2, 1],
		[1, 1],
		[1, 0]
	]

	it('finds the closest points between rings', () => {
		const [a, b] = closestPointsBetweenRings(SQUARE, rightOfSquare)
		expect(getHaversineDistanceMeters(a, b)).toBeLessThan(1)
		expect(a[0]).toBeCloseTo(1, 5)
		const [c, d] = closestPointsBetweenRings(
			SQUARE,
			rightOfSquare.map(([x, y]) => [x + 10, y])
		)
		expect(getHaversineDistanceMeters(c, d)).toBeGreaterThan(1000)
		expect(closestPointsBetweenRings([], SQUARE)).toEqual([
			[0, 0],
			[0, 0]
		])
		expect(closestPointsBetweenRings(SQUARE, [])[0][0]).toBeCloseTo(0, 5)
	})

	it('lets either ring win the closest pair', () => {
		const wide = [
			[0, 0],
			[10, 0],
			[10, 1],
			[0, 1],
			[0, 0]
		]
		const small = [
			[4.9, 0.4],
			[5.1, 0.4],
			[5.1, 0.6],
			[4.9, 0.6],
			[4.9, 0.4]
		]
		// The small square hugs the wide ring's edge: its vertices are
		// closer than any wide-ring vertex, so the second scan wins.
		const [a, b] = closestPointsBetweenRings(wide, small)
		expect(getHaversineDistanceMeters(a, b)).toBeLessThan(
			getHaversineDistanceMeters([0, 0], [4.9, 0.4])
		)
		expect(b[0]).toBeCloseTo(4.9, 1)
	})

	it('routes along the shorter way around a ring', () => {
		const path = routeWithinPolygonRing(SQUARE, [-1, 0.5], [2, 0.5])
		expect(path[0]).toEqual([-1, 0.5])
		expect(path[path.length - 1]).toEqual([2, 0.5])
		expect(path.length).toBeGreaterThan(2)
		// Every intermediate point sits on the square boundary.
		for (const [x, y] of path.slice(1, -1)) {
			const onBoundary = x === 0 || x === 1 || y === 0 || y === 1
			expect(onBoundary).toBe(true)
		}
	})

	it('short-circuits degenerate routes', () => {
		expect(routeWithinPolygonRing([[0, 0]], [1, 1], [2, 2])).toEqual([
			[1, 1],
			[2, 2]
		])
		// Both endpoints snap to the same boundary point.
		expect(routeWithinPolygonRing(SQUARE, [-1, 0.5], [-0.5, 0.5])).toEqual([
			[-1, 0.5],
			[-0.5, 0.5]
		])
	})
})
