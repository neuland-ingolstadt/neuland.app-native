import {
	Layer,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: TODO
	Map,
	Marker,
	NavigationControl,
	Source
} from '@vis.gl/react-maplibre'
import maplibregl from 'maplibre-gl'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import {
	getMapLayerStyles,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS
} from '@/components/Map/map-config'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import type { ClickedMapElement } from '@/types/map'
import {
	getRoomSelectionFromProperties,
	parseMapCoordinate
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'
import 'maplibre-gl/dist/maplibre-gl.css'

const mapContainerStyle = {
	height: '100%',
	width: '100%'
}

interface WebMapCanvasProps {
	setMapLoadState: React.Dispatch<React.SetStateAction<LoadingState>>
	cameraResetRequestId: number
	mapCenter: MapScreenModel['mapCenter']
	mapOverlay: MapScreenModel['mapOverlay']
	filteredGeoJSON: MapScreenModel['filteredGeoJSON']
	availableFilteredGeoJSON: MapScreenModel['availableFilteredGeoJSON']
	hasFilteredRooms: boolean
	hasAvailableFilteredRooms: boolean
	buildingGeoJSON: MapScreenModel['buildingGeoJSON']
	clickedElement: MapScreenModel['clickedElement']
	selectRoom: MapScreenModel['selectRoom']
	isDark: boolean
	primaryColor: string
	labelColor: string
	backgroundColor: string
	onRegionChange: (changing: boolean) => void
}

export default function WebMapCanvas({
	setMapLoadState,
	cameraResetRequestId,
	mapCenter,
	mapOverlay,
	filteredGeoJSON,
	availableFilteredGeoJSON,
	hasFilteredRooms,
	hasAvailableFilteredRooms,
	buildingGeoJSON,
	clickedElement,
	selectRoom,
	isDark,
	primaryColor,
	labelColor,
	backgroundColor,
	onRegionChange
}: WebMapCanvasProps): React.JSX.Element {
	const mapRef = useRef(null)

	const setView = useCallback(
		(element: ClickedMapElement | null = null): void => {
			if (!mapRef.current) {
				return
			}

			const map = mapRef.current as maplibregl.Map
			const center =
				element == null ? mapCenter : parseMapCoordinate(element.center)
			if (center == null) {
				return
			}

			map.flyTo({
				center:
					element == null
						? center
						: [center[0], center[1] + MAP_CAMERA.focusLatitudeOffset],
				zoom: element == null ? MAP_CAMERA.initialZoom : MAP_CAMERA.focusZoom,
				...(element == null ? { bearing: 0 } : {}),
				duration:
					element == null ? MAP_CAMERA.resetDuration : MAP_CAMERA.focusDuration
			})
		},
		[mapCenter]
	)

	useEffect(() => {
		if (mapRef.current == null || mapOverlay == null) {
			return
		}
		setView(clickedElement)
	}, [clickedElement, mapOverlay, setView])

	useEffect(() => {
		if (cameraResetRequestId > 0) {
			setView()
		}
	}, [cameraResetRequestId, setView])

	const layerStyles = getMapLayerStyles(
		isDark,
		primaryColor,
		labelColor,
		backgroundColor
	)
	const selectedRoomCenter = parseMapCoordinate(clickedElement?.center)

	const handleMapClick = useCallback(
		(event: maplibregl.MapMouseEvent) => {
			if (!filteredGeoJSON || !mapRef.current) {
				return
			}

			const map = mapRef.current as maplibregl.Map
			const features = map.queryRenderedFeatures(event.point, {
				layers: [MAP_IDS.layers.allRoomsFill]
			})
			const selection = getRoomSelectionFromProperties(features[0]?.properties)
			if (selection == null) {
				return
			}

			selectRoom({
				room: selection.room,
				center: selection.center,
				origin: 'MapClick',
				manual: true
			})
		},
		[filteredGeoJSON, selectRoom]
	)

	return (
		<div data-testid="map-canvas" style={mapContainerStyle}>
			<Map
				mapLib={maplibregl}
				initialViewState={{
					longitude: mapCenter[0],
					latitude: mapCenter[1],
					zoom: MAP_CAMERA.initialZoom
				}}
				mapStyle={isDark ? MAP_STYLE_URLS.dark : MAP_STYLE_URLS.light}
				ref={mapRef}
				onLoad={() => setMapLoadState(LoadingState.LOADED)}
				onError={() => setMapLoadState(LoadingState.ERROR)}
				onClick={handleMapClick}
				onMoveStart={() => onRegionChange(true)}
				attributionControl={false}
			>
				<NavigationControl position="top-right" />

				{filteredGeoJSON != null && hasFilteredRooms && (
					<Source
						id={MAP_IDS.sources.allRooms}
						type="geojson"
						data={filteredGeoJSON}
					>
						<Layer
							id={MAP_IDS.layers.allRoomsFill}
							type="fill"
							paint={layerStyles.allRooms}
						/>
						<Layer
							id={MAP_IDS.layers.allRoomsOutline}
							type="line"
							paint={layerStyles.allRoomsOutline}
						/>
					</Source>
				)}

				{availableFilteredGeoJSON != null && hasAvailableFilteredRooms && (
					<Source
						id={MAP_IDS.sources.availableRooms}
						type="geojson"
						data={availableFilteredGeoJSON}
					>
						<Layer
							id={MAP_IDS.layers.availableRoomsFill}
							type="fill"
							paint={layerStyles.availableRooms}
						/>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutline}
							type="line"
							paint={layerStyles.availableRoomsOutline}
						/>
					</Source>
				)}

				{buildingGeoJSON.features.length > 0 && (
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
				)}

				{selectedRoomCenter != null && (
					<Marker
						longitude={selectedRoomCenter[0]}
						latitude={selectedRoomCenter[1]}
						color={primaryColor}
					/>
				)}
			</Map>
		</div>
	)
}
