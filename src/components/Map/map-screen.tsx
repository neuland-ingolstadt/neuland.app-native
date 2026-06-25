import type BottomSheet from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import type {
	CameraRef,
	MapViewRef,
	UserLocationRef
} from '@maplibre/maplibre-react-native'
import {
	Camera,
	FillLayer,
	Images,
	LineLayer,
	MapView,
	requestAndroidLocationPermissions,
	ShapeSource,
	SymbolLayer,
	UserLocation,
	UserTrackingMode
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
import {
	createStyleSheet,
	UnistylesRuntime,
	useStyles
} from 'react-native-unistyles'
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
import LoadingIndicator from '../Universal/loading-indicator'
import { modalSection } from './modal-sections'

export function requestPermission(): void {
	if (Platform.OS === 'android') {
		void requestAndroidLocationPermissions()
	}
}

const MapScreen = (): React.JSX.Element => {
	const navigation = useNavigation()
	const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
	const [mapKey, setMapKey] = useState(0)
	const { styles, theme } = useStyles(stylesheet)
	const isDark = UnistylesRuntime.themeName === 'dark'
	const { userKind, userFaculty } = use(UserKindContext)
	const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)
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
	const mapRef = useRef<MapViewRef>(null)
	const cameraRef = useRef<CameraRef>(null)
	const locationRef = useRef<UserLocationRef>(null)

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
		bottomSheetRef.current?.snapToIndex(1)
	}, [setClickedElement])

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
		notificationColor: theme.colors.notification
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
			userFaculty === 'Nachhaltige Infrastruktur'
				? NEUBURG_CENTER
				: INGOLSTADT_CENTER
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
			cameraRef.current?.setCamera({
				centerCoordinate: mapCenter,
				zoomLevel: 16.5,
				animationDuration: 400,
				heading: 0,
				animationMode: 'flyTo'
			})
			return
		}

		const [longitude, latitude] = clickedElement.center
		const adjustedLatitude = latitude - 0.0003
		// Use the adjusted center for flyTo
		cameraRef.current?.setCamera({
			centerCoordinate: [longitude, adjustedLatitude],
			zoomLevel: 17,
			animationDuration: 500,
			animationMode: 'flyTo'
		})
	}

	const [cameraTriggerKey, setCameraTriggerKey] = useState(0)

	useEffect(() => {
		if (mapOverlay == null) {
			return
		}
		if (clickedElement == null) {
			if (currentFloor?.manual !== true) {
				setCurrentFloor({ floor: 'EG', manual: false })
			}
			cameraRef.current?.setCamera({
				centerCoordinate: mapCenter,
				zoomLevel: 16.5,
				animationDuration: 500,
				heading: 0,
				animationMode: 'flyTo'
			})
		} else if (clickedElement !== null) {
			setView(clickedElement)
		}
	}, [clickedElement])

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
			fillAntialias: true,
			fillColor: isDark ? '#6a7178' : '#a4a4a4',
			fillOpacity: 0.1
		},
		allRoomsOutline: {
			lineColor: isDark ? '#2d3035' : '#8e8e8e',
			lineWidth: 2.3
		},
		availableRooms: {
			fillAntialias: true,
			fillOpacity: 0.2
		},
		availableRoomsOutline: {
			lineWidth: 2.4
		},
		osmBackground: {
			backgroundColor: isDark
				? 'rgba(104, 106, 108, 0.7)'
				: 'rgba(218, 218, 218, 0.70)',
			paddingHorizontal: 4,
			borderRadius: theme.radius.xs
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
		<View style={styles.map}>
			{mapLoadState === LoadingState.ERROR && (
				<View style={styles.errorContainer}>
					<ErrorView
						title={t('error.map.mapLoadError')}
						onButtonPress={handleRefresh}
					/>
				</View>
			)}
			{mapLoadState === LoadingState.LOADING && (
				<View style={styles.errorContainer}>
					<LoadingIndicator />
				</View>
			)}

			<View
				style={{
					...styles.map,
					marginBottom: 0
				}}
			>
				<MapView
					key={mapKey}
					style={styles.map}
					tintColor={Platform.OS === 'ios' ? theme.colors.primary : undefined}
					logoEnabled={false}
					mapStyle={
						UnistylesRuntime.themeName === 'dark' ? darkStyle : lightStyle
					}
					attributionEnabled={false}
					onDidFailLoadingMap={() => {
						setMapLoadState(LoadingState.ERROR)
					}}
					onDidFinishLoadingMap={() => {
						setMapLoadState(LoadingState.LOADED)
					}}
					ref={mapRef}
					onDidFinishRenderingMapFully={() => {
						setRegionChange(false)
					}}
					onRegionIsChanging={() => {
						setRegionChange(true)
					}}
					compassEnabled={Platform.OS === 'ios'}
				>
					<Images
						nativeAssetImages={['pin']}
						images={{
							// https://iconduck.com/icons/71717/map-marker - License: Creative Commons Zero v1.0 Universal
							'map-marker': require('@/assets/map-marker.png')
						}}
					/>
					<Camera
						ref={cameraRef}
						zoomLevel={16.5}
						centerCoordinate={mapCenter}
						animationDuration={0}
						minZoomLevel={14}
						maxZoomLevel={19}
						followUserLocation={
							cameraTriggerKey !== 0 &&
							clickedElement == null &&
							!disableFollowUser
						}
						followUserMode={UserTrackingMode.Follow}
					/>
					<UserLocation
						ref={locationRef}
						renderMode="native"
						animated={true}
						showsUserHeadingIndicator
					/>
					{clickedElement !== null && (
						<ShapeSource
							id="clickedElementSource"
							shape={{
								type: 'FeatureCollection',
								features: [
									{
										type: 'Feature',
										geometry: {
											type: 'Point',
											coordinates: clickedElement.center as number[]
										},
										properties: {}
									}
								]
							}}
						>
							<SymbolLayer
								id="clickedElementMarker"
								style={{
									iconImage: 'map-marker',
									iconColor: theme.colors.primary,
									iconSize: 0.17,
									iconAnchor: 'bottom',
									iconAllowOverlap: true
								}}
								layerIndex={110}
							/>
						</ShapeSource>
					)}
					{hasFilteredRooms && (
						<ShapeSource
							id="allRoomsSource"
							shape={filteredGeoJSON}
							onPress={(e) => {
								selectRoom({
									room: e.features[0].properties?.Raum as string,
									center: e.features[0].properties?.center as
										| Position
										| undefined,
									origin: 'MapClick',
									manual: true
								})
							}}
							hitbox={{ width: 0, height: 0 }}
						>
							<FillLayer
								id="allRoomsFill"
								style={layerStyles.allRooms}
								layerIndex={100}
							/>
							<LineLayer
								id="allRoomsOutline"
								style={layerStyles.allRoomsOutline}
								layerIndex={101}
							/>
						</ShapeSource>
					)}
					{hasAvailableFilteredRooms && (
						<ShapeSource
							id="availableRoomsSource"
							shape={availableFilteredGeoJSON}
						>
							<FillLayer
								id="availableRoomsFill"
								style={{
									...layerStyles.availableRooms,
									fillColor: theme.colors.primary
								}}
								layerIndex={102}
							/>
							<LineLayer
								id="availableRoomsOutline"
								style={{
									...layerStyles.availableRoomsOutline,
									lineColor: theme.colors.primary
								}}
								layerIndex={103}
							/>
						</ShapeSource>
					)}
					{buildingGeoJSON.features.length > 0 && (
						<ShapeSource id="buildingLettersSource" shape={buildingGeoJSON}>
							<SymbolLayer
								id="buildingLettersLayer"
								style={{
									textField: ['get', 'Raum'],
									textColor: theme.colors.labelColor,
									textHaloColor: theme.colors.background,
									textHaloWidth: 1,
									textAllowOverlap: true,
									textSize: 14
								}}
								layerIndex={105}
							/>
						</ShapeSource>
					)}
				</MapView>
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
					style={[
						styles.osmContainer,
						animatedStyles,
						{ top: Platform.OS === 'ios' ? -19 : -22 }
					]}
				>
					<Pressable
						onPress={() => {
							void Linking.openURL('https://www.openstreetmap.org/copyright')
						}}
						style={layerStyles.osmBackground}
					>
						<Text
							style={styles.osmAtrribution}
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

const stylesheet = createStyleSheet((theme) => ({
	errorContainer: {
		backgroundColor: theme.colors.background,
		flex: 1,
		height: '100%',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
		zIndex: 100
	},
	map: {
		flex: 1
	},
	osmAtrribution: { fontSize: 13 },
	osmContainer: {
		alignItems: 'flex-end',
		height: 30,
		marginRight: 4,
		position: 'absolute',
		right: 0,
		top: -24,
		zIndex: 99
	}
}))
