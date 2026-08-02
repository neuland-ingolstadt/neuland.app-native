import type BottomSheet from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { CameraRef } from '@maplibre/maplibre-react-native'
import {
	Camera,
	GeoJSONSource,
	Images,
	Layer,
	LocationManager,
	Map as MapLibreMap,
	NativeUserLocation
} from '@maplibre/maplibre-react-native'
import { router, useNavigation } from 'expo-router'
import type { Position } from 'geojson'
import type React from 'react'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { useMapGeoJsonFilters } from '@/hooks/useMapGeoJsonFilters'
import { useMapQueries } from '@/hooks/useMapQueries'
import { useMapRoomSelection } from '@/hooks/useMapRoomSelection'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import {
	type ClickedMapElement,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import type { NormalizedLecturer } from '@/types/utils'
import { getBuildingData, getRoomData } from '@/utils/map-screen-utils'
import { INGOLSTADT_CENTER, NEUBURG_CENTER } from '@/utils/map-utils'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import LoadingIndicator from '../Universal/loading-indicator'
import { modalSection } from './modal-sections'

const MapScreen = (): React.JSX.Element => {
	const navigation = useNavigation()
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
	const { userKind, userFaculty } = use(UserKindContext)
	const [mapCenter, setMapCenter] = useState<[number, number]>([
		...INGOLSTADT_CENTER
	] as [number, number])
	const { t, i18n } = useTranslation('common')
	const bottomSheetRef = useRef<BottomSheet>(null)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	const currentPosition = useSharedValue(0)
	const currentPositionModal = useSharedValue(0)
	const {
		clickedElement,
		setClickedElement,
		availableRooms,
		roomOpenings,
		currentFloor,
		setCurrentFloor
	} = use(MapContext)
	const [disableFollowUser, setDisableFollowUser] = useState(false)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const cameraRef = useRef<CameraRef>(null)
	const [locationPermissionGranted, setLocationPermissionGranted] = useState(
		Platform.OS !== 'android'
	)

	enum Locations {
		IN = 'Ingolstadt',
		ND = 'Neuburg'
	}
	const lightStyle = 'https://tile.neuland.app/styles/light/style.json'
	const darkStyle = 'https://tile.neuland.app/styles/dark/style.json'

	type LocationsType = Record<string, string>
	const locations: LocationsType = Locations
	const [isVisible, setIsVisible] = useState(true)
	const [tabBarPressed, setTabBarPressed] = useState(false)
	const opacity = useSharedValue(1)

	useEffect(() => {
		if (Platform.OS !== 'android') {
			return
		}

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
	const animatedStyles = useAnimatedStyle(() => {
		const bottom =
			clickedElement != null
				? currentPositionModal.value
				: currentPosition.value

		return {
			transform: [{ translateY: bottom }],
			height: opacity.value === 0 ? 0 : 'auto',
			opacity: opacity.value
		}
	})

	const handleSheetChangesModal = useCallback(() => {
		setClickedElement(null)
		if (currentFloor?.manual !== true) {
			setCurrentFloor({ floor: 'EG', manual: false })
		}
		setView()
		bottomSheetRef.current?.snapToIndex(1)
	}, [currentFloor, mapCenter, setClickedElement, setCurrentFloor])

	const handlePresentModalPress = useCallback(() => {
		bottomSheetRef.current?.close()
		bottomSheetModalRef.current?.present()
	}, [])

	const { mapOverlay, overlayError, lecturers, allRooms, buildingGeoJSON } =
		useMapQueries()

	const { selectRoom } = useMapRoomSelection({
		allRooms,
		mapLoadState,
		handlePresentModalPress,
		bottomSheetRef,
		notificationColor
	})

	const {
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		hasFilteredRooms,
		hasAvailableFilteredRooms
	} = useMapGeoJsonFilters({
		mapOverlay,
		allRooms,
		currentFloor,
		availableRooms
	})

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			bottomSheetModalRef.current?.close()
		})

		return () => {
			subscription.remove()
		}
	})

	useEffect(() => {
		// @ts-expect-error wrong type
		const unsubscribe = navigation.addListener('tabPress', () => {
			setDisableFollowUser(true)
			setTabBarPressed(true)
		})

		return unsubscribe
	}, [navigation])

	useEffect(() => {
		if (tabBarPressed) {
			bottomSheetModalRef.current?.close()
			setView()
			setTabBarPressed(false)
		}
	}, [tabBarPressed])

	useEffect(() => {
		setMapCenter(
			(userFaculty === 'Nachhaltige Infrastruktur'
				? NEUBURG_CENTER
				: INGOLSTADT_CENTER) as [number, number]
		)
	}, [userFaculty])

	useEffect(() => {
		if (clickedElement != null && currentFloor?.manual === true) {
			bottomSheetModalRef.current?.close()
		}
	}, [currentFloor])

	const roomData: RoomData = useMemo(() => {
		switch (clickedElement?.type) {
			case SEARCH_TYPES.ROOM:
				return getRoomData(
					clickedElement.data,
					availableRooms,
					allRooms,
					i18n,
					t,
					roomOpenings
				)
			case SEARCH_TYPES.BUILDING:
				return getBuildingData(clickedElement.data, allRooms, availableRooms, t)

			default:
				return {
					title: t('misc.unknown'),
					subtitle: t('misc.unknown'),
					type: SEARCH_TYPES.ROOM,
					properties: null,
					occupancies: null
				} as RoomData
		}
	}, [clickedElement])

	const setSelectedLecturer = useRouteParamsStore(
		(state) => state.setSelectedLecturer
	)

	const handleOpenLecturer = useCallback(
		(lecturer: NormalizedLecturer) => {
			setSelectedLecturer(lecturer)
			router.navigate('/lecturer')
		},
		[setSelectedLecturer]
	)

	const lecturerSection = useMemo(() => {
		if (clickedElement?.type !== SEARCH_TYPES.ROOM || lecturers == null) {
			return []
		}

		const filtered = lecturers.filter(
			(l) => l.room_short === clickedElement.data
		)

		if (filtered.length === 0) {
			return []
		}

		return [
			{
				header: t('pages.map.details.room.lecturers', {
					ns: 'common'
				}),
				items: filtered.map((l) => ({
					title: `${[l.titel, l.vorname, l.name].join(' ').trim()}`,
					onPress: () => handleOpenLecturer(l)
				}))
			}
		]
	}, [clickedElement, lecturers, handleOpenLecturer])

	const baseSections = useMemo(
		() => modalSection(roomData, locations, userKind === USER_GUEST),
		[roomData, locations, userKind]
	)

	const allSections = useMemo(
		() => [...lecturerSection, ...baseSections],
		[baseSections, lecturerSection]
	)

	function setView(clickedElement: ClickedMapElement | null = null): void {
		if (clickedElement?.center == null) {
			cameraRef.current?.flyTo({
				center: mapCenter,
				zoom: 16.5,
				duration: 400,
				bearing: 0
			})
			return
		}

		const [longitude, latitude] = clickedElement.center
		const adjustedLatitude = latitude - 0.0003
		// Use the adjusted center for flyTo
		cameraRef.current?.flyTo({
			center: [longitude, adjustedLatitude],
			zoom: 17,
			duration: 500
		})
	}

	const [cameraTriggerKey, setCameraTriggerKey] = useState(0)

	useEffect(() => {
		if (mapLoadState !== LoadingState.LOADED || clickedElement == null) {
			return
		}
		setView(clickedElement)
	}, [clickedElement, mapLoadState])

	useEffect(() => {
		setDisableFollowUser(false)
		bottomSheetModalRef.current?.close()
	}, [cameraTriggerKey])

	useEffect(() => {
		if (clickedElement !== null) {
			setDisableFollowUser(true)
		}
	}, [clickedElement])

	const layerStyles = {
		allRooms: {
			'fill-antialias': true,
			'fill-color': isDark ? '#6a7178' : '#a4a4a4',
			'fill-opacity': 0.1
		},
		allRoomsOutline: {
			'line-color': isDark ? '#2d3035' : '#8e8e8e',
			'line-width': 2.3
		},
		availableRooms: {
			'fill-antialias': true,
			'fill-opacity': 0.2
		},
		availableRoomsOutline: {
			'line-width': 2.4
		},
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
			opacity.value = withTiming(0, { duration: 500 }, () => {
				runOnJS(setIsVisible)(false)
			})
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
		<View className="flex-1">
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

			<View className="flex-1" style={{ marginBottom: 0 }}>
				<MapLibreMap
					key={mapKey}
					style={{ flex: 1 }}
					tintColor={Platform.OS === 'ios' ? primaryColor : undefined}
					logo={false}
					mapStyle={isDark ? darkStyle : lightStyle}
					attribution={false}
					onDidFailLoadingMap={() => {
						setMapLoadState(LoadingState.ERROR)
					}}
					onDidFinishLoadingMap={() => {
						setMapLoadState(LoadingState.LOADED)
					}}
					onDidFinishRenderingMapFully={() => {
						setRegionChange(false)
					}}
					onRegionIsChanging={() => {
						setRegionChange(true)
					}}
					compass={Platform.OS === 'ios'}
				>
					<Images
						images={{
							// https://iconduck.com/icons/71717/map-marker - License: Creative Commons Zero v1.0 Universal
							'map-marker': require('@/assets/map-marker.png'),
							pin: 'pin'
						}}
					/>
					<Camera
						ref={cameraRef}
						initialViewState={{
							center: mapCenter,
							zoom: 16.5,
							bearing: 0
						}}
						minZoom={14}
						maxZoom={19}
						trackUserLocation={
							cameraTriggerKey !== 0 &&
							clickedElement == null &&
							!disableFollowUser
								? 'default'
								: undefined
						}
					/>
					{locationPermissionGranted && <NativeUserLocation mode="heading" />}
					{filteredGeoJSON != null && hasFilteredRooms && (
						<GeoJSONSource
							id="allRoomsSource"
							data={filteredGeoJSON}
							onPress={(event) => {
								event.stopPropagation()
								const properties = event.nativeEvent.features[0]?.properties
								if (properties == null) {
									return
								}
								selectRoom({
									room: properties.Raum as string,
									center: properties.center as Position | undefined,
									origin: 'MapClick',
									manual: true
								})
							}}
						>
							<Layer
								id="allRoomsFill"
								type="fill"
								paint={layerStyles.allRooms}
							/>
							<Layer
								id="allRoomsOutline"
								type="line"
								paint={layerStyles.allRoomsOutline}
							/>
						</GeoJSONSource>
					)}
					{availableFilteredGeoJSON != null && hasAvailableFilteredRooms && (
						<GeoJSONSource
							id="availableRoomsSource"
							data={availableFilteredGeoJSON}
						>
							<Layer
								id="availableRoomsFill"
								type="fill"
								paint={{
									...layerStyles.availableRooms,
									'fill-color': primaryColor
								}}
							/>
							<Layer
								id="availableRoomsOutline"
								type="line"
								paint={{
									...layerStyles.availableRoomsOutline,
									'line-color': primaryColor
								}}
							/>
						</GeoJSONSource>
					)}
					{buildingGeoJSON.features.length > 0 && (
						<GeoJSONSource id="buildingLettersSource" data={buildingGeoJSON}>
							<Layer
								id="buildingLettersLayer"
								type="symbol"
								layout={{
									'text-field': ['get', 'Raum'],
									'text-allow-overlap': true,
									'text-size': 14
								}}
								paint={{
									'text-color': labelColor,
									'text-halo-color': backgroundColor,
									'text-halo-width': 1
								}}
							/>
						</GeoJSONSource>
					)}
					{clickedElement !== null && (
						<GeoJSONSource
							id="clickedElementSource"
							data={{
								type: 'FeatureCollection',
								features: [
									{
										type: 'Feature',
										geometry: {
											type: 'Point',
											coordinates: clickedElement.center as [number, number]
										},
										properties: {}
									}
								]
							}}
						>
							<Layer
								id="clickedElementMarker"
								type="symbol"
								layout={{
									'icon-image': 'map-marker',
									'icon-size': 0.17,
									'icon-anchor': 'bottom',
									'icon-allow-overlap': true
								}}
								paint={{ 'icon-color': primaryColor }}
							/>
						</GeoJSONSource>
					)}
				</MapLibreMap>
				{overlayError === null && (
					<FloorPicker
						floors={uniqueEtages}
						showAllFloors={showAllFloors}
						toggleShowAllFloors={toggleShowAllFloors}
						setCameraTriggerKey={setCameraTriggerKey}
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
				handlePresentModalPress={handlePresentModalPress}
				allRooms={allRooms}
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
