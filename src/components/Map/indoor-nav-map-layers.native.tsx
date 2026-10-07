import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native'
import type React from 'react'
import { memo, useMemo } from 'react'
import { getIndoorNavLayerPaints } from '@/components/Map/indoor-nav-layer-styles'
import {
	IndoorNavEntranceMarkers,
	IndoorNavStepMarkers
} from '@/components/Map/indoor-nav-step-markers.native'
import {
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	MAP_IDS,
	type MapMode
} from '@/components/Map/map-config'
import {
	EMPTY_INDOOR_MAP_LAYERS,
	type IndoorNavMapLayersData
} from '@/hooks/indoor-nav-map-layers'
import { useAnimatedRouteProgressGeoJson } from '@/hooks/useAnimatedRouteProgressGeoJson'
import { routeDrawAnimationKey } from '@/utils/indoor-nav/route-line-draw'

interface IndoorNavMapLayersProps {
	layers: IndoorNavMapLayersData | null
	overlayFloor: string
	primaryColor: string
	mapMode: MapMode
	showGhostCutaway?: boolean
	stackCutawayLayers?: boolean
	onEntrancePress?: (entranceId: string) => void
}

function IndoorNavMapLayersInner({
	layers,
	overlayFloor,
	primaryColor,
	mapMode,
	showGhostCutaway = false,
	stackCutawayLayers = false,
	onEntrancePress
}: IndoorNavMapLayersProps): React.JSX.Element | null {
	const paints = useMemo(
		() => getIndoorNavLayerPaints(primaryColor, mapMode),
		[mapMode, primaryColor]
	)
	const routeDrawKey = useMemo(
		() =>
			layers != null
				? routeDrawAnimationKey(layers.routeProgressGeoJSON)
				: null,
		[layers?.routeProgressGeoJSON]
	)
	const routeProgressGeoJSON = useAnimatedRouteProgressGeoJson(
		layers?.routeProgressGeoJSON ??
			EMPTY_INDOOR_MAP_LAYERS.routeProgressGeoJSON,
		routeDrawKey
	)
	if (layers == null) {
		return null
	}
	const showGhost = showGhostCutaway && layers.stairMoment != null
	const ghostVisibility = showGhost ? 'visible' : 'none'
	const ghostData = showGhost ? layers.ghostFloorsGeoJSON : EMPTY_MAP_FEATURES

	return (
		<>
			{stackCutawayLayers && (
				<GeoJSONSource
					id={MAP_IDS.sources.indoorGhostFloors}
					data={ghostData}
					tolerance={GEOJSON_TOLERANCE}
				>
					<Layer
						id={MAP_IDS.layers.indoorGhostRoomsExtrusion}
						type="fill-extrusion"
						filter={['==', ['get', 'ghostKind'], 'room']}
						layout={{ visibility: ghostVisibility }}
						// biome-ignore lint/suspicious/noExplicitAny: MapLibre data-driven extrusion paint
						paint={paints.ghostRoomExtrusion as any}
					/>
					<Layer
						id={MAP_IDS.layers.indoorGhostStairsExtrusion}
						type="fill-extrusion"
						filter={['==', ['get', 'ghostKind'], 'stair']}
						layout={{ visibility: ghostVisibility }}
						// biome-ignore lint/suspicious/noExplicitAny: MapLibre data-driven extrusion paint
						paint={paints.ghostStairExtrusion as any}
					/>
				</GeoJSONSource>
			)}
			<GeoJSONSource
				id={MAP_IDS.sources.indoorStairs}
				data={layers.stairsGeoJSON}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.indoorStairsFill}
					type="fill"
					paint={paints.stairsFill}
				/>
				<Layer
					id={MAP_IDS.layers.indoorStairsOutline}
					type="line"
					paint={paints.stairsOutline}
				/>
			</GeoJSONSource>
			{layers.footpathsGeoJSON.features.length > 0 && (
				<GeoJSONSource
					id={MAP_IDS.sources.indoorFootpaths}
					data={layers.footpathsGeoJSON}
					tolerance={GEOJSON_TOLERANCE}
				>
					<Layer
						id={MAP_IDS.layers.indoorFootpathsLine}
						type="line"
						layout={paints.footpathsLineLayout}
						paint={paints.footpathsLine}
					/>
				</GeoJSONSource>
			)}
			<GeoJSONSource
				id={MAP_IDS.sources.indoorProgress}
				data={routeProgressGeoJSON}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.indoorProgressLineTodo}
					type="line"
					filter={['==', ['get', 'state'], 'todo']}
					layout={paints.progressLineTodoLayout}
					paint={paints.progressLineTodo}
				/>
				<Layer
					id={MAP_IDS.layers.indoorProgressLine}
					type="line"
					filter={[
						'any',
						['==', ['get', 'state'], 'done'],
						['==', ['get', 'state'], 'current']
					]}
					layout={paints.progressLineLayout}
					// biome-ignore lint/suspicious/noExplicitAny: MapLibre data-driven paint expressions
					paint={paints.progressLine as any}
				/>
			</GeoJSONSource>
			<GeoJSONSource
				id={MAP_IDS.sources.indoorDestinationRoom}
				data={layers.destinationRoomGeoJSON}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.indoorDestinationRoomFill}
					type="fill"
					paint={paints.destinationRoomFill}
				/>
				<Layer
					id={MAP_IDS.layers.indoorDestinationRoomOutline}
					type="line"
					paint={paints.destinationRoomOutline}
				/>
			</GeoJSONSource>
			<IndoorNavStepMarkers
				stepMarkersGeoJSON={layers.stepMarkersGeoJSON}
				primaryColor={primaryColor}
				mapMode={mapMode}
			/>
			{(overlayFloor === 'EG' || overlayFloor === 'OUT') &&
				layers.entrancesGeoJSON.features.length > 0 && (
					<IndoorNavEntranceMarkers
						entrancesGeoJSON={layers.entrancesGeoJSON}
						primaryColor={primaryColor}
						mapMode={mapMode}
						onEntrancePress={onEntrancePress}
					/>
				)}
		</>
	)
}

export const IndoorNavMapLayers = memo(IndoorNavMapLayersInner)
