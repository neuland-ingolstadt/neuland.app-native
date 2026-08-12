import type { CameraRef } from '@maplibre/maplibre-react-native'
import {
	Camera,
	GeoJSONSource,
	Images,
	Layer,
	Map as MapLibreMap,
	NativeUserLocation
} from '@maplibre/maplibre-react-native'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import {
	getMapLayerStyles,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode
} from '@/components/Map/map-config'
import { useFloorOverlayFade } from '@/hooks/useFloorOverlayFade'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useMapSelectionPop } from '@/hooks/useMapSelectionPop'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import {
	getMapFocusPadding,
	getRoomSelectionFromProperties,
	getSelectedMapFeatures,
	parseMapCoordinate
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'

interface NativeMapCanvasProps {
	mapKey: number
	cameraResetRequestId: number
	mapLoadState: LoadingState
	setMapLoadState: React.Dispatch<React.SetStateAction<LoadingState>>
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
	locationPermissionGranted: boolean
	locationRequestId: number
	disableFollowUser: boolean
	onRegionChange: (changing: boolean) => void
	focusPaddingBottom: number
	overlayFloor: string
}

function setNativeMapView(
	cameraRef: { current: CameraRef | null },
	mapCenter: MapScreenModel['mapCenter'],
	element: ClickedMapElement | null = null,
	focusPaddingBottom = 0
): void {
	if (element?.center == null) {
		cameraRef.current?.flyTo({
			center: mapCenter,
			zoom: MAP_CAMERA.initialZoom,
			duration: MAP_CAMERA.resetDuration,
			bearing: 0,
			padding: getMapFocusPadding(0)
		})
		return
	}

	const [longitude, latitude] = element.center
	cameraRef.current?.flyTo({
		center: [longitude, latitude],
		zoom: MAP_CAMERA.focusZoom,
		duration: MAP_CAMERA.focusDuration,
		padding: getMapFocusPadding(focusPaddingBottom)
	})
}

export default function NativeMapCanvas({
	mapKey,
	cameraResetRequestId,
	mapLoadState,
	setMapLoadState,
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
	locationPermissionGranted,
	locationRequestId,
	disableFollowUser,
	onRegionChange,
	focusPaddingBottom,
	overlayFloor
}: NativeMapCanvasProps): React.JSX.Element {
	const cameraRef = useRef<CameraRef>(null)
	const isDark = mapMode === 'dark'
	const { displayedRooms, displayedAvailableRooms, overlayOpacity } =
		useFloorOverlayFade({
			floor: overlayFloor,
			rooms: filteredGeoJSON,
			availableRooms: availableFilteredGeoJSON
		})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED) {
			return
		}
		setNativeMapView(cameraRef, mapCenter, clickedElement, focusPaddingBottom)
	}, [clickedElement, focusPaddingBottom, mapCenter, mapLoadState])

	useEffect(() => {
		if (cameraResetRequestId > 0 && mapLoadState === LoadingState.LOADED) {
			setNativeMapView(cameraRef, mapCenter)
		}
	}, [cameraResetRequestId, mapCenter, mapLoadState])

	const layerStyles = getMapLayerStyles(
		isDark,
		primaryColor,
		labelColor,
		backgroundColor,
		overlayOpacity,
		selectionPop,
		selectionColor
	)
	const selectedRoomCenter = parseMapCoordinate(clickedElement?.center)
	const selectedFeatures = getSelectedMapFeatures(
		clickedElement,
		filteredGeoJSON
	)

	return (
		<MapLibreMap
			key={mapKey}
			style={{ flex: 1 }}
			tintColor={Platform.OS === 'ios' ? primaryColor : undefined}
			logo={false}
			mapStyle={MAP_STYLE_URLS[mapMode]}
			attribution={false}
			onDidFailLoadingMap={() => setMapLoadState(LoadingState.ERROR)}
			onDidFinishLoadingMap={() => setMapLoadState(LoadingState.LOADED)}
			onDidFinishRenderingMapFully={() => onRegionChange(false)}
			onRegionIsChanging={() => onRegionChange(true)}
			compass={Platform.OS === 'ios'}
		>
			<Images
				images={{
					// https://iconduck.com/icons/71717/map-marker - License: Creative Commons Zero v1.0 Universal
					'map-marker': require('@/assets/map-marker.png'),
					pin: 'pin'
				}}
			/>
			<Camera
				ref={cameraRef}
				initialViewState={{
					center: mapCenter,
					zoom: MAP_CAMERA.initialZoom,
					bearing: 0
				}}
				minZoom={MAP_CAMERA.minZoom}
				maxZoom={MAP_CAMERA.maxZoom}
				trackUserLocation={
					locationRequestId !== 0 &&
					clickedElement == null &&
					!disableFollowUser
						? 'default'
						: undefined
				}
			/>
			{locationPermissionGranted && <NativeUserLocation mode="heading" />}
			{displayedRooms != null && displayedRooms.features.length > 0 && (
				<GeoJSONSource
					id={MAP_IDS.sources.allRooms}
					data={displayedRooms}
					onPress={(event) => {
						event.stopPropagation()
						const selection = getRoomSelectionFromProperties(
							event.nativeEvent.features[0]?.properties
						)
						if (selection == null) {
							return
						}
						triggerSelectionPop()
						selectMapElement({
							room: selection.room,
							type: SEARCH_TYPES.ROOM,
							center: selection.center,
							origin: 'MapClick',
							manual: true
						})
					}}
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
				</GeoJSONSource>
			)}
			{displayedAvailableRooms != null &&
				displayedAvailableRooms.features.length > 0 && (
					<GeoJSONSource
						id={MAP_IDS.sources.availableRooms}
						data={displayedAvailableRooms}
					>
						<Layer
							id={MAP_IDS.layers.availableRoomsFill}
							type="fill"
							paint={{
								...layerStyles.availableRooms
							}}
						/>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutline}
							type="line"
							paint={{
								...layerStyles.availableRoomsOutline
							}}
						/>
					</GeoJSONSource>
				)}
			{buildingGeoJSON.features.length > 0 && (
				<GeoJSONSource
					id={MAP_IDS.sources.buildingLabels}
					data={buildingGeoJSON}
				>
					<Layer
						id={MAP_IDS.layers.buildingLabels}
						type="symbol"
						layout={layerStyles.buildingLabels.layout}
						paint={layerStyles.buildingLabels.paint}
					/>
				</GeoJSONSource>
			)}
			<GeoJSONSource
				id={MAP_IDS.sources.selectedRoom}
				data={{
					type: 'FeatureCollection',
					features:
						selectedRoomCenter == null
							? []
							: [
									{
										type: 'Feature',
										geometry: {
											type: 'Point',
											coordinates: selectedRoomCenter
										},
										properties: {}
									}
								]
				}}
			>
				<Layer
					id={MAP_IDS.layers.selectedRoomMarker}
					type="symbol"
					layout={layerStyles.selectedRoomMarker.layout}
					paint={layerStyles.selectedRoomMarker.paint}
				/>
			</GeoJSONSource>
			{selectedFeatures.length > 0 && (
				<GeoJSONSource
					id={MAP_IDS.sources.selectedOverlay}
					data={{
						type: 'FeatureCollection',
						features: selectedFeatures
					}}
				>
					<Layer
						id={MAP_IDS.layers.selectedFill}
						type="fill"
						paint={layerStyles.selectedFill}
						beforeId={MAP_IDS.layers.selectedRoomMarker}
					/>
					<Layer
						id={MAP_IDS.layers.selectedOutline}
						type="line"
						paint={layerStyles.selectedOutline}
						beforeId={MAP_IDS.layers.selectedRoomMarker}
					/>
				</GeoJSONSource>
			)}
		</MapLibreMap>
	)
}
