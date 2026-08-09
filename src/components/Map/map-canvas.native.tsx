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
import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
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

interface NativeMapCanvasProps {
	mapKey: number
	cameraResetRequestId: number
	mapLoadState: LoadingState
	setMapLoadState: React.Dispatch<React.SetStateAction<LoadingState>>
	mapCenter: MapScreenModel['mapCenter']
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
	locationPermissionGranted: boolean
	locationRequestId: number
	disableFollowUser: boolean
	onRegionChange: (changing: boolean) => void
}

export default function NativeMapCanvas({
	mapKey,
	cameraResetRequestId,
	mapLoadState,
	setMapLoadState,
	mapCenter,
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
	locationPermissionGranted,
	locationRequestId,
	disableFollowUser,
	onRegionChange
}: NativeMapCanvasProps): React.JSX.Element {
	const cameraRef = useRef<CameraRef>(null)

	const setView = useCallback(
		(element: ClickedMapElement | null = null): void => {
			if (element?.center == null) {
				cameraRef.current?.flyTo({
					center: mapCenter,
					zoom: MAP_CAMERA.initialZoom,
					duration: MAP_CAMERA.resetDuration,
					bearing: 0
				})
				return
			}

			const [longitude, latitude] = element.center
			cameraRef.current?.flyTo({
				center: [longitude, latitude + MAP_CAMERA.focusLatitudeOffset],
				zoom: MAP_CAMERA.focusZoom,
				duration: MAP_CAMERA.focusDuration
			})
		},
		[mapCenter]
	)

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED) {
			return
		}
		setView(clickedElement)
	}, [clickedElement, mapLoadState, setView])

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

	return (
		<MapLibreMap
			key={mapKey}
			style={{ flex: 1 }}
			tintColor={Platform.OS === 'ios' ? primaryColor : undefined}
			logo={false}
			mapStyle={isDark ? MAP_STYLE_URLS.dark : MAP_STYLE_URLS.light}
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
			{filteredGeoJSON != null && hasFilteredRooms && (
				<GeoJSONSource
					id={MAP_IDS.sources.allRooms}
					data={filteredGeoJSON}
					onPress={(event) => {
						event.stopPropagation()
						const selection = getRoomSelectionFromProperties(
							event.nativeEvent.features[0]?.properties
						)
						if (selection == null) {
							return
						}
						selectRoom({
							room: selection.room,
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
			{availableFilteredGeoJSON != null && hasAvailableFilteredRooms && (
				<GeoJSONSource
					id={MAP_IDS.sources.availableRooms}
					data={availableFilteredGeoJSON}
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
			{selectedRoomCenter != null && (
				<GeoJSONSource
					id={MAP_IDS.sources.selectedRoom}
					data={{
						type: 'FeatureCollection',
						features: [
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
			)}
		</MapLibreMap>
	)
}
