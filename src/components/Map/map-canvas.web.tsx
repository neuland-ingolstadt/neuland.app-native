import type { MapRef } from '@vis.gl/react-maplibre'
import {
	Layer,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: TODO
	Map,
	Marker,
	NavigationControl,
	Source
} from '@vis.gl/react-maplibre'
import { DoorClosed } from 'lucide-react-native'
import type { MapMouseEvent } from 'maplibre-gl'
import * as maplibregl from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import type React from 'react'
import { useCallback, useRef } from 'react'
import {
	EMPTY_MAP_FEATURES,
	GEOJSON_TOLERANCE,
	MAP_CAMERA,
	MAP_COLORS,
	MAP_IDS,
	MAP_STYLE_URLS,
	type MapMode
} from '@/components/Map/map-config'
import { useMapCameraSync, useMapCanvasState } from '@/hooks/useMapCanvasState'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import {
	getBuildingSelectionFromFeatures,
	getMapFocusPadding,
	getSelectionFocusZoom,
	isMutedEntrance,
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
	allRooms: MapScreenModel['allRooms']
	mapEntrances: MapScreenModel['mapEntrances']
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
	allRooms,
	mapEntrances,
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
	const {
		incoming,
		outgoing,
		layerStyles,
		outgoingStyles,
		selectedRoomCenter,
		selectedFeatures,
		primaryEntrances,
		mutedEntrances,
		handleRoomSelection,
		handleEntranceSelection
	} = useMapCanvasState({
		overlayFloor,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		allRooms,
		mapEntrances,
		clickedElement,
		selectMapElement,
		mapMode,
		primaryColor,
		selectionColor,
		labelColor,
		backgroundColor
	})

	useMapCameraSync({
		mapLoadState,
		cameraResetRequestId,
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
		if (!mapRef.current) {
			return
		}

		const map = mapRef.current.getMap()
		const buildingSelection = getBuildingSelectionFromFeatures(
			map.queryRenderedFeatures(event.point, {
				layers: [MAP_IDS.layers.buildingLabels]
			})
		)
		if (buildingSelection != null) {
			selectMapElement({
				room: buildingSelection.building,
				type: SEARCH_TYPES.BUILDING,
				center: buildingSelection.center,
				origin: 'MapClick',
				manual: true
			})
			return
		}

		if (!filteredGeoJSON) {
			return
		}
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
				ref={mapRef}
				onLoad={() => {
					runAfterMapCommit(() => setMapLoadState(LoadingState.LOADED))
				}}
				onError={() => {
					runAfterMapCommit(() => setMapLoadState(LoadingState.ERROR))
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
				{[...primaryEntrances.features, ...mutedEntrances.features].map(
					(feature) => {
						if (feature.geometry?.type !== 'Point') {
							return null
						}
						const [longitude, latitude] = feature.geometry.coordinates
						const key = String(
							feature.properties?.id ?? `${longitude},${latitude}`
						)
						const muted = isMutedEntrance(feature.properties)
						return (
							<Marker
								key={key}
								longitude={longitude}
								latitude={latitude}
								anchor="center"
								style={{ cursor: 'pointer', zIndex: 1 }}
								onClick={(event) => {
									event.originalEvent.stopPropagation()
									handleEntranceSelection([feature])
								}}
							>
								<div
									style={{
										width: 26,
										height: 26,
										borderRadius: 13,
										backgroundColor: muted
											? MAP_COLORS.entranceMuted
											: primaryColor,
										border: `2px solid ${backgroundColor}`,
										boxSizing: 'border-box',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									<DoorClosed size={11} color="#ffffff" strokeWidth={2.25} />
								</div>
							</Marker>
						)
					}
				)}
				{selectedRoomCenter != null &&
					clickedElement?.type !== SEARCH_TYPES.BUILDING && (
						<Marker
							key={mapMode}
							longitude={selectedRoomCenter[0]}
							latitude={selectedRoomCenter[1]}
							color={selectionColor}
							style={{ zIndex: 2 }}
						/>
					)}
			</Map>
		</div>
	)
}
