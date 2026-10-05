import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import {
	DETAIL_OPEN,
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

	const toggleShowAllFloors = (): void => {
		setShowAllFloors(!showAllFloors)
	}
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
		clickedElement,
		currentFloor,
		handleSheetChangesModal,
		onTabPress
	})

	const {
		indoorMapLayers,
		navMode,
		navCameraRequestId,
		navCameraCommand,
		onNavCameraIdle,
		navShowGhostCutaway,
		navFloorPlanDimmed,
		suppressSelectionCameraFocus,
		mergedSections
	} = useMapIndoorNav({
		clickedElement,
		overlayFloor: currentFloor?.floor ?? 'EG',
		allSections,
		hideDetailSheet,
		setSearchIndex,
		searchHiddenIndex: SEARCH_HIDDEN,
		searchHalfIndex: SEARCH_HALF
	})

	useLayoutEffect(() => {
		presentDetailSheetRef.current = presentDetailSheet
	}, [presentDetailSheet])

	const selectMapElementGuarded: SelectMapElement = useCallback(
		(options) => {
			if (navMode != null) {
				return
			}
			selectMapElement(options)
		},
		[navMode, selectMapElement]
	)

	const focusPaddingBottom = suppressSelectionCameraFocus
		? NAV_HUD_FOCUS_PADDING_BASE
		: clickedElement != null
			? detentHeight(detailDetents[DETAIL_OPEN])
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

	return {
		t,
		mapLoadState,
		setMapLoadState,
		isDark,
		mapMode,
		primaryColor,
		selectionColor,
		labelColor,
		backgroundColor,
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
		mapCenter,
		overlayError,
		allRooms,
		buildingGeoJSON,
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		clickedElement,
		currentFloor,
		selectMapElement: selectMapElementGuarded,
		roomData,
		allSections: mergedSections,
		indoorMapLayers,
		navMode,
		navCameraRequestId,
		navCameraCommand,
		onNavCameraIdle,
		navShowGhostCutaway,
		navFloorPlanDimmed,
		suppressSelectionCameraFocus,
		detailIndex,
		handleDetailIndexChange,
		cameraResetRequestId,
		focusPaddingBottom
	}
}
