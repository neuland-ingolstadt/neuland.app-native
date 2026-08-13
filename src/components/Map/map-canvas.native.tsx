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
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	getMapLayerStyles,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode,
	ROOM_PRESS_HITBOX
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
	focusPaddingBottom = 0,
	currentZoom?: number
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
		zoom: getSelectionFocusZoom(currentZoom),
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
	const currentZoomRef = useRef<number | undefined>(undefined)
	const isDark = mapMode === 'dark'
	const { incoming, outgoing } = useFloorOverlaySlide({
		floor: overlayFloor,
		rooms: filteredGeoJSON,
		availableRooms: availableFilteredGeoJSON
	})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED) {
			return
		}
		setNativeMapView(
			cameraRef,
			mapCenter,
			clickedElement,
			focusPaddingBottom,
			currentZoomRef.current
		)
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
			onRegionIsChanging={(event) => {
				currentZoomRef.current = event.nativeEvent.zoom
				onRegionChange(true)
			}}
			onRegionDidChange={(event) => {
				currentZoomRef.current = event.nativeEvent.zoom
			}}
			compass={Platform.OS === 'ios'}
			compassPosition={{ top: 8, left: 8 }}
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
			<GeoJSONSource
				id={MAP_IDS.sources.selectedOverlay}
				data={{
					type: 'FeatureCollection',
					features: selectedFeatures
				}}
				tolerance={GEOJSON_TOLERANCE}
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
			<GeoJSONSource id={MAP_IDS.sources.buildingLabels} data={buildingGeoJSON}>
				<Layer
					id={MAP_IDS.layers.buildingLabels}
					type="symbol"
					layout={layerStyles.buildingLabels.layout}
					paint={layerStyles.buildingLabels.paint}
					beforeId={MAP_IDS.layers.selectedRoomMarker}
				/>
			</GeoJSONSource>
			{outgoingStyles != null && outgoing != null && (
				<>
					<GeoJSONSource
						id={MAP_IDS.sources.allRoomsOutgoing}
						data={outgoing.rooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.allRoomsOutgoingFill}
							type="fill"
							paint={outgoingStyles.allRooms}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</GeoJSONSource>
					<GeoJSONSource
						id={MAP_IDS.sources.allRoomsOutgoingOutline}
						data={outgoing.rooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.allRoomsOutgoingOutline}
							type="line"
							paint={outgoingStyles.allRoomsOutline}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</GeoJSONSource>
					<GeoJSONSource
						id={MAP_IDS.sources.availableRoomsOutgoing}
						data={outgoing.availableRooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutgoingFill}
							type="fill"
							paint={outgoingStyles.availableRooms}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</GeoJSONSource>
					<GeoJSONSource
						id={MAP_IDS.sources.availableRoomsOutgoingOutline}
						data={outgoing.availableRooms ?? EMPTY_MAP_FEATURES}
						tolerance={GEOJSON_TOLERANCE}
					>
						<Layer
							id={MAP_IDS.layers.availableRoomsOutgoingOutline}
							type="line"
							paint={outgoingStyles.availableRoomsOutline}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</GeoJSONSource>
				</>
			)}
			<GeoJSONSource
				id={MAP_IDS.sources.allRooms}
				data={incoming.rooms ?? EMPTY_MAP_FEATURES}
				tolerance={GEOJSON_TOLERANCE}
				hitbox={ROOM_PRESS_HITBOX}
				onPress={(event) => {
					event.stopPropagation()
					const selection = getRoomSelectionFromFeatures(
						event.nativeEvent.features
					)
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
				}}
			>
				<Layer
					id={MAP_IDS.layers.allRoomsFill}
					type="fill"
					paint={layerStyles.allRooms}
					beforeId={MAP_IDS.layers.selectedFill}
				/>
			</GeoJSONSource>
			<GeoJSONSource
				id={MAP_IDS.sources.allRoomsOutline}
				data={incoming.rooms ?? EMPTY_MAP_FEATURES}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.allRoomsOutline}
					type="line"
					paint={layerStyles.allRoomsOutline}
					beforeId={MAP_IDS.layers.selectedFill}
				/>
			</GeoJSONSource>
			<GeoJSONSource
				id={MAP_IDS.sources.availableRooms}
				data={incoming.availableRooms ?? EMPTY_MAP_FEATURES}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.availableRoomsFill}
					type="fill"
					paint={layerStyles.availableRooms}
					beforeId={MAP_IDS.layers.selectedFill}
				/>
			</GeoJSONSource>
			<GeoJSONSource
				id={MAP_IDS.sources.availableRoomsOutline}
				data={incoming.availableRooms ?? EMPTY_MAP_FEATURES}
				tolerance={GEOJSON_TOLERANCE}
			>
				<Layer
					id={MAP_IDS.layers.availableRoomsOutline}
					type="line"
					paint={layerStyles.availableRoomsOutline}
					beforeId={MAP_IDS.layers.selectedFill}
				/>
			</GeoJSONSource>
		</MapLibreMap>
	)
}
