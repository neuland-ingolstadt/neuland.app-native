import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
	EMPTY_MAP_FEATURES,
	getMapLayerStyles,
	type MapMode
} from '@/components/Map/map-config'
import { useFloorOverlaySlide } from '@/hooks/useFloorOverlaySlide'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useMapSelectionPop } from '@/hooks/useMapSelectionPop'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import type { FitBounds } from '@/utils/indoor-nav'
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
	/** Hide map-marker pin and selected-room fill (e.g. during indoor nav). */
	suppressRoomSelection?: boolean
	/** Hide primary-colored free-room overlay (e.g. during indoor nav). */
	hideAvailableRooms?: boolean
}

interface UseMapCameraSyncOptions {
	mapLoadState: LoadingState
	cameraResetRequestId: number
	cameraFitRequestId?: number
	cameraFitBounds?: FitBounds | null
	suppressSelectionFocus?: boolean
	mapCenter: MapScreenModel['mapCenter']
	clickedElement: MapScreenModel['clickedElement']
	focusPaddingBottom: number
	flyTo: (element: ClickedMapElement | null, focusPaddingBottom: number) => void
	fitTo?: (bounds: FitBounds, focusPaddingBottom: number) => void
}

export function useMapCameraSync({
	mapLoadState,
	cameraResetRequestId,
	cameraFitRequestId = 0,
	cameraFitBounds = null,
	suppressSelectionFocus = false,
	mapCenter,
	clickedElement,
	focusPaddingBottom,
	flyTo,
	fitTo
}: UseMapCameraSyncOptions): void {
	const flyToRef = useRef(flyTo)
	const fitToRef = useRef(fitTo)

	useLayoutEffect(() => {
		flyToRef.current = flyTo
	}, [flyTo])

	useLayoutEffect(() => {
		fitToRef.current = fitTo
	}, [fitTo])

	useEffect(() => {
		if (
			suppressSelectionFocus ||
			mapLoadState !== LoadingState.LOADED ||
			clickedElement == null
		) {
			return
		}
		flyToRef.current(clickedElement, focusPaddingBottom)
	}, [
		clickedElement,
		focusPaddingBottom,
		mapCenter,
		mapLoadState,
		suppressSelectionFocus
	])

	useEffect(() => {
		if (cameraResetRequestId > 0 && mapLoadState === LoadingState.LOADED) {
			flyToRef.current(null, 0)
		}
	}, [cameraResetRequestId, mapCenter, mapLoadState])

	useEffect(() => {
		if (
			cameraFitRequestId > 0 &&
			cameraFitBounds != null &&
			fitToRef.current != null &&
			mapLoadState === LoadingState.LOADED
		) {
			fitToRef.current(cameraFitBounds, focusPaddingBottom)
		}
	}, [cameraFitBounds, cameraFitRequestId, focusPaddingBottom, mapLoadState])
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
	backgroundColor,
	suppressRoomSelection = false,
	hideAvailableRooms = false
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
		availableRooms: hideAvailableRooms
			? EMPTY_MAP_FEATURES
			: availableFilteredGeoJSON
	})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()

	const layerStyles = useMemo(
		() =>
			getMapLayerStyles(
				isDark,
				primaryColor,
				labelColor,
				backgroundColor,
				incoming.opacity,
				incoming.fadeDuration,
				selectionPop,
				selectionColor
			),
		[
			isDark,
			primaryColor,
			labelColor,
			backgroundColor,
			incoming.opacity,
			incoming.fadeDuration,
			selectionPop,
			selectionColor
		]
	)
	const outgoingStyles = useMemo(
		() =>
			outgoing == null
				? null
				: getMapLayerStyles(
						isDark,
						primaryColor,
						labelColor,
						backgroundColor,
						outgoing.opacity,
						outgoing.fadeDuration
					),
		[
			isDark,
			primaryColor,
			labelColor,
			backgroundColor,
			outgoing?.opacity,
			outgoing?.fadeDuration,
			outgoing
		]
	)
	const selectedRoomCenter = suppressRoomSelection
		? undefined
		: parseMapCoordinate(clickedElement?.center)
	const selectedFeatures = suppressRoomSelection
		? []
		: getSelectedMapFeatures(clickedElement, filteredGeoJSON)

	const handleRoomSelection = (
		features: Parameters<typeof getRoomSelectionFromFeatures>[0]
	): boolean => {
		const selection = getRoomSelectionFromFeatures(features)
		if (selection == null) {
			return false
		}
		if (suppressRoomSelection) {
			return true
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
