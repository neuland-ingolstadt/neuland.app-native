import { useMemo } from 'react'
import type { ClickedMapElement } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import {
	applyIndoorData,
	formatDistanceDuration,
	getIndoorBuildingForCode,
	getIndoorData,
	getIndoorGraph,
	getIndoorRoomFloorsForCode,
	INDOOR_DEFAULT_START_ID,
	type IndoorNavLocale,
	isIndoorDataLoaded,
	type OutdoorRouter,
	type RouteResult,
	roomNodeId,
	route,
	routeCampus,
	routePreview
} from '@/utils/indoor-nav'
import {
	campusRouteCacheKey,
	fullRouteCacheKey,
	getCachedCampusRoute,
	getCachedFullRoute
} from '@/utils/indoor-nav/campus-route-cache'
import { isCrossBuildingRoute } from '@/utils/indoor-nav/cross-building'
import { defaultStartForBuilding } from '@/utils/indoor-nav/ids'
import type { IndoorData } from '@/utils/indoor-nav/types'

export interface IndoorNavModel {
	destinationFloor: string
	destinationCode: string
	fromId: string
	toId: string
	toLabel: string
	startLabel: string
	/** Full geometry; null until navigation is active. */
	routeResult: RouteResult | null
	/** Whether a walkable route exists for the current start/end pair. */
	routeReady: boolean
	summary: string
}

interface UseIndoorNavigationOptions {
	clickedElement: ClickedMapElement | null
	overlayFloor: string
	lockedToId?: string | null
	enabled?: boolean
	/** When true, expands corridors and builds segments for turn-by-turn. */
	fullRoute?: boolean
	/** React Query payload — re-applies module cache when persistence skips queryFn. */
	indoorData?: IndoorData | null
	fromId?: string
	locale?: IndoorNavLocale
	outdoorRouter?: OutdoorRouter | null
}

export function useIndoorNavigation({
	clickedElement,
	overlayFloor,
	lockedToId = null,
	enabled = true,
	fullRoute = false,
	indoorData = null,
	fromId = INDOOR_DEFAULT_START_ID,
	locale = 'de',
	outdoorRouter = null
}: UseIndoorNavigationOptions): IndoorNavModel | null {
	const roomCode =
		clickedElement?.type === SEARCH_TYPES.ROOM ? clickedElement.data : null
	const overlayFloorForRoute = lockedToId == null ? overlayFloor : null

	return useMemo(() => {
		if (indoorData != null) {
			applyIndoorData(indoorData)
		}
		if (!enabled || !isIndoorDataLoaded()) {
			return null
		}
		if (roomCode == null) {
			return null
		}
		const code = roomCode
		const floors = getIndoorRoomFloorsForCode(code)
		if (floors.length === 0) {
			return null
		}
		const graph = getIndoorGraph()
		let toId: string
		let floor: string
		if (lockedToId != null && graph.nodes.has(lockedToId)) {
			toId = lockedToId
			floor = graph.nodes.get(toId)?.floor ?? overlayFloor
		} else {
			const viewFloor = overlayFloorForRoute ?? floors[0] ?? 'EG'
			floor = floors.find((f) => f === viewFloor) ?? floors[0] ?? viewFloor
			toId = roomNodeId(floor, code)
		}
		if (!graph.nodes.has(toId)) {
			return null
		}
		const destinationBuilding = getIndoorBuildingForCode(code) ?? 'G'
		const effectiveFromId =
			fromId === INDOOR_DEFAULT_START_ID
				? defaultStartForBuilding(destinationBuilding)
				: fromId
		if (!graph.nodes.has(effectiveFromId)) {
			return null
		}

		const data = getIndoorData()
		const cross = isCrossBuildingRoute(effectiveFromId, toId, data.entrances)

		let routeResult: RouteResult | null = null
		let distanceM = 0
		let durationSec = 0
		let routeReady = false

		if (cross) {
			const cacheKey = campusRouteCacheKey(
				effectiveFromId,
				toId,
				outdoorRouter != null
			)
			const campus = getCachedCampusRoute(cacheKey, () =>
				routeCampus(graph, outdoorRouter, data, effectiveFromId, toId)
			)
			if (campus != null) {
				routeResult = campus
				distanceM = campus.distanceM
				durationSec = campus.durationSec
				routeReady = true
			}
		} else if (fullRoute) {
			routeResult = getCachedFullRoute(
				fullRouteCacheKey(effectiveFromId, toId),
				() => route(graph, effectiveFromId, toId)
			)
			if (routeResult != null) {
				distanceM = routeResult.distanceM
				durationSec = routeResult.durationSec
				routeReady = true
			}
		} else {
			const preview = routePreview(graph, effectiveFromId, toId)
			if (preview != null) {
				distanceM = preview.distanceM
				durationSec = preview.durationSec
				routeReady = true
			}
		}

		if (fullRoute && !routeReady) {
			return null
		}

		const startNode = graph.nodes.get(effectiveFromId)
		const summary = routeReady
			? formatDistanceDuration(distanceM, durationSec, locale)
			: '—'

		return {
			destinationFloor: floor,
			destinationCode: code,
			fromId: effectiveFromId,
			toId,
			toLabel: code,
			startLabel: startNode?.label ?? effectiveFromId,
			routeResult: fullRoute ? routeResult : null,
			routeReady,
			summary
		}
	}, [
		enabled,
		fromId,
		fullRoute,
		indoorData,
		locale,
		lockedToId,
		outdoorRouter,
		overlayFloorForRoute,
		roomCode
	])
}
