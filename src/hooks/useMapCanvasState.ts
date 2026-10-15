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
import type { NavCameraCommand } from '@/utils/indoor-nav'
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
	/** Secondary start pin / room tint while picking a route start (destination unchanged). */
	pickStartSelection?: MapScreenModel['clickedElement'] | null
	selectMapElement: MapScreenModel['selectMapElement']
	mapMode: MapMode
	primaryColor: string
	selectionColor: string
	labelColor: string
	backgroundColor: string
	/** Hide map-marker pin, selected-room fill and free-room overlay (e.g. during indoor nav). */
	suppressRoomSelection?: boolean
	/** Dim the flat floor plan during the stairs cutaway moment. */
	floorPlanDimmed?: boolean
}

export type RunNavCamera = (
	command: NavCameraCommand,
	focusPaddingBottom: number,
	onComplete: () => void
) => void

interface UseMapCameraSyncOptions {
	mapLoadState: LoadingState
	cameraResetRequestId: number
	cameraNavRequestId?: number
	cameraNavCommand?: NavCameraCommand | null
	onNavCameraIdle?: () => void
	runNavCamera?: RunNavCamera
	suppressSelectionFocus?: boolean
	mapCenter: MapScreenModel['mapCenter']
	clickedElement: MapScreenModel['clickedElement']
	focusPaddingBottom: number
	flyTo: (element: ClickedMapElement | null, focusPaddingBottom: number) => void
}

export function useMapCameraSync({
	mapLoadState,
	cameraResetRequestId,
	cameraNavRequestId = 0,
	cameraNavCommand = null,
	onNavCameraIdle,
	runNavCamera,
	suppressSelectionFocus = false,
	mapCenter,
	clickedElement,
	focusPaddingBottom,
	flyTo
}: UseMapCameraSyncOptions): void {
	const flyToRef = useRef(flyTo)
	const runNavCameraRef = useRef(runNavCamera)
	const onNavCameraIdleRef = useRef(onNavCameraIdle)
	const navCameraCommandRef = useRef(cameraNavCommand)
	const focusPaddingRef = useRef(focusPaddingBottom)

	navCameraCommandRef.current = cameraNavCommand
	focusPaddingRef.current = focusPaddingBottom

	useLayoutEffect(() => {
		flyToRef.current = flyTo
	}, [flyTo])

	useLayoutEffect(() => {
		runNavCameraRef.current = runNavCamera
	}, [runNavCamera])

	useLayoutEffect(() => {
		onNavCameraIdleRef.current = onNavCameraIdle
	}, [onNavCameraIdle])

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
			cameraNavRequestId <= 0 ||
			mapLoadState !== LoadingState.LOADED ||
			runNavCameraRef.current == null
		) {
			return
		}
		const command = navCameraCommandRef.current
		if (command == null) {
			return
		}
		runNavCameraRef.current(command, focusPaddingRef.current, () => {
			onNavCameraIdleRef.current?.()
		})
	}, [cameraNavRequestId, mapLoadState])
}

export function useMapCanvasState({
	overlayFloor,
	filteredGeoJSON,
	availableFilteredGeoJSON,
	clickedElement,
	pickStartSelection = null,
	selectMapElement,
	mapMode,
	primaryColor,
	selectionColor,
	labelColor,
	backgroundColor,
	suppressRoomSelection = false,
	floorPlanDimmed = false
}: UseMapCanvasStateOptions): {
	incoming: ReturnType<typeof useFloorOverlaySlide>['incoming']
	outgoing: ReturnType<typeof useFloorOverlaySlide>['outgoing']
	selectionPop: boolean
	triggerSelectionPop: () => void
	layerStyles: ReturnType<typeof getMapLayerStyles>
	outgoingStyles: ReturnType<typeof getMapLayerStyles> | null
	selectedRoomCenter: ReturnType<typeof parseMapCoordinate>
	selectedFeatures: ReturnType<typeof getSelectedMapFeatures>
	pickStartRoomCenter: ReturnType<typeof parseMapCoordinate>
	pickStartFeatures: ReturnType<typeof getSelectedMapFeatures>
	pickStartElement: ClickedMapElement | null
	selectionElement: ClickedMapElement | null
	isDark: boolean
	handleRoomSelection: (
		features: Parameters<typeof getRoomSelectionFromFeatures>[0]
	) => boolean
} {
	const isDark = mapMode === 'dark'
	const { incoming, outgoing } = useFloorOverlaySlide({
		floor: overlayFloor,
		rooms: filteredGeoJSON,
		availableRooms: suppressRoomSelection
			? EMPTY_MAP_FEATURES
			: availableFilteredGeoJSON
	})
	const { selectionPop, triggerSelectionPop } = useMapSelectionPop()
	const selectionElement = suppressRoomSelection ? null : clickedElement
	const pickStartElement =
		suppressRoomSelection || pickStartSelection == null
			? null
			: pickStartSelection
	const prevDisplaySelectionRef = useRef(selectionElement?.data)

	useEffect(() => {
		if (suppressRoomSelection) {
			return
		}
		const nextKey = selectionElement?.data
		if (nextKey != null && nextKey !== prevDisplaySelectionRef.current) {
			triggerSelectionPop()
		}
		prevDisplaySelectionRef.current = nextKey
	}, [selectionElement?.data, suppressRoomSelection, triggerSelectionPop])

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
				selectionColor,
				floorPlanDimmed
			),
		[
			isDark,
			primaryColor,
			labelColor,
			backgroundColor,
			incoming.opacity,
			incoming.fadeDuration,
			selectionPop,
			selectionColor,
			floorPlanDimmed
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
						outgoing.fadeDuration,
						selectionPop,
						selectionColor,
						floorPlanDimmed
					),
		[
			isDark,
			primaryColor,
			labelColor,
			backgroundColor,
			outgoing,
			selectionPop,
			selectionColor,
			floorPlanDimmed
		]
	)

	const selectedRoomCenter = suppressRoomSelection
		? undefined
		: parseMapCoordinate(selectionElement?.center)
	const selectedFeatures = suppressRoomSelection
		? []
		: getSelectedMapFeatures(selectionElement, filteredGeoJSON)
	const pickStartRoomCenter = parseMapCoordinate(pickStartElement?.center)
	const pickStartFeatures =
		pickStartElement == null
			? []
			: getSelectedMapFeatures(pickStartElement, filteredGeoJSON)

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
		pickStartRoomCenter,
		pickStartFeatures,
		pickStartElement,
		selectionElement,
		isDark,
		handleRoomSelection
	}
}
