import { describe, expect, it } from 'bun:test'
import {
	boundsCenter,
	fitBoundsLngLatPair,
	fitBoundsNeSw,
	legBoundsCameraOptions,
	NAV_FLAT_CAMERA_EASING,
	stairEnterCameraStop,
	stairExitFlatEaseStop
} from '@/utils/indoor-nav/nav-camera'
import {
	flatMapCameraDuration,
	isCompactMapViewport,
	navMapCameraDuration,
	NAV_FLAT_CAMERA_EASING as STAIR_EASING,
	STAIR_MOMENT_CAMERA,
	boundsCenter as stairBoundsCenter,
	stairMomentCameraStop
} from '@/utils/indoor-nav/stair-moment-camera'
import type { FitBounds } from '@/utils/indoor-nav/types'

const BOUNDS: FitBounds = {
	southWest: [11.43, 48.76],
	northEast: [11.45, 48.78]
}

describe('stair-moment-camera', () => {
	it('keeps camera easing on reduced motion with a shorter duration', () => {
		expect(navMapCameraDuration(false, 1000)).toBe(1000)
		expect(navMapCameraDuration(true, 1000)).toBe(
			STAIR_MOMENT_CAMERA.reducedMotionDurationMs
		)
		expect(flatMapCameraDuration(false)).not.toBe(flatMapCameraDuration(true))
		expect(flatMapCameraDuration(true)).toBe(
			STAIR_MOMENT_CAMERA.reducedMotionDurationMs
		)
	})

	it('detects compact viewports', () => {
		expect(isCompactMapViewport(800)).toBe(true)
		expect(isCompactMapViewport(STAIR_MOMENT_CAMERA.compactMaxWidth)).toBe(true)
		expect(isCompactMapViewport(1200)).toBe(false)
	})

	it('builds pitched stair camera stops', () => {
		const wide = stairMomentCameraStop([11.44, 48.77], false, false)
		expect(wide).toMatchObject({
			center: [11.44, 48.77],
			zoom: STAIR_MOMENT_CAMERA.zoom,
			pitch: STAIR_MOMENT_CAMERA.pitch,
			bearing: STAIR_MOMENT_CAMERA.bearing,
			duration: STAIR_MOMENT_CAMERA.durationMs
		})
		const compact = stairMomentCameraStop([11.44, 48.77], true, true)
		expect(compact.zoom).toBe(STAIR_MOMENT_CAMERA.zoomCompact)
		expect(compact.pitch).toBe(STAIR_MOMENT_CAMERA.pitchCompact)
		expect(compact.duration).toBe(STAIR_MOMENT_CAMERA.reducedMotionDurationMs)
	})

	it('centers bounds', () => {
		const center = boundsCenter(BOUNDS)
		expect(center[0]).toBeCloseTo(11.44, 5)
		expect(center[1]).toBeCloseTo(48.77, 5)
		expect(stairBoundsCenter(BOUNDS)).toEqual(center)
		expect(STAIR_EASING).toBe('ease')
	})
})

describe('nav-camera', () => {
	it('re-exports shared camera primitives', () => {
		expect(NAV_FLAT_CAMERA_EASING).toBe('ease')
		const center = boundsCenter(BOUNDS)
		expect(center[0]).toBeCloseTo(11.44, 5)
		expect(center[1]).toBeCloseTo(48.77, 5)
	})

	it('builds a stair-enter stop with the fly curve', () => {
		const stop = stairEnterCameraStop([11.44, 48.77], false, false)
		expect(stop.curve).toBe(STAIR_MOMENT_CAMERA.flyCurve)
		expect(stop.center).toEqual([11.44, 48.77])
		expect(stop.pitch).toBe(STAIR_MOMENT_CAMERA.pitch)
	})

	it('converts bounds to coordinate pairs', () => {
		expect(fitBoundsLngLatPair(BOUNDS)).toEqual([
			[11.43, 48.76],
			[11.45, 48.78]
		])
		expect(fitBoundsNeSw(BOUNDS)).toEqual([11.43, 48.76, 11.45, 48.78])
	})

	it('builds flat leg camera options', () => {
		const animated = legBoundsCameraOptions(false)
		expect(animated).toMatchObject({
			duration: STAIR_MOMENT_CAMERA.legDurationMs,
			pitch: 0,
			bearing: 0,
			easing: 'ease'
		})
		expect(legBoundsCameraOptions(true).duration).toBe(
			STAIR_MOMENT_CAMERA.reducedMotionDurationMs
		)
	})

	it('builds a flat ease stop when leaving stairs', () => {
		const stop = stairExitFlatEaseStop(BOUNDS, false)
		expect(stop.center[0]).toBeCloseTo(11.44, 5)
		expect(stop.center[1]).toBeCloseTo(48.77, 5)
		expect(stop).toMatchObject({
			zoom: STAIR_MOMENT_CAMERA.exitLegZoom,
			pitch: 0,
			bearing: 0,
			duration: STAIR_MOMENT_CAMERA.legDurationMs
		})
		expect(stairExitFlatEaseStop(BOUNDS, true).duration).toBe(
			STAIR_MOMENT_CAMERA.reducedMotionDurationMs
		)
	})
})
