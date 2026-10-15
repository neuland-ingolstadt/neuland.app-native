import type { Map as MaplibreMap } from 'maplibre-gl'

/** Fire once after a programmatic camera move (moveend + duration fallback). */
export function runAfterMapCamera(
	map: MaplibreMap,
	durationMs: number,
	onComplete: () => void
): void {
	if (durationMs <= 0) {
		requestAnimationFrame(() => {
			onComplete()
		})
		return
	}
	let done = false
	const finish = () => {
		if (done) {
			return
		}
		done = true
		map.off('moveend', finish)
		clearTimeout(fallback)
		onComplete()
	}
	const fallback = setTimeout(finish, durationMs + 120)
	map.once('moveend', finish)
}

export function runAfterDuration(
	durationMs: number,
	onComplete: () => void
): void {
	if (durationMs <= 0) {
		requestAnimationFrame(() => {
			onComplete()
		})
		return
	}
	setTimeout(onComplete, durationMs)
}
