import type React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, View } from 'react-native'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import WebMapCanvas from '@/components/Map/map-canvas.web'
import { OsmCopyright } from '@/components/Map/osm-copyright'
import {
	DETAIL_OPEN,
	detentHeight,
	getMapDetailDetents,
	getMapSearchDetents,
	SEARCH_HALF,
	SEARCH_HIDDEN
} from '@/components/Map/sheet-detents'
import { useMapDetailSheet } from '@/hooks/useMapDetailSheet'
import { useMapScreenModel } from '@/hooks/useMapScreenModel'
import { useOsmAttributionFade } from '@/hooks/useOsmAttributionFade'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import LoadingIndicator from '../Universal/loading-indicator'

const MapScreen = (): React.JSX.Element => {
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
	const { t } = useTranslation('common')
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
		presentDetailSheet,
		cameraResetRequestId
	} = useMapDetailSheet({
		clickedElement,
		currentFloor,
		handleSheetChangesModal
	})
	presentDetailSheetRef.current = presentDetailSheet

	const focusPaddingBottom =
		clickedElement != null ? detentHeight(detailDetents[DETAIL_OPEN]) : 0

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

	return (
		<View testID="map-screen" className="flex-1">
			{mapLoadState === LoadingState.ERROR && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<ErrorView title={t('error.map.mapLoadError')} />
				</View>
			)}
			{mapLoadState === LoadingState.LOADING && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<LoadingIndicator />
				</View>
			)}
			<WebMapCanvas
				setMapLoadState={setMapLoadState}
				mapLoadState={mapLoadState}
				cameraResetRequestId={cameraResetRequestId}
				mapCenter={mapCenter}
				filteredGeoJSON={filteredGeoJSON}
				availableFilteredGeoJSON={availableFilteredGeoJSON}
				buildingGeoJSON={buildingGeoJSON}
				clickedElement={clickedElement}
				selectMapElement={selectMapElement}
				mapMode={isDark ? 'dark' : 'light'}
				primaryColor={primaryColor}
				selectionColor={selectionColor}
				labelColor={labelColor}
				backgroundColor={backgroundColor}
				onRegionChange={onRegionChange}
				focusPaddingBottom={focusPaddingBottom}
				overlayFloor={currentFloor?.floor ?? 'EG'}
			/>
			{overlayError === null && (
				<FloorPicker
					floors={uniqueEtages}
					showAllFloors={showAllFloors}
					toggleShowAllFloors={toggleShowAllFloors}
				/>
			)}
			{mapLoadState === LoadingState.LOADED && (
				<OsmCopyright style={animatedStyles} />
			)}
			<MapBottomSheet
				index={searchIndex}
				onIndexChange={setSearchIndex}
				detents={searchDetents}
				currentPosition={currentPosition}
				allRooms={allRooms}
				selectMapElement={selectMapElement}
			/>
			<BottomSheetDetailModal
				index={detailIndex}
				onIndexChange={handleDetailIndexChange}
				detents={detailDetents}
				currentPositionModal={currentPositionModal}
				roomData={roomData}
				modalSection={allSections}
			/>
		</View>
	)
}

export default MapScreen
