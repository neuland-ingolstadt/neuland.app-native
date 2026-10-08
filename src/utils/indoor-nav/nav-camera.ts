import {
	boundsCenter,
	NAV_FLAT_CAMERA_EASING,
	navMapCameraDuration,
	STAIR_MOMENT_CAMERA,
	stairMomentCameraStop
} from './stair-moment-camera'
import type { FitBounds, LonLat } from './types'

export { boundsCenter, NAV_FLAT_CAMERA_EASING }

export type NavStairsPhase = 'idle' | 'entering' | 'cutaway' | 'flat'

export type NavCameraCommand =
	| { kind: 'stair-enter'; at: LonLat }
	| {
			kind: 'leg-bounds'
			bounds: FitBounds
			/** POC-style fly-out after leaving a stairs step (native: easeTo flat). */
			resetFromStairs?: boolean
	  }

export function stairEnterCameraStop(
	at: LonLat,
	compact: boolean,
	reducedMotion: boolean
) {
	return {
		...stairMomentCameraStop(at, compact, reducedMotion),
		curve: STAIR_MOMENT_CAMERA.flyCurve
	}
}

export function fitBoundsLngLatPair(
	bounds: FitBounds
): [[number, number], [number, number]] {
	return [
		[bounds.southWest[0], bounds.southWest[1]],
		[bounds.northEast[0], bounds.northEast[1]]
	]
}

export function fitBoundsNeSw(
	bounds: FitBounds
): [number, number, number, number] {
	return [
		bounds.southWest[0],
		bounds.southWest[1],
		bounds.northEast[0],
		bounds.northEast[1]
	]
}

export function legBoundsCameraOptions(reducedMotion: boolean) {
	return {
		duration: navMapCameraDuration(
			reducedMotion,
			STAIR_MOMENT_CAMERA.legDurationMs
		),
		pitch: 0,
		bearing: 0,
		easing: NAV_FLAT_CAMERA_EASING
	}
}

export function stairExitFlatEaseStop(
	bounds: FitBounds,
	reducedMotion: boolean
) {
	return {
		center: boundsCenter(bounds),
		zoom: STAIR_MOMENT_CAMERA.exitLegZoom,
		pitch: 0,
		bearing: 0,
		duration: navMapCameraDuration(
			reducedMotion,
			STAIR_MOMENT_CAMERA.legDurationMs
		)
	}
}
