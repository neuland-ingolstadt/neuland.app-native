import type { RouteResult } from './types'

const CACHE_MAX = 48
const campusCache = new Map<string, RouteResult | null>()
const fullRouteCache = new Map<string, RouteResult | null>()

function getCachedRoute(
	cache: Map<string, RouteResult | null>,
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
	return getCachedRoute(campusCache, key, compute)
}

/** Same-building full routes (`route()`) — keyed by start/end pair. */
export function fullRouteCacheKey(fromId: string, toId: string): string {
	return `full:${fromId}:${toId}`
}

export function getCachedFullRoute(
	key: string,
	compute: () => RouteResult | null
): RouteResult | null {
	return getCachedRoute(fullRouteCache, key, compute)
}

/** Test-only */
export function clearCampusRouteCache(): void {
	campusCache.clear()
	fullRouteCache.clear()
}
