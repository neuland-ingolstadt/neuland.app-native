import { MAP_CAMERA } from '@/utils/map-constants'
import {
	navMapCameraDuration,
	STAIR_MOMENT_CAMERA
} from './stair-moment-camera'
import type { FitBounds, LonLat } from './types'

export type NavStairsPhase = 'idle' | 'entering' | 'cutaway' | 'flat'

export type NavCameraCommand =
	| { kind: 'stair-enter'; at: LonLat }
	| {
			kind: 'leg-bounds'
			bounds: FitBounds
			/** POC-style fly-out after leaving a stairs step (native: easeTo flat). */
			resetFromStairs?: boolean
	  }
	| { kind: 'exit-focus'; at: LonLat }

export const NAV_FLAT_CAMERA_EASING = 'ease' as const

export function boundsCenter(bounds: FitBounds): LonLat {
	return [
		(bounds.southWest[0] + bounds.northEast[0]) / 2,
		(bounds.southWest[1] + bounds.northEast[1]) / 2
	]
}

export function stairEnterCameraStop(
	at: LonLat,
	compact: boolean,
	reducedMotion: boolean
) {
	return {
		center: at,
		zoom: compact ? STAIR_MOMENT_CAMERA.zoomCompact : STAIR_MOMENT_CAMERA.zoom,
		pitch: compact
			? STAIR_MOMENT_CAMERA.pitchCompact
			: STAIR_MOMENT_CAMERA.pitch,
		bearing: STAIR_MOMENT_CAMERA.bearing,
		duration: navMapCameraDuration(
			reducedMotion,
			STAIR_MOMENT_CAMERA.durationMs
		),
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

/**
 * Ease back out to the default room-selection depth when navigation ends
 * (instead of staying at the close-up step framing).
 */
export function navExitFocusStop(at: LonLat, reducedMotion: boolean) {
	return {
		center: at,
		zoom: MAP_CAMERA.focusZoom,
		pitch: 0,
		bearing: 0,
		duration: navMapCameraDuration(
			reducedMotion,
			STAIR_MOMENT_CAMERA.legDurationMs
		)
	}
}
