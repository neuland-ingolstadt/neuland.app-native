import { describe, expect, it } from 'bun:test'
import {
	gridPath,
	snapToWalkable,
	stringPull,
	type WalkMask
} from '@/utils/indoor-nav/walkable'

const SQUARE: WalkMask = {
	type: 'Feature',
	properties: {},
	geometry: {
		type: 'Polygon',
		coordinates: [
			[
				[11.43, 48.76],
				[11.431, 48.76],
				[11.431, 48.761],
				[11.43, 48.761],
				[11.43, 48.76]
			]
		]
	}
}

describe('walkable helpers', () => {
	it('short-circuits string pulling without masks', () => {
		const path: Array<[number, number]> = [
			[0, 0],
			[0, 0],
			[1, 1]
		]
		// Identical endpoints collapse to a zero-length hop.
		expect(stringPull(path, [])).toEqual([
			[0, 0],
			[1, 1]
		])
		expect(stringPull([[5, 5]], [])).toEqual([[5, 5]])
		expect(
			stringPull(
				[
					[0, 0],
					[1, 1]
				],
				[]
			)
		).toEqual([
			[0, 0],
			[1, 1]
		])
	})

	it('pulls strings inside walkable masks', () => {
		const path: Array<[number, number]> = [
			[11.4301, 48.7601],
			[11.4302, 48.7602],
			[11.4309, 48.7609]
		]
		const pulled = stringPull(path, [SQUARE])
		expect(pulled[0]).toEqual(path[0])
		expect(pulled[pulled.length - 1]).toEqual(path[path.length - 1])
		expect(pulled.length).toBeLessThanOrEqual(path.length)
	})

	it('snaps coordinates onto walkable cells', () => {
		expect(snapToWalkable([11.4305, 48.7605], [SQUARE])).toEqual([
			11.4305, 48.7605
		])
		expect(snapToWalkable([12, 49], [SQUARE])).toBeNull()
	})

	it('returns null without masks and direct paths within them', () => {
		expect(gridPath([0, 0], [1, 1], [])).toBeNull()
		const direct = gridPath([11.4301, 48.7601], [11.4302, 48.7602], [SQUARE])
		expect(direct).toEqual([
			[11.4301, 48.7601],
			[11.4302, 48.7602]
		])
	})
})
