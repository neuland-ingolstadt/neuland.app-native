import type BottomSheet from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { LocationManager } from '@maplibre/maplibre-react-native'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Appearance,
	LayoutAnimation,
	Linking,
	Platform,
	Pressable,
	Text,
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
import NativeMapCanvas from '@/components/Map/map-canvas.native'
import { useMapScreenModel } from '@/hooks/useMapScreenModel'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import LoadingIndicator from '../Universal/loading-indicator'

const MapScreen = (): React.JSX.Element => {
	const navigation = useNavigation()
	const { t } = useTranslation('common')
	const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
	const [mapKey, setMapKey] = useState(0)
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
	const bottomSheetRef = useRef<BottomSheet>(null)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	const currentPosition = useSharedValue(0)
	const currentPositionModal = useSharedValue(0)
	const [disableFollowUser, setDisableFollowUser] = useState(false)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const [locationPermissionGranted, setLocationPermissionGranted] =
		useState(false)
	const [locationRequestId, setLocationRequestId] = useState(0)
	const [cameraResetRequestId, setCameraResetRequestId] = useState(0)
	const [isVisible, setIsVisible] = useState(true)
	const opacity = useSharedValue(1)
	const fadeOutStarted = useRef(false)

	useEffect(() => {
		let cancelled = false
		void LocationManager.requestPermissions()
			.then((granted) => {
				if (!cancelled) {
					setLocationPermissionGranted(granted)
				}
			})
			.catch(() => {
				if (!cancelled) {
					setLocationPermissionGranted(false)
				}
			})

		return () => {
			cancelled = true
		}
	}, [])

	const toggleShowAllFloors = (): void => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		setShowAllFloors(!showAllFloors)
	}
	const handlePresentModalPress = useCallback(() => {
		bottomSheetRef.current?.close()
		bottomSheetModalRef.current?.present()
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
		bottomSheetRef,
		handlePresentModalPress,
		notificationColor
	})

	const animatedStyles = useAnimatedStyle(() => {
		const bottom =
			clickedElement != null
				? currentPositionModal.get()
				: currentPosition.get()

		return {
			transform: [{ translateY: bottom }],
			height: opacity.get() === 0 ? 0 : 'auto',
			opacity: opacity.get()
		}
	})

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			bottomSheetModalRef.current?.close()
		})

		return () => {
			subscription.remove()
		}
	}, [])

	useEffect(() => {
		// @ts-expect-error wrong type
		const unsubscribe = navigation.addListener('tabPress', () => {
			setDisableFollowUser(true)
			bottomSheetModalRef.current?.close()
			setCameraResetRequestId((previous) => previous + 1)
		})

		return unsubscribe
	}, [navigation])

	useEffect(() => {
		if (clickedElement != null && currentFloor?.manual === true) {
			bottomSheetModalRef.current?.close()
		}
	}, [currentFloor])

	useEffect(() => {
		if (clickedElement !== null) {
			setDisableFollowUser(true)
		}
	}, [clickedElement])

	const handleLocate = useCallback(() => {
		if (!locationPermissionGranted) {
			return
		}
		setDisableFollowUser(false)
		setLocationRequestId((previous) => previous + 1)
		bottomSheetModalRef.current?.close()
	}, [locationPermissionGranted])

	const layerStyles = {
		osmBackground: {
			backgroundColor: isDark
				? 'rgba(104, 106, 108, 0.7)'
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

	const handleRefresh = useCallback(() => {
		setMapLoadState(LoadingState.LOADING)
		// Force a reload by incrementing the key
		setMapKey((prev) => prev + 1)
	}, [])

	return (
		<View testID="map-screen" className="flex-1">
			{mapLoadState === LoadingState.ERROR && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<ErrorView
						title={t('error.map.mapLoadError')}
						onButtonPress={handleRefresh}
					/>
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

			<View testID="map-canvas" className="flex-1">
				<NativeMapCanvas
					mapKey={mapKey}
					cameraResetRequestId={cameraResetRequestId}
					mapLoadState={mapLoadState}
					setMapLoadState={setMapLoadState}
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
					locationPermissionGranted={locationPermissionGranted}
					locationRequestId={locationRequestId}
					disableFollowUser={disableFollowUser}
					onRegionChange={setRegionChange}
				/>
				{overlayError === null && (
					<FloorPicker
						floors={uniqueEtages}
						showAllFloors={showAllFloors}
						toggleShowAllFloors={toggleShowAllFloors}
						locationPermissionGranted={locationPermissionGranted}
						onLocate={handleLocate}
					/>
				)}
			</View>

			{mapLoadState === LoadingState.LOADED && (
				<Animated.View
					className="items-end h-[30px] me-1 absolute right-0 z-[99]"
					style={[animatedStyles, { top: Platform.OS === 'ios' ? -19 : -22 }]}
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
				bottomSheetRef={bottomSheetRef}
				currentPosition={currentPosition}
				allRooms={allRooms}
				selectMapElement={selectMapElement}
			/>

			<BottomSheetDetailModal
				bottomSheetModalRef={bottomSheetModalRef}
				handleSheetChangesModal={handleSheetChangesModal}
				currentPositionModal={currentPositionModal}
				roomData={roomData}
				modalSection={allSections}
			/>
		</View>
	)
}

export default MapScreen
