import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native'
import type React from 'react'
import { memo } from 'react'
import { useIndoorNavLayersViewModel } from '@/components/Map/indoor-nav-map-layers-shared'
import {
	IndoorNavEntranceMarkers,
	IndoorNavStepMarkers
} from '@/components/Map/indoor-nav-step-markers.native'
import {
	GEOJSON_TOLERANCE,
	MAP_IDS,
	type MapMode
} from '@/components/Map/map-config'
import type { IndoorNavMapLayersData } from '@/hooks/indoor-nav-map-layers'

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
	const vm = useIndoorNavLayersViewModel(
		layers,
		primaryColor,
		mapMode,
		showGhostCutaway
	)
	if (layers == null) {
		return null
	}
	const { paints, routeProgressGeoJSON, ghostVisibility, ghostData } = vm

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
			{vm.shouldShowEntrances(overlayFloor) && (
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
