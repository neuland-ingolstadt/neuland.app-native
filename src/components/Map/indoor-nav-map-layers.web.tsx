import { Layer, Source } from '@vis.gl/react-maplibre'
import type React from 'react'
import { getIndoorNavLayerPaints } from '@/components/Map/indoor-nav-layer-styles'
import { MAP_IDS, type MapMode } from '@/components/Map/map-config'
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
			<Source
				id={MAP_IDS.sources.indoorProgress}
				type="geojson"
				data={layers.routeProgressGeoJSON}
			>
				<Layer
					id={MAP_IDS.layers.indoorProgressLine}
					type="line"
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
			<Source
				id={MAP_IDS.sources.indoorStepMarkers}
				type="geojson"
				data={layers.stepMarkersGeoJSON}
			>
				<Layer
					id={MAP_IDS.layers.indoorStepMarkers}
					type="circle"
					// biome-ignore lint/suspicious/noExplicitAny: MapLibre data-driven paint expressions
					paint={paints.stepMarkers as any}
				/>
			</Source>
			{overlayFloor === 'EG' && (
				<Source
					id={MAP_IDS.sources.indoorEntrances}
					type="geojson"
					data={layers.entrancesGeoJSON}
				>
					<Layer
						id={MAP_IDS.layers.indoorEntrances}
						type="circle"
						paint={paints.entrances}
					/>
				</Source>
			)}
		</>
	)
}
