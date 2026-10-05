import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native'
import type React from 'react'
import { getIndoorNavLayerPaints } from '@/components/Map/indoor-nav-layer-styles'
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
}

export function IndoorNavMapLayers({
	layers,
	overlayFloor,
	primaryColor,
	mapMode
}: IndoorNavMapLayersProps): React.JSX.Element | null {
	if (layers == null) {
		return null
	}
	const paints = getIndoorNavLayerPaints(primaryColor, mapMode)

	return (
		<>
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
			<GeoJSONSource
				id={MAP_IDS.sources.indoorProgress}
				data={layers.routeProgressGeoJSON}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.indoorProgressLine}
					type="line"
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
			<GeoJSONSource
				id={MAP_IDS.sources.indoorStepMarkers}
				data={layers.stepMarkersGeoJSON}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.indoorStepMarkers}
					type="circle"
					// biome-ignore lint/suspicious/noExplicitAny: MapLibre data-driven paint expressions
					paint={paints.stepMarkers as any}
				/>
			</GeoJSONSource>
			{overlayFloor === 'EG' && (
				<GeoJSONSource
					id={MAP_IDS.sources.indoorEntrances}
					data={layers.entrancesGeoJSON}
					tolerance={GEOJSON_TOLERANCE}
				>
					<Layer
						id={MAP_IDS.layers.indoorEntrances}
						type="circle"
						paint={paints.entrances}
					/>
				</GeoJSONSource>
			)}
		</>
	)
}
