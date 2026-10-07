import { Layer, Source } from '@vis.gl/react-maplibre'
import type React from 'react'
import { memo, useMemo } from 'react'
import { getIndoorNavLayerPaints } from '@/components/Map/indoor-nav-layer-styles'
import {
	IndoorNavEntranceMarkers,
	IndoorNavStepMarkers
} from '@/components/Map/indoor-nav-step-markers.web'
import {
	EMPTY_MAP_FEATURES,
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
	/** Mount 3D ghost stack only during active navigation (avoids web layer errors on room preview). */
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
				<Source
					id={MAP_IDS.sources.indoorGhostFloors}
					type="geojson"
					data={ghostData}
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
				</Source>
			)}
			<Source
				id={MAP_IDS.sources.indoorStairs}
				type="geojson"
				data={layers.stairsGeoJSON}
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
			</Source>
			{layers.footpathsGeoJSON.features.length > 0 && (
				<Source
					id={MAP_IDS.sources.indoorFootpaths}
					type="geojson"
					data={layers.footpathsGeoJSON}
				>
					<Layer
						id={MAP_IDS.layers.indoorFootpathsLine}
						type="line"
						layout={paints.footpathsLineLayout}
						paint={paints.footpathsLine}
					/>
				</Source>
			)}
			<Source
				id={MAP_IDS.sources.indoorProgress}
				type="geojson"
				data={routeProgressGeoJSON}
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
			</Source>
			<Source
				id={MAP_IDS.sources.indoorDestinationRoom}
				type="geojson"
				data={layers.destinationRoomGeoJSON}
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
			</Source>
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
