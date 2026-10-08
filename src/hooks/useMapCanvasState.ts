import type { FeatureCollection } from 'geojson'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { getMapLayerStyles, type MapMode } from '@/components/Map/map-config'
import { useFloorOverlaySlide } from '@/hooks/useFloorOverlaySlide'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useMapSelectionPop } from '@/hooks/useMapSelectionPop'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import {
	excludeEntrancesNearPoint,
	getEntranceSelectionFromFeatures,
	getRoomSelectionFromFeatures,
	getSelectedBuildingEntrances,
	getSelectedMapFeatures,
	parseMapCoordinate,
	splitEntrancesByStyle
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'

interface UseMapCanvasStateOptions {
	overlayFloor: string
	filteredGeoJSON: MapScreenModel['filteredGeoJSON']
	availableFilteredGeoJSON: MapScreenModel['availableFilteredGeoJSON']
	allRooms: MapScreenModel['allRooms']
	mapEntrances: MapScreenModel['mapEntrances']
	clickedElement: MapScreenModel['clickedElement']
	selectMapElement: MapScreenModel['selectMapElement']
	mapMode: MapMode
	primaryColor: string
	selectionColor: string
	labelColor: string
	backgroundColor: string
}

interface UseMapCameraSyncOptions {
	mapLoadState: LoadingState
	cameraResetRequestId: number
	mapCenter: MapScreenModel['mapCenter']
	clickedElement: MapScreenModel['clickedElement']
	focusPaddingBottom: number
	flyTo: (element: ClickedMapElement | null, focusPaddingBottom: number) => void
}

export function useMapCameraSync({
	mapLoadState,
	cameraResetRequestId,
	mapCenter,
	clickedElement,
	focusPaddingBottom,
	flyTo
}: UseMapCameraSyncOptions): void {
	const flyToRef = useRef(flyTo)

	useLayoutEffect(() => {
		flyToRef.current = flyTo
	}, [flyTo])

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED || clickedElement == null) {
			return
		}
		flyToRef.current(clickedElement, focusPaddingBottom)
	}, [clickedElement, focusPaddingBottom, mapCenter, mapLoadState])

	useEffect(() => {
		if (cameraResetRequestId > 0 && mapLoadState === LoadingState.LOADED) {
			flyToRef.current(null, 0)
		}
	}, [cameraResetRequestId, mapCenter, mapLoadState])
}

export function useMapCanvasState({
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
}: UseMapCanvasStateOptions): {
	incoming: ReturnType<typeof useFloorOverlaySlide>['incoming']
	outgoing: ReturnType<typeof useFloorOverlaySlide>['outgoing']
	selectionPop: boolean
	triggerSelectionPop: () => void
	layerStyles: ReturnType<typeof getMapLayerStyles>
	outgoingStyles: ReturnType<typeof getMapLayerStyles> | null
	selectedRoomCenter: ReturnType<typeof parseMapCoordinate>
	selectedFeatures: ReturnType<typeof getSelectedMapFeatures>
	primaryEntrances: FeatureCollection
	mutedEntrances: FeatureCollection
	isDark: boolean
	handleRoomSelection: (
		features: Parameters<typeof getRoomSelectionFromFeatures>[0]
	) => boolean
	handleEntranceSelection: (
		features: Parameters<typeof getEntranceSelectionFromFeatures>[0]
	) => boolean
} {
	const isDark = mapMode === 'dark'
	const { incoming, outgoing } = useFloorOverlaySlide({
		floor: overlayFloor,
		rooms: filteredGeoJSON,
		availableRooms: availableFilteredGeoJSON
	})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()

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
	const { primary: primaryEntrances, muted: mutedEntrances } = useMemo(() => {
		const selected = getSelectedBuildingEntrances(
			clickedElement,
			mapEntrances,
			allRooms
		)
		// Keep the selected door visible under/above the pin; only cull for room/building pins.
		const visible =
			clickedElement?.type === SEARCH_TYPES.ENTRANCE
				? selected
				: excludeEntrancesNearPoint(selected, selectedRoomCenter)
		return splitEntrancesByStyle(visible)
	}, [allRooms, clickedElement, mapEntrances, selectedRoomCenter])

	const handleRoomSelection = (
		features: Parameters<typeof getRoomSelectionFromFeatures>[0]
	): boolean => {
		const selection = getRoomSelectionFromFeatures(features)
		if (selection == null) {
			return false
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
		return true
	}

	const handleEntranceSelection = (
		features: Parameters<typeof getEntranceSelectionFromFeatures>[0]
	): boolean => {
		const selection = getEntranceSelectionFromFeatures(features)
		if (selection == null) {
			return false
		}
		// No selection-fill pop for entrances — the door icon is the only highlight.
		selectMapElement({
			room: selection.id,
			type: SEARCH_TYPES.ENTRANCE,
			center: selection.center,
			origin: 'MapClick',
			manual: true
		})
		return true
	}

	return {
		incoming,
		outgoing,
		selectionPop,
		triggerSelectionPop,
		layerStyles,
		outgoingStyles,
		selectedRoomCenter,
		selectedFeatures,
		primaryEntrances,
		mutedEntrances,
		isDark,
		handleRoomSelection,
		handleEntranceSelection
	}
}
