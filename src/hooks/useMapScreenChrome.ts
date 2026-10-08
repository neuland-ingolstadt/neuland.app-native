import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import {
	DETAIL_HIDDEN,
	DETAIL_OPEN,
	DETAIL_PICK_START,
	DETAIL_PICK_START_SEARCH,
	detentHeight,
	getMapDetailDetents,
	getMapSearchDetents,
	SEARCH_HALF,
	SEARCH_HIDDEN
} from '@/components/Map/sheet-detents'
import { useMapDetailSheet } from '@/hooks/useMapDetailSheet'
import { useMapIndoorNav } from '@/hooks/useMapIndoorNav'
import { useMapScreenModel } from '@/hooks/useMapScreenModel'
import { useOsmAttributionFade } from '@/hooks/useOsmAttributionFade'
import type { SelectMapElement } from '@/types/map'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

interface UseMapScreenChromeOptions {
	onTabPress?: () => void
}

/** Base camera padding above the indoor nav HUD (excluding tab bar). */
const NAV_HUD_FOCUS_PADDING_BASE = 200

export function useMapScreenChrome({
	onTabPress
}: UseMapScreenChromeOptions = {}) {
	const { t } = useTranslation('common')
	const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
	const { theme: activeTheme } = useUniwind()
	const isDark = activeTheme === 'dark'
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const selectionColor = String(
		toColor(useCSSVariable('--color-text')) ?? '#1c1c1e'
	)
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)
	const { height: windowHeight } = useWindowDimensions()
	const searchDetents = useMemo(
		() => getMapSearchDetents(windowHeight),
		[windowHeight]
	)
	const detailDetents = useMemo(
		() => getMapDetailDetents(windowHeight),
		[windowHeight]
	)
	const [searchIndex, setSearchIndex] = useState(SEARCH_HALF)
	const currentPosition = useSharedValue(
		detentHeight(searchDetents[SEARCH_HALF])
	)
	const currentPositionModal = useSharedValue(0)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const { opacity, onRegionChange } = useOsmAttributionFade(
		mapLoadState === LoadingState.LOADED
	)

	const toggleShowAllFloors = useCallback((): void => {
		setShowAllFloors((previous) => !previous)
	}, [])
	const hideSearchSheet = useCallback(() => {
		setSearchIndex(SEARCH_HIDDEN)
	}, [])
	const restoreSearchSheet = useCallback(() => {
		setSearchIndex(SEARCH_HALF)
	}, [])
	const presentDetailSheetRef = useRef<() => void>(() => {})
	const handlePresentModalPress = useCallback(() => {
		setSearchIndex(SEARCH_HIDDEN)
		presentDetailSheetRef.current()
	}, [])

	const {
		mapCenter,
		overlayError,
		allRooms,
		buildingGeoJSON,
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		clickedElement,
		currentFloor,
		selectMapElement,
		roomData,
		allSections,
		handleSheetChangesModal
	} = useMapScreenModel({
		mapLoadState,
		hideSearchSheet,
		restoreSearchSheet,
		handlePresentModalPress,
		notificationColor
	})

	const {
		detailIndex,
		handleDetailIndexChange,
		hideDetailSheet,
		presentDetailSheet,
		cameraResetRequestId
	} = useMapDetailSheet({
		handleSheetChangesModal,
		onTabPress
	})

	const {
		indoorMapLayers,
		navMode,
		navFloors,
		navCameraRequestId,
		navCameraCommand,
		onNavCameraIdle,
		navShowGhostCutaway,
		navFloorPlanDimmed,
		suppressSelectionCameraFocus,
		pickStartActive,
		pickStartMapPin,
		detailPickStart,
		onPickStartEntrancePress,
		tryPickStartFromMapRoom,
		clearPickStart,
		mergedSections
	} = useMapIndoorNav({
		clickedElement,
		overlayFloor: currentFloor?.floor ?? 'EG',
		allSections,
		hideDetailSheet,
		presentDetailSheet,
		hideSearchSheet,
		restoreSearchSheet
	})

	useLayoutEffect(() => {
		presentDetailSheetRef.current = presentDetailSheet
	}, [presentDetailSheet])

	const selectMapElementForSearch: SelectMapElement = useCallback(
		(options) => {
			if (navMode != null) {
				return
			}
			selectMapElement(options)
		},
		[navMode, selectMapElement]
	)

	const selectMapElementForMap: SelectMapElement = useCallback(
		(options) => {
			if (pickStartActive) {
				tryPickStartFromMapRoom(
					options.room,
					options.floor ?? currentFloor?.floor ?? 'EG',
					options.center
				)
				return
			}
			if (navMode != null) {
				return
			}
			selectMapElement(options)
		},
		[
			currentFloor?.floor,
			navMode,
			pickStartActive,
			selectMapElement,
			tryPickStartFromMapRoom
		]
	)

	useEffect(() => {
		if (pickStartActive) {
			return
		}
		if (clickedElement == null) {
			return
		}
		if (
			detailIndex !== DETAIL_PICK_START &&
			detailIndex !== DETAIL_PICK_START_SEARCH
		) {
			return
		}
		presentDetailSheet(DETAIL_OPEN)
	}, [clickedElement, detailIndex, pickStartActive, presentDetailSheet])

	useEffect(() => {
		if (navMode != null || clickedElement != null) {
			return
		}
		if (searchIndex === SEARCH_HIDDEN) {
			restoreSearchSheet()
		}
	}, [clickedElement, navMode, restoreSearchSheet, searchIndex])

	const handleDetailIndexChangeWithNav = useCallback(
		(next: number) => {
			if (next === DETAIL_HIDDEN) {
				clearPickStart()
			}
			handleDetailIndexChange(next)
		},
		[clearPickStart, handleDetailIndexChange]
	)

	const focusPaddingBottom = suppressSelectionCameraFocus
		? NAV_HUD_FOCUS_PADDING_BASE
		: clickedElement != null
			? detentHeight(
					detailDetents[
						detailPickStart.active
							? detailPickStart.searching
								? DETAIL_PICK_START_SEARCH
								: DETAIL_PICK_START
							: DETAIL_OPEN
					]
				)
			: 0

	const animatedStyles = useAnimatedStyle(() => {
		const sheetFromBottom =
			clickedElement != null
				? currentPositionModal.get()
				: currentPosition.get()

		return {
			bottom: sheetFromBottom,
			height: opacity.get() === 0 ? 0 : 'auto',
			opacity: opacity.get()
		}
	})

	const mapMode: 'dark' | 'light' = isDark ? 'dark' : 'light'

	const theme = useMemo(
		() => ({
			t,
			isDark,
			mapMode,
			primaryColor,
			selectionColor,
			labelColor,
			backgroundColor
		}),
		[
			backgroundColor,
			isDark,
			labelColor,
			mapMode,
			primaryColor,
			selectionColor,
			t
		]
	)

	const status = useMemo(
		() => ({ mapLoadState, setMapLoadState, overlayError, mapCenter }),
		[mapCenter, mapLoadState, overlayError, setMapLoadState]
	)

	const sheets = useMemo(
		() => ({
			searchDetents,
			detailDetents,
			searchIndex,
			setSearchIndex,
			currentPosition,
			currentPositionModal,
			showAllFloors,
			toggleShowAllFloors,
			onRegionChange,
			animatedStyles,
			detailIndex,
			handleDetailIndexChange: handleDetailIndexChangeWithNav,
			cameraResetRequestId,
			focusPaddingBottom
		}),
		[
			animatedStyles,
			cameraResetRequestId,
			currentPosition,
			currentPositionModal,
			detailDetents,
			detailIndex,
			focusPaddingBottom,
			handleDetailIndexChangeWithNav,
			onRegionChange,
			searchDetents,
			searchIndex,
			setSearchIndex,
			showAllFloors,
			toggleShowAllFloors
		]
	)

	const selection = useMemo(
		() => ({
			allRooms,
			buildingGeoJSON,
			uniqueEtages,
			floorPickerFloors: navFloors ?? uniqueEtages,
			filteredGeoJSON,
			availableFilteredGeoJSON,
			clickedElement,
			currentFloor,
			selectMapElement: selectMapElementForMap,
			selectMapElementForSearch,
			roomData,
			allSections: mergedSections
		}),
		[
			allRooms,
			availableFilteredGeoJSON,
			buildingGeoJSON,
			clickedElement,
			currentFloor,
			filteredGeoJSON,
			mergedSections,
			navFloors,
			roomData,
			selectMapElementForMap,
			selectMapElementForSearch,
			uniqueEtages
		]
	)

	const nav = useMemo(
		() => ({
			indoorMapLayers,
			navMode,
			detailPickStart,
			onPickStartEntrancePress,
			pickStartMapPin,
			navCameraRequestId,
			navCameraCommand,
			onNavCameraIdle,
			navShowGhostCutaway,
			navFloorPlanDimmed,
			suppressSelectionCameraFocus
		}),
		[
			detailPickStart,
			indoorMapLayers,
			navCameraCommand,
			navCameraRequestId,
			navFloorPlanDimmed,
			navMode,
			navShowGhostCutaway,
			onNavCameraIdle,
			onPickStartEntrancePress,
			pickStartMapPin,
			suppressSelectionCameraFocus
		]
	)

	return { theme, status, sheets, selection, nav }
}
