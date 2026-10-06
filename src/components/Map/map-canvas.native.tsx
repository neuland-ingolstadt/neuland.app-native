import type { CameraRef } from '@maplibre/maplibre-react-native'
import {
	Camera,
	GeoJSONSource,
	Images,
	Layer,
	Map as MapLibreMap,
	Marker,
	NativeUserLocation
} from '@maplibre/maplibre-react-native'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { IndoorNavMapLayers } from '@/components/Map/indoor-nav-map-layers.native'
import {
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	INDOOR_ENTRANCES_MIN_ZOOM,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode,
	ROOM_PRESS_HITBOX
} from '@/components/Map/map-config'
import { MapSelectionMarker } from '@/components/Map/map-selection-marker'
import type { IndoorNavMapLayersData } from '@/hooks/indoor-nav-map-layers'
import {
	type RunNavCamera,
	useMapCameraSync,
	useMapCanvasState
} from '@/hooks/useMapCanvasState'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ClickedMapElement } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import {
	fitBoundsNeSw,
	isCompactMapViewport,
	legBoundsCameraOptions,
	NAV_FLAT_CAMERA_EASING,
	type NavCameraCommand,
	navExitFocusStop,
	stairEnterCameraStop
} from '@/utils/indoor-nav'
import { runAfterDuration } from '@/utils/indoor-nav/run-after-map-camera'
import {
	getMapFocusPadding,
	getSelectionFocusZoom
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'

function runAfterNativeCameraStop(
	result: unknown,
	durationMs: number,
	onComplete: () => void
): void {
	const promise = result as Promise<void> | undefined
	if (promise != null && typeof promise.then === 'function') {
		void promise.then(onComplete).catch(onComplete)
		return
	}
	runAfterDuration(durationMs, onComplete)
}

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
	indoorMapLayers: IndoorNavMapLayersData | null
	cameraNavRequestId: number
	cameraNavCommand: NavCameraCommand | null
	onNavCameraIdle?: () => void
	navShowGhostCutaway?: boolean
	floorPlanDimmed?: boolean
	suppressSelectionCameraFocus?: boolean
	indoorNavActive?: boolean
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
			pitch: 0,
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
	overlayFloor,
	indoorMapLayers,
	cameraNavRequestId,
	cameraNavCommand,
	onNavCameraIdle,
	navShowGhostCutaway = false,
	floorPlanDimmed = false,
	suppressSelectionCameraFocus = false,
	indoorNavActive = false
}: NativeMapCanvasProps): React.JSX.Element {
	const cameraRef = useRef<CameraRef>(null)
	const currentZoomRef = useRef<number | undefined>(undefined)
	// Entrance markers only render when zoomed in. Tracked on gesture end
	// (not per frame) to avoid re-rendering the canvas mid-pinch.
	const [zoom, setZoom] = useState<number>(MAP_CAMERA.initialZoom)
	const { width: windowWidth } = useWindowDimensions()
	const reducedMotion = usePrefersReducedMotion()
	const {
		incoming,
		outgoing,
		layerStyles,
		outgoingStyles,
		selectedRoomCenter,
		selectedFeatures,
		handleRoomSelection
	} = useMapCanvasState({
		overlayFloor,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		clickedElement,
		selectMapElement,
		mapMode,
		primaryColor,
		selectionColor,
		labelColor,
		backgroundColor,
		suppressRoomSelection: indoorNavActive,
		hideAvailableRooms: indoorNavActive,
		floorPlanDimmed
	})

	const runNavCamera = useCallback<RunNavCamera>(
		(command, padding, done) => {
			const pad = getMapFocusPadding(padding)
			const compact = isCompactMapViewport(windowWidth)
			if (command.kind === 'stair-enter') {
				const stop = stairEnterCameraStop(command.at, compact, reducedMotion)
				const promise = cameraRef.current?.easeTo({
					center: stop.center,
					zoom: stop.zoom,
					pitch: stop.pitch,
					bearing: stop.bearing,
					duration: stop.duration,
					padding: pad
				})
				runAfterNativeCameraStop(promise, stop.duration, done)
				return
			}
			if (command.kind === 'exit-focus') {
				const stop = navExitFocusStop(command.at, reducedMotion)
				const promise = cameraRef.current?.easeTo({
					center: stop.center,
					zoom: stop.zoom,
					pitch: stop.pitch,
					bearing: stop.bearing,
					duration: stop.duration,
					padding: pad
				})
				runAfterNativeCameraStop(promise, stop.duration, done)
				return
			}
			if (command.resetFromStairs) {
				const duration = legBoundsCameraOptions(reducedMotion).duration
				const promise = cameraRef.current?.fitBounds(
					fitBoundsNeSw(command.bounds),
					{
						padding: pad,
						duration,
						pitch: 0,
						bearing: 0,
						easing: NAV_FLAT_CAMERA_EASING
					}
				)
				runAfterNativeCameraStop(promise, duration, done)
				return
			}
			const duration = legBoundsCameraOptions(reducedMotion).duration
			const promise = cameraRef.current?.fitBounds(
				fitBoundsNeSw(command.bounds),
				{
					padding: pad,
					duration,
					pitch: 0,
					bearing: 0,
					easing: NAV_FLAT_CAMERA_EASING
				}
			)
			runAfterNativeCameraStop(promise, duration, done)
		},
		[reducedMotion, windowWidth]
	)

	useMapCameraSync({
		mapLoadState,
		cameraResetRequestId,
		cameraNavRequestId,
		cameraNavCommand,
		onNavCameraIdle,
		runNavCamera,
		suppressSelectionFocus: suppressSelectionCameraFocus,
		mapCenter,
		clickedElement,
		focusPaddingBottom,
		flyTo: (element, padding) => {
			setNativeMapView(
				cameraRef,
				mapCenter,
				element,
				padding,
				currentZoomRef.current
			)
		}
	})

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
				setZoom(event.nativeEvent.zoom)
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
			{selectedRoomCenter != null && clickedElement != null && (
				<Marker
					id="map-selection-marker"
					lngLat={selectedRoomCenter}
					anchor={
						clickedElement.type === SEARCH_TYPES.BUILDING ? 'center' : 'bottom'
					}
				>
					<MapSelectionMarker
						type={clickedElement.type}
						selectionColor={selectionColor}
						primaryColor={primaryColor}
						mapMode={mapMode}
					/>
				</Marker>
			)}
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
				/>
				<Layer
					id={MAP_IDS.layers.selectedOutline}
					type="line"
					layout={layerStyles.selectedOutline.layout}
					paint={layerStyles.selectedOutline.paint}
				/>
			</GeoJSONSource>
			<GeoJSONSource id={MAP_IDS.sources.buildingLabels} data={buildingGeoJSON}>
				<Layer
					id={MAP_IDS.layers.buildingLabels}
					type="symbol"
					layout={layerStyles.buildingLabels.layout}
					paint={layerStyles.buildingLabels.paint}
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
						<Layer
							id={MAP_IDS.layers.allRoomsOutgoingOutline}
							type="line"
							layout={outgoingStyles.allRoomsOutline.layout}
							paint={outgoingStyles.allRoomsOutline.paint}
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
						<Layer
							id={MAP_IDS.layers.availableRoomsOutgoingOutline}
							type="line"
							layout={outgoingStyles.availableRoomsOutline.layout}
							paint={outgoingStyles.availableRoomsOutline.paint}
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
					handleRoomSelection(event.nativeEvent.features)
				}}
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
					layout={layerStyles.allRoomsOutline.layout}
					paint={layerStyles.allRoomsOutline.paint}
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
				<Layer
					id={MAP_IDS.layers.availableRoomsOutline}
					type="line"
					layout={layerStyles.availableRoomsOutline.layout}
					paint={layerStyles.availableRoomsOutline.paint}
					beforeId={MAP_IDS.layers.selectedFill}
				/>
			</GeoJSONSource>
			<IndoorNavMapLayers
				layers={indoorMapLayers}
				overlayFloor={overlayFloor}
				primaryColor={primaryColor}
				mapMode={mapMode}
				showGhostCutaway={navShowGhostCutaway}
				stackCutawayLayers={indoorNavActive}
				entrancesVisible={zoom >= INDOOR_ENTRANCES_MIN_ZOOM}
			/>
		</MapLibreMap>
	)
}
