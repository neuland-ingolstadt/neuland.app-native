import { MAP_CAMERA } from '@/utils/map-constants'
import type { FitBounds, LonLat } from './types'

export const STAIR_MOMENT_CAMERA = {
	pitch: 56,
	pitchCompact: 52,
	bearing: -28,
	zoom: MAP_CAMERA.maxZoom,
	zoomCompact: MAP_CAMERA.maxZoom,
	maxZoom: MAP_CAMERA.maxZoom,
	/** Pitched fly-in at a stairs step. */
	durationMs: 1050,
	/** Flat leg fitBounds / fly-out after stairs. */
	legDurationMs: 720,
	/** Match MAP_CAMERA.maxZoom so native Camera maxZoom can drop after the stair moment. */
	exitLegZoom: MAP_CAMERA.maxZoom,
	flyCurve: 1.38,
	cutawayRevealDelayMs: 300,
	cutawayHideDelayMs: 220,
	maxZoomHoldAfterExitMs: 120,
	compactMaxWidth: 900,
	/** Map camera still eases when system reduced motion is on (not instant). */
	reducedMotionDurationMs: 520
} as const

export function navMapCameraDuration(
	reducedMotion: boolean,
	fullMs: number
): number {
	return reducedMotion ? STAIR_MOMENT_CAMERA.reducedMotionDurationMs : fullMs
}

export function isCompactMapViewport(width: number): boolean {
	return width <= STAIR_MOMENT_CAMERA.compactMaxWidth
}

export function stairMomentCameraStop(
	at: LonLat,
	compact: boolean,
	reducedMotion: boolean
): {
	center: LonLat
	zoom: number
	pitch: number
	bearing: number
	duration: number
} {
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
		)
	}
}

export function flatMapCameraDuration(reducedMotion: boolean): number {
	return navMapCameraDuration(reducedMotion, MAP_CAMERA.focusDuration)
}

export function boundsCenter(bounds: FitBounds): LonLat {
	return [
		(bounds.southWest[0] + bounds.northEast[0]) / 2,
		(bounds.southWest[1] + bounds.northEast[1]) / 2
	]
}

/** MapLibre RN defaults fitBounds easing to `fly` — use `ease` for walk legs. */
export const NAV_FLAT_CAMERA_EASING = 'ease' as const
