import { useNavigation } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Appearance,
	LayoutAnimation,
	Linking,
	Pressable,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import WebMapCanvas from '@/components/Map/map-canvas.web'
import {
	DETAIL_HIDDEN,
	DETAIL_OPEN,
	getMapDetailDetents,
	getMapSearchDetents,
	SEARCH_HALF,
	SEARCH_HIDDEN
} from '@/components/Map/sheet-detents'
import { useMapScreenModel } from '@/hooks/useMapScreenModel'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import LoadingIndicator from '../Universal/loading-indicator'

const MapScreen = (): React.JSX.Element => {
	const navigation = useNavigation()
	const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
	const { theme: activeTheme } = useUniwind()
	const isDark = activeTheme === 'dark'
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
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
	const [detailIndex, setDetailIndex] = useState(DETAIL_HIDDEN)
	const currentPosition = useSharedValue(searchDetents[SEARCH_HALF] ?? 0)
	const currentPositionModal = useSharedValue(0)
	const [showAllFloors, setShowAllFloors] = useState(false)

	const [isVisible, setIsVisible] = useState(true)
	const [cameraResetRequestId, setCameraResetRequestId] = useState(0)
	const opacity = useSharedValue(1)
	const fadeOutStarted = useRef(false)

	const toggleShowAllFloors = (): void => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		setShowAllFloors(!showAllFloors)
	}

	const hideSearchSheet = useCallback(() => {
		setSearchIndex(SEARCH_HIDDEN)
	}, [])
	const restoreSearchSheet = useCallback(() => {
		setSearchIndex(SEARCH_HALF)
	}, [])
	const handlePresentModalPress = useCallback(() => {
		setSearchIndex(SEARCH_HIDDEN)
		setDetailIndex(DETAIL_OPEN)
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

	const detailIndexRef = useRef(detailIndex)
	detailIndexRef.current = detailIndex

	const handleDetailIndexChange = useCallback(
		(next: number) => {
			const wasOpen = detailIndexRef.current !== DETAIL_HIDDEN
			setDetailIndex(next)
			if (wasOpen && next === DETAIL_HIDDEN) {
				handleSheetChangesModal()
			}
		},
		[handleSheetChangesModal]
	)

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

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			handleDetailIndexChange(DETAIL_HIDDEN)
		})

		return () => {
			subscription.remove()
		}
	}, [handleDetailIndexChange])

	useEffect(() => {
		// @ts-expect-error wrong type
		const unsubscribe = navigation.addListener('tabPress', () => {
			handleDetailIndexChange(DETAIL_HIDDEN)
			setCameraResetRequestId((previous) => previous + 1)
		})

		return unsubscribe
	}, [handleDetailIndexChange, navigation])

	useEffect(() => {
		if (clickedElement != null && currentFloor?.manual === true) {
			handleDetailIndexChange(DETAIL_HIDDEN)
		}
	}, [clickedElement, currentFloor, handleDetailIndexChange])

	const layerStyles = {
		osmBackground: {
			backgroundColor: isDark
				? 'rgba(166, 173, 181, 0.70)'
				: 'rgba(218, 218, 218, 0.70)',
			paddingHorizontal: 4,
			borderRadius: 4
		}
	}

	const [regionChange, setRegionChange] = useState<boolean>(false)

	useEffect(() => {
		// As required by the OSM attribution, the attribution must be displayed until the user interacts with the map or 5 seconds after the map has loaded
		let timer: ReturnType<typeof setTimeout>
		const startFadeOut = (): void => {
			if (fadeOutStarted.current) {
				return
			}
			fadeOutStarted.current = true
			opacity.set(
				withTiming(0, { duration: 500 }, () => {
					runOnJS(setIsVisible)(false)
				})
			)
		}

		if (regionChange) {
			startFadeOut()
		} else if (isVisible) {
			timer = setTimeout(() => {
				startFadeOut()
			}, 5000)
		}

		return () => {
			clearTimeout(timer)
		}
	}, [regionChange, isVisible, opacity])

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
				labelColor={labelColor}
				backgroundColor={backgroundColor}
				onRegionChange={setRegionChange}
			/>
			{overlayError === null && (
				<FloorPicker
					floors={uniqueEtages}
					showAllFloors={showAllFloors}
					toggleShowAllFloors={toggleShowAllFloors}
				/>
			)}
			{mapLoadState === LoadingState.LOADED && (
				<Animated.View
					className="items-end h-[30px] me-1 absolute right-0 z-[99]"
					style={animatedStyles}
				>
					<Pressable
						onPress={() => {
							void Linking.openURL('https://www.openstreetmap.org/copyright')
						}}
						style={layerStyles.osmBackground}
					>
						<Text
							className="text-[13px]"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{'© OpenStreetMap'}
						</Text>
					</Pressable>
				</Animated.View>
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
