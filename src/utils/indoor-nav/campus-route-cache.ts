import type { RouteResult } from './types'

const CACHE_MAX = 48
const cache = new Map<string, RouteResult | null>()

export function campusRouteCacheKey(
	fromId: string,
	toId: string,
	outdoorReady: boolean
): string {
	return `${fromId}:${toId}:${outdoorReady ? 'out' : 'no-out'}`
}

export function getCachedCampusRoute(
	key: string,
	compute: () => RouteResult | null
): RouteResult | null {
	const hit = cache.get(key)
	if (hit !== undefined) {
		return hit
	}
	const result = compute()
	if (cache.size >= CACHE_MAX) {
		const oldest = cache.keys().next().value
		if (oldest != null) {
			cache.delete(oldest)
		}
	}
	cache.set(key, result)
	return result
}

/** Test-only */
export function clearCampusRouteCache(): void {
	cache.clear()
}
