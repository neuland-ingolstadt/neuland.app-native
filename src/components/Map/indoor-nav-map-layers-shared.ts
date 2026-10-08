import { useMemo } from 'react'
import { getIndoorNavLayerPaints } from '@/components/Map/indoor-nav-layer-styles'
import { EMPTY_MAP_FEATURES, type MapMode } from '@/components/Map/map-config'
import {
	EMPTY_INDOOR_MAP_LAYERS,
	type IndoorNavMapLayersData
} from '@/hooks/indoor-nav-map-layers'
import { useAnimatedRouteProgressGeoJson } from '@/hooks/useAnimatedRouteProgressGeoJson'
import { routeDrawAnimationKey } from '@/utils/indoor-nav/route-line-draw'

export interface IndoorNavLayersViewModel {
	paints: ReturnType<typeof getIndoorNavLayerPaints>
	routeProgressGeoJSON: IndoorNavMapLayersData['routeProgressGeoJSON']
	showGhost: boolean
	ghostVisibility: 'visible' | 'none'
	ghostData: typeof EMPTY_MAP_FEATURES
	shouldShowEntrances: (overlayFloor: string) => boolean
}

/** Shared view-model for native + web IndoorNavMapLayers — keeps paint/animation/ghost logic in one place. */
export function useIndoorNavLayersViewModel(
	layers: IndoorNavMapLayersData | null,
	primaryColor: string,
	mapMode: MapMode,
	showGhostCutaway = false
): IndoorNavLayersViewModel {
	const paints = useMemo(
		() => getIndoorNavLayerPaints(primaryColor, mapMode),
		[mapMode, primaryColor]
	)
	const routeDrawKey = useMemo(
		() =>
			layers != null
				? routeDrawAnimationKey(layers.routeProgressGeoJSON)
				: null,
		// eslint-disable-next-line react-hooks/exhaustive-deps -- routeProgress object identity changes per render; key off nested ref
		[layers?.routeProgressGeoJSON]
	)
	const routeProgressGeoJSON = useAnimatedRouteProgressGeoJson(
		layers?.routeProgressGeoJSON ??
			EMPTY_INDOOR_MAP_LAYERS.routeProgressGeoJSON,
		routeDrawKey
	)
	const showGhost = showGhostCutaway && layers?.stairMoment != null
	return {
		paints,
		routeProgressGeoJSON,
		showGhost,
		ghostVisibility: showGhost ? 'visible' : 'none',
		ghostData:
			showGhost && layers ? layers.ghostFloorsGeoJSON : EMPTY_MAP_FEATURES,
		shouldShowEntrances: (overlayFloor: string) =>
			(overlayFloor === 'EG' || overlayFloor === 'OUT') &&
			(layers?.entrancesGeoJSON.features.length ?? 0) > 0
	}
}
