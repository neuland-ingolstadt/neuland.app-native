import { describe, expect, it } from 'bun:test'
import type { Map as MaplibreMap } from 'maplibre-gl'
import {
	runAfterDuration,
	runAfterMapCamera
} from '@/utils/indoor-nav/run-after-map-camera'

function fakeMap() {
	const handlers = new Map<string, Set<() => void>>()
	return {
		once: (event: string, cb: () => void) => {
			let set = handlers.get(event)
			if (set == null) {
				set = new Set()
				handlers.set(event, set)
			}
			set.add(cb)
		},
		off: (event: string, cb: () => void) => {
			handlers.get(event)?.delete(cb)
		},
		emit: (event: string) => {
			for (const cb of [...(handlers.get(event) ?? [])]) {
				cb()
			}
		}
	}
}

function asMaplibreMap(map: ReturnType<typeof fakeMap>): MaplibreMap {
	return map as unknown as MaplibreMap
}

describe('run-after-map-camera', () => {
	it('completes on the next frame for non-positive durations', async () => {
		const seen: string[] = []
		const raf = globalThis.requestAnimationFrame
		globalThis.requestAnimationFrame = ((cb: () => void) => {
			cb()
			return 0
		}) as unknown as typeof requestAnimationFrame
		try {
			runAfterMapCamera(asMaplibreMap(fakeMap()), 0, () => {
				seen.push('camera')
			})
			runAfterDuration(0, () => {
				seen.push('duration')
			})
			await new Promise((resolve) => setTimeout(resolve, 0))
		} finally {
			globalThis.requestAnimationFrame = raf
		}
		expect(seen).toEqual(['camera', 'duration'])
	})

	it('fires once on moveend and ignores later events', async () => {
		const map = fakeMap()
		let calls = 0
		runAfterMapCamera(asMaplibreMap(map), 1000, () => {
			calls += 1
		})
		// Simulate a duplicate delivery after off() (defensive done-guard).
		map.off = () => {}
		map.emit('moveend')
		map.emit('moveend')
		await new Promise((resolve) => setTimeout(resolve, 20))
		expect(calls).toBe(1)
	})

	it('falls back to the duration timeout without moveend', async () => {
		let calls = 0
		runAfterMapCamera(asMaplibreMap(fakeMap()), 10, () => {
			calls += 1
		})
		await new Promise((resolve) => setTimeout(resolve, 200))
		expect(calls).toBe(1)
	})

	it('runs after a positive duration', async () => {
		let calls = 0
		runAfterDuration(10, () => {
			calls += 1
		})
		await new Promise((resolve) => setTimeout(resolve, 50))
		expect(calls).toBe(1)
	})
})
