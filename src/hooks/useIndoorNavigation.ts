import { useMemo } from 'react'
import type { ClickedMapElement } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import {
	applyIndoorData,
	formatDistanceDuration,
	getIndoorGraph,
	getIndoorRoomFloorsForCode,
	INDOOR_DEFAULT_START_ID,
	type IndoorNavLocale,
	isIndoorDataLoaded,
	type RouteResult,
	roomNodeId,
	route,
	routePreview
} from '@/utils/indoor-nav'
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
}

export function useIndoorNavigation({
	clickedElement,
	overlayFloor,
	lockedToId = null,
	enabled = true,
	fullRoute = false,
	indoorData = null,
	fromId = INDOOR_DEFAULT_START_ID,
	locale = 'de'
}: UseIndoorNavigationOptions): IndoorNavModel | null {
	return useMemo(() => {
		if (indoorData != null) {
			applyIndoorData(indoorData)
		}
		if (!enabled || !isIndoorDataLoaded()) {
			return null
		}
		if (clickedElement?.type !== SEARCH_TYPES.ROOM) {
			return null
		}
		const code = clickedElement.data
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
			floor =
				floors.find((f) => f === overlayFloor) ?? floors[0] ?? overlayFloor
			toId = roomNodeId(floor, code)
		}
		if (!graph.nodes.has(toId)) {
			return null
		}
		let routeResult: RouteResult | null = null
		let distanceM: number
		let durationSec: number
		if (fullRoute) {
			routeResult = route(graph, fromId, toId)
			if (routeResult == null) {
				return null
			}
			distanceM = routeResult.distanceM
			durationSec = routeResult.durationSec
		} else {
			const preview = routePreview(graph, fromId, toId)
			if (preview == null) {
				return null
			}
			distanceM = preview.distanceM
			durationSec = preview.durationSec
		}
		const startNode = graph.nodes.get(fromId)
		return {
			destinationFloor: floor,
			destinationCode: code,
			fromId,
			toId,
			toLabel: code,
			startLabel: startNode?.label ?? fromId,
			routeResult,
			summary: formatDistanceDuration(distanceM, durationSec, locale)
		}
	}, [
		clickedElement,
		enabled,
		fromId,
		fullRoute,
		indoorData,
		locale,
		lockedToId,
		overlayFloor
	])
}
