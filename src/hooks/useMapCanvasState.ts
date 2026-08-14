import { useEffect, useRef } from 'react'
import { getMapLayerStyles, type MapMode } from '@/components/Map/map-config'
import { useFloorOverlaySlide } from '@/hooks/useFloorOverlaySlide'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useMapSelectionPop } from '@/hooks/useMapSelectionPop'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import {
	getRoomSelectionFromFeatures,
	getSelectedMapFeatures,
	parseMapCoordinate
} from '@/utils/map-screen-utils'
import { LoadingState } from '@/utils/ui-utils'

interface UseMapCanvasStateOptions {
	overlayFloor: string
	filteredGeoJSON: MapScreenModel['filteredGeoJSON']
	availableFilteredGeoJSON: MapScreenModel['availableFilteredGeoJSON']
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
	flyToRef.current = flyTo

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED) {
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
	isDark: boolean
	handleRoomSelection: (
		features: Parameters<typeof getRoomSelectionFromFeatures>[0]
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

	return {
		incoming,
		outgoing,
		selectionPop,
		triggerSelectionPop,
		layerStyles,
		outgoingStyles,
		selectedRoomCenter,
		selectedFeatures,
		isDark,
		handleRoomSelection
	}
}
