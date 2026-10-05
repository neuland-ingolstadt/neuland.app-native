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
import { useCallback, useEffect, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import { IndoorNavMapLayers } from '@/components/Map/indoor-nav-map-layers.web'
import {
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	MAP_CAMERA,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode
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
	fitBoundsLngLatPair,
	isCompactMapViewport,
	legBoundsCameraOptions,
	type NavCameraCommand,
	stairEnterCameraStop,
	stairExitFlatEaseStop
} from '@/utils/indoor-nav'
import { runAfterMapCamera } from '@/utils/indoor-nav/run-after-map-camera'
import {
	getMapFocusPadding,
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

function runAfterMapCommit(fn: () => void): void {
	setTimeout(fn, 0)
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
	indoorMapLayers: IndoorNavMapLayersData | null
	cameraNavRequestId: number
	cameraNavCommand: NavCameraCommand | null
	onNavCameraIdle?: () => void
	navShowGhostCutaway?: boolean
	floorPlanDimmed?: boolean
	suppressSelectionCameraFocus?: boolean
	indoorNavActive?: boolean
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
		...(element == null ? { bearing: 0, pitch: 0 } : {}),
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
	overlayFloor,
	indoorMapLayers,
	cameraNavRequestId,
	cameraNavCommand,
	onNavCameraIdle,
	navShowGhostCutaway = false,
	floorPlanDimmed = false,
	suppressSelectionCameraFocus = false,
	indoorNavActive = false
}: WebMapCanvasProps): React.JSX.Element {
	const mapRef = useRef<MapRef | null>(null)
	const { width: windowWidth } = useWindowDimensions()
	const reducedMotion = usePrefersReducedMotion()

	useEffect(() => {
		const map = mapRef.current?.getMap()
		if (map == null) {
			return
		}
		map.setMaxZoom(MAP_CAMERA.maxZoom)
	}, [])

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
			const map = mapRef.current?.getMap()
			if (map == null) {
				done()
				return
			}
			const pad = getMapFocusPadding(padding)
			const compact = isCompactMapViewport(windowWidth)
			map.stop()
			if (command.kind === 'stair-enter') {
				const stop = stairEnterCameraStop(command.at, compact, reducedMotion)
				map.flyTo({
					center: stop.center,
					zoom: stop.zoom,
					pitch: stop.pitch,
					bearing: stop.bearing,
					duration: stop.duration,
					curve: stop.curve,
					padding: pad
				})
				runAfterMapCamera(map, stop.duration, done)
				return
			}
			if (command.resetFromStairs) {
				const stop = stairExitFlatEaseStop(command.bounds, reducedMotion)
				map.easeTo({
					center: stop.center,
					zoom: stop.zoom,
					pitch: stop.pitch,
					bearing: stop.bearing,
					duration: stop.duration,
					padding: pad
				})
				runAfterMapCamera(map, stop.duration, done)
				return
			}
			const duration = legBoundsCameraOptions(reducedMotion).duration
			map.fitBounds(fitBoundsLngLatPair(command.bounds), {
				padding: pad,
				maxZoom: MAP_CAMERA.maxZoom,
				duration,
				pitch: 0,
				bearing: 0
			})
			runAfterMapCamera(map, duration, done)
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
			setWebMapView(mapRef, mapCenter, element, padding)
		}
	})

	const handleMapDragStart = useCallback(() => {
		runAfterMapCommit(() => onRegionChange(true))
	}, [onRegionChange])

	const handleMapClick = (event: MapMouseEvent): void => {
		if (!filteredGeoJSON || !mapRef.current) {
			return
		}

		const map = mapRef.current.getMap()
		const features = map.queryRenderedFeatures(event.point, {
			layers: [MAP_IDS.layers.allRoomsFill]
		})
		handleRoomSelection(features)
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
				maxZoom={MAP_CAMERA.maxZoom}
				ref={mapRef}
				onLoad={() => {
					runAfterMapCommit(() => setMapLoadState(LoadingState.LOADED))
				}}
				onError={() => {
					runAfterMapCommit(() => {
						setMapLoadState((state) =>
							state === LoadingState.LOADED ? state : LoadingState.ERROR
						)
					})
				}}
				onClick={handleMapClick}
				onDragStart={handleMapDragStart}
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
						layout={layerStyles.selectedOutline.layout}
						paint={layerStyles.selectedOutline.paint}
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
						layout={layerStyles.allRoomsOutline.layout}
						paint={layerStyles.allRoomsOutline.paint}
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
							layout={outgoingStyles.allRoomsOutline.layout}
							paint={outgoingStyles.allRoomsOutline.paint}
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
						layout={layerStyles.availableRoomsOutline.layout}
						paint={layerStyles.availableRoomsOutline.paint}
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
							layout={outgoingStyles.availableRoomsOutline.layout}
							paint={outgoingStyles.availableRoomsOutline.paint}
							beforeId={MAP_IDS.layers.allRoomsFill}
						/>
					</Source>
				)}
				{selectedRoomCenter != null && clickedElement != null && (
					<Marker
						longitude={selectedRoomCenter[0]}
						latitude={selectedRoomCenter[1]}
						anchor={
							clickedElement.type === SEARCH_TYPES.BUILDING
								? 'center'
								: 'bottom'
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
				{mapLoadState === LoadingState.LOADED && (
					<IndoorNavMapLayers
						layers={indoorMapLayers}
						overlayFloor={overlayFloor}
						primaryColor={primaryColor}
						mapMode={mapMode}
						showGhostCutaway={navShowGhostCutaway}
						stackCutawayLayers={indoorNavActive}
					/>
				)}
			</Map>
		</div>
	)
}
