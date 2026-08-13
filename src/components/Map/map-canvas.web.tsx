import type { MapRef } from '@vis.gl/react-maplibre'
import {
	Layer,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: TODO
	Map,
	Marker,
	NavigationControl,
	Source
} from '@vis.gl/react-maplibre'
import type { MapMouseEvent } from 'maplibre-gl'
import * as maplibregl from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	getMapLayerStyles,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode
} from '@/components/Map/map-config'
import { useFloorOverlaySlide } from '@/hooks/useFloorOverlaySlide'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useMapSelectionPop } from '@/hooks/useMapSelectionPop'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import {
	getMapFocusPadding,
	getRoomSelectionFromFeatures,
	getSelectedMapFeatures,
	getSelectionFocusZoom,
	parseMapCoordinate
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'
import 'maplibre-gl/dist/maplibre-gl.css'

// Metro cannot resolve the v6 ESM worker via import.meta.url; serve it from public/
// (synced by `bun maplibre:worker`). Shared chunk must sit next to the worker.
setWorkerUrl('/maplibre-gl-worker.mjs')

const mapContainerStyle = {
	height: '100%',
	width: '100%'
}

interface WebMapCanvasProps {
	setMapLoadState: React.Dispatch<React.SetStateAction<LoadingState>>
	mapLoadState: LoadingState
	cameraResetRequestId: number
	mapCenter: MapScreenModel['mapCenter']
	filteredGeoJSON: MapScreenModel['filteredGeoJSON']
	availableFilteredGeoJSON: MapScreenModel['availableFilteredGeoJSON']
	buildingGeoJSON: MapScreenModel['buildingGeoJSON']
	clickedElement: MapScreenModel['clickedElement']
	selectMapElement: MapScreenModel['selectMapElement']
	mapMode: MapMode
	primaryColor: string
	selectionColor: string
	labelColor: string
	backgroundColor: string
	onRegionChange: (changing: boolean) => void
	focusPaddingBottom: number
	overlayFloor: string
}

function setWebMapView(
	mapRef: { current: MapRef | null },
	mapCenter: MapScreenModel['mapCenter'],
	element: ClickedMapElement | null = null,
	focusPaddingBottom = 0
): void {
	if (!mapRef.current) {
		return
	}

	const center =
		element == null ? mapCenter : parseMapCoordinate(element.center)
	if (center == null) {
		return
	}

	const map = mapRef.current.getMap()
	map.flyTo({
		center,
		zoom:
			element == null
				? MAP_CAMERA.initialZoom
				: getSelectionFocusZoom(map.getZoom()),
		...(element == null ? { bearing: 0 } : {}),
		duration:
			element == null ? MAP_CAMERA.resetDuration : MAP_CAMERA.focusDuration,
		padding: getMapFocusPadding(element == null ? 0 : focusPaddingBottom)
	})
}

export default function WebMapCanvas({
	setMapLoadState,
	mapLoadState,
	cameraResetRequestId,
	mapCenter,
	filteredGeoJSON,
	availableFilteredGeoJSON,
	buildingGeoJSON,
	clickedElement,
	selectMapElement,
	mapMode,
	primaryColor,
	selectionColor,
	labelColor,
	backgroundColor,
	onRegionChange,
	focusPaddingBottom,
	overlayFloor
}: WebMapCanvasProps): React.JSX.Element {
	const mapRef = useRef<MapRef | null>(null)
	const isDark = mapMode === 'dark'
	const { incoming, outgoing } = useFloorOverlaySlide({
		floor: overlayFloor,
		rooms: filteredGeoJSON,
		availableRooms: availableFilteredGeoJSON
	})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()

	useEffect(() => {
		if (mapRef.current == null || mapLoadState !== LoadingState.LOADED) {
			return
		}
		setWebMapView(mapRef, mapCenter, clickedElement, focusPaddingBottom)
	}, [clickedElement, focusPaddingBottom, mapCenter, mapLoadState])

	useEffect(() => {
		if (cameraResetRequestId > 0 && mapLoadState === LoadingState.LOADED) {
			setWebMapView(mapRef, mapCenter)
		}
	}, [cameraResetRequestId, mapCenter, mapLoadState])

	const layerStyles = getMapLayerStyles(
		isDark,
		primaryColor,
		labelColor,
		backgroundColor,
		incoming.opacity,
		incoming.fadeDuration,
		selectionPop,
		selectionColor
	)
	const outgoingStyles =
		outgoing == null
			? null
			: getMapLayerStyles(
					isDark,
					primaryColor,
					labelColor,
					backgroundColor,
					outgoing.opacity,
					outgoing.fadeDuration
				)
	const selectedRoomCenter = parseMapCoordinate(clickedElement?.center)
	const selectedFeatures = getSelectedMapFeatures(
		clickedElement,
		filteredGeoJSON
	)

	const handleMapClick = (event: MapMouseEvent): void => {
		if (!filteredGeoJSON || !mapRef.current) {
			return
		}

		const map = mapRef.current.getMap()
		const features = map.queryRenderedFeatures(event.point, {
			layers: [MAP_IDS.layers.allRoomsFill]
		})
		const selection = getRoomSelectionFromFeatures(features)
		if (selection == null) {
			return
		}

		if (clickedElement?.data === selection.room) {
			triggerSelectionPop()
		}
		selectMapElement({
			room: selection.room,
			type: SEARCH_TYPES.ROOM,
			center: selection.center,
			origin: 'MapClick',
			manual: true
		})
	}

	return (
		<div data-testid="map-canvas" style={mapContainerStyle}>
			<Map
				mapLib={maplibregl}
				initialViewState={{
					longitude: mapCenter[0],
					latitude: mapCenter[1],
					zoom: MAP_CAMERA.initialZoom
				}}
				mapStyle={MAP_STYLE_URLS[mapMode]}
				ref={mapRef}
				onLoad={() => setMapLoadState(LoadingState.LOADED)}
				onError={() => setMapLoadState(LoadingState.ERROR)}
				onClick={handleMapClick}
				onMoveStart={() => onRegionChange(true)}
				attributionControl={false}
			>
				<NavigationControl position="top-left" />

				<Source
					id={MAP_IDS.sources.selectedOverlay}
					type="geojson"
					data={{
						type: 'FeatureCollection',
						features: selectedFeatures
					}}
				>
					<Layer
						id={MAP_IDS.layers.selectedFill}
						type="fill"
						paint={layerStyles.selectedFill}
					/>
					<Layer
						id={MAP_IDS.layers.selectedOutline}
						type="line"
						paint={layerStyles.selectedOutline}
					/>
				</Source>

				<Source
					id={MAP_IDS.sources.buildingLabels}
					type="geojson"
					data={buildingGeoJSON}
				>
					<Layer
						id={MAP_IDS.layers.buildingLabels}
						type="symbol"
						layout={layerStyles.buildingLabels.layout}
						paint={layerStyles.buildingLabels.paint}
					/>
				</Source>

				<Source
					id={MAP_IDS.sources.allRooms}
					type="geojson"
					data={incoming.rooms ?? EMPTY_MAP_FEATURES}
					tolerance={GEOJSON_TOLERANCE}
				>
					<Layer
						id={MAP_IDS.layers.allRoomsFill}
						type="fill"
						paint={layerStyles.allRooms}
						beforeId={MAP_IDS.layers.selectedFill}
					/>
					<Layer
						id={MAP_IDS.layers.allRoomsOutline}
						type="line"
						paint={layerStyles.allRoomsOutline}
						beforeId={MAP_IDS.layers.selectedFill}
					/>
				</Source>

				{outgoingStyles != null && outgoing != null && (
					<Source
						id={MAP_IDS.sources.allRoomsOutgoing}
						type="geojson"
						data={outgoing.rooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.allRoomsOutgoingFill}
							type="fill"
							paint={outgoingStyles.allRooms}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
						<Layer
							id={MAP_IDS.layers.allRoomsOutgoingOutline}
							type="line"
							paint={outgoingStyles.allRoomsOutline}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</Source>
				)}

				<Source
					id={MAP_IDS.sources.availableRooms}
					type="geojson"
					data={incoming.availableRooms ?? EMPTY_MAP_FEATURES}
					tolerance={GEOJSON_TOLERANCE}
				>
					<Layer
						id={MAP_IDS.layers.availableRoomsFill}
						type="fill"
						paint={layerStyles.availableRooms}
						beforeId={MAP_IDS.layers.selectedFill}
					/>
					<Layer
						id={MAP_IDS.layers.availableRoomsOutline}
						type="line"
						paint={layerStyles.availableRoomsOutline}
						beforeId={MAP_IDS.layers.selectedFill}
					/>
				</Source>

				{outgoingStyles != null && outgoing != null && (
					<Source
						id={MAP_IDS.sources.availableRoomsOutgoing}
						type="geojson"
						data={outgoing.availableRooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutgoingFill}
							type="fill"
							paint={outgoingStyles.availableRooms}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutgoingOutline}
							type="line"
							paint={outgoingStyles.availableRoomsOutline}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</Source>
				)}

				{selectedRoomCenter != null && (
					<Marker
						longitude={selectedRoomCenter[0]}
						latitude={selectedRoomCenter[1]}
						color={selectionColor}
					/>
				)}
			</Map>
		</div>
	)
}
