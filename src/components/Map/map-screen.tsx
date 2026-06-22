import { trackEvent } from '@aptabase/react-native'
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
import { useQuery } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import type { Feature, FeatureCollection, Position } from 'geojson'
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
	useColorScheme,
	View
} from 'react-native'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import NeulandAPI from '@/api/neuland-api'
import {
	NoSessionError,
	UnavailableSessionError
} from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type FeatureProperties, Gebaeude } from '@/types/asset-api'
import {
	type ClickedMapElement,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import type { NormalizedLecturer } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import {
	filterAvailableRooms,
	filterEtage,
	getBuildingData,
	getOngoingOrNextEvent,
	getRoomData
} from '@/utils/map-screen-utils'
import {
	BUILDINGS,
	FLOOR_ORDER,
	FLOOR_SUBSTITUTES,
	filterRooms,
	getCenter,
	getCenterSingle,
	getIcon,
	getRoomOpenings,
	INGOLSTADT_CENTER,
	NEUBURG_CENTER
} from '@/utils/map-utils'
import { loadTimetable } from '@/utils/timetable-utils'
import { LoadingState, roomNotFoundToast } from '@/utils/ui-utils'

import packageInfo from '../../../package.json'
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
	const themePreference = usePreferencesStore((state) => state.theme)
	const systemScheme = useColorScheme()
	const isDark =
		themePreference === 'dark' ||
		(themePreference !== 'light' && systemScheme === 'dark')
	const primaryColor = useCSSVariable('--color-primary') as string
	const notificationColor = useCSSVariable('--color-notification') as
		| string
		| undefined
	const labelColor = useCSSVariable('--color-label') as string | undefined
	const backgroundColor = useCSSVariable('--color-background') as
		| string
		| undefined
	const params = useLocalSearchParams<{ room: string }>()
	const { userKind, userFaculty } = use(UserKindContext)
	const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)
	const { t, i18n } = useTranslation('common')
	const bottomSheetRef = useRef<BottomSheet>(null)
	const bottomSheetModalRef = useRef<BottomSheetModal>(null)
	const currentPosition = useSharedValue(0)
	const currentPositionModal = useSharedValue(0)
	const {
		localSearch,
		clickedElement,
		setClickedElement,
		availableRooms,
		setAvailableRooms,
		roomOpenings,
		setRoomOpenings,
		currentFloor,
		setCurrentFloor,
		setNextLecture
	} = use(MapContext)
	const [disableFollowUser, setDisableFollowUser] = useState(false)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const mapRef = useRef<MapViewRef>(null)
	const cameraRef = useRef<CameraRef>(null)
	const locationRef = useRef<UserLocationRef>(null)
	const currentDate = new Date()

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

	const { data: mapOverlay, error: overlayError } = useQuery<FeatureCollection>(
		{
			queryKey: ['mapOverlay', packageInfo.version],
			queryFn: async () => await NeulandAPI.getMapOverlay(),
			staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
			gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
			networkMode: 'always'
		}
	)

	useEffect(() => {
		if (overlayError != null) {
			toast({
				title: t('toast.mapOverlay', { ns: 'common' }),
				preset: 'error',
				duration: 3,
				from: 'top'
			})
		}
	}, [overlayError])

	const { data: timetable } = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		retry(failureCount, error) {
			const ignoreErrors = [
				'"Time table does not exist" (-202)',
				'Timetable is empty'
			]
			if (ignoreErrors.includes(error.message)) {
				return false
			}
			return failureCount < 2
		},
		enabled: userKind !== USER_GUEST
	})

	const { data: lecturers } = useQuery({
		queryKey: ['allLecturers'],
		queryFn: async () => {
			const rawData = await API.getLecturers('0', 'z')
			const data = normalizeLecturers(rawData)
			return data
		},
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
		enabled: userKind !== USER_GUEST
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
		if (timetable == null) {
			setNextLecture([])
			return
		}
		const ongoingOrNextEvent = getOngoingOrNextEvent(timetable)
		if (ongoingOrNextEvent.length > 0) {
			setNextLecture(ongoingOrNextEvent)
		}
	}, [timetable, userKind])

	const allRooms: FeatureCollection = useMemo(() => {
		if (mapOverlay == null) {
			console.debug('No map overlay data')
			return { type: 'FeatureCollection', features: [] }
		}

		const rooms = mapOverlay.features.flatMap((feature) => {
			const { type, id, geometry, properties } = feature

			if (
				geometry == null ||
				properties == null ||
				geometry.type !== 'Polygon' ||
				!('coordinates' in geometry) ||
				geometry.coordinates == null ||
				geometry.coordinates.length === 0
			) {
				return []
			}

			if (properties.Ebene in FLOOR_SUBSTITUTES) {
				properties.Ebene = FLOOR_SUBSTITUTES[properties.Ebene as string]
			}
			if (!FLOOR_ORDER.includes(properties.Ebene as string)) {
				FLOOR_ORDER.push(properties.Ebene as string)
			}
			return {
				type,
				id,
				properties: {
					...properties,
					rtype: SEARCH_TYPES.ROOM,
					center: getCenterSingle(geometry.coordinates),
					icon: getIcon(SEARCH_TYPES.ROOM, {
						result: { item: { properties } }
					})
				} as unknown as FeatureProperties,
				geometry
			}
		})
		const buildings = BUILDINGS.map((building) => {
			const buildingRooms = rooms.filter(
				(room) => room.properties.Gebaeude === (building as Gebaeude)
			)
			if (buildingRooms.length === 0) {
				return null
			}
			const floorCount = Array.from(
				new Set(buildingRooms.map((room) => room.properties.Ebene))
			).length
			const location = buildingRooms[0].properties.Standort
			const center = getCenter(buildingRooms.map((x) => x.geometry.coordinates))
			return {
				type: 'Feature',
				id: building,
				properties: {
					Raum: building,
					Funktion_en: t('buildingLabel', { lng: 'en', ns: 'common' }),
					Funktion_de: t('buildingLabel', { lng: 'de', ns: 'common' }),
					Gebaeude: Gebaeude[building as keyof typeof Gebaeude],
					Ebene: 'EG', // Dummy value to not break the floor picker
					Etage: floorCount.toString(),
					Standort: location,
					rtype: SEARCH_TYPES.BUILDING,
					center,
					icon: getIcon(SEARCH_TYPES.BUILDING)
				},
				geometry: {
					type: 'Point' as const,
					coordinates: center
				}
			} satisfies Feature
		}).filter(
			(building): building is NonNullable<typeof building> => building !== null
		)
		return {
			type: 'FeatureCollection',
			features: [...rooms, ...buildings]
		}
	}, [mapOverlay])

	const buildingGeoJSON: FeatureCollection = useMemo(() => {
		return {
			type: 'FeatureCollection',
			features: allRooms.features.filter(
				(f) => f.properties?.rtype === SEARCH_TYPES.BUILDING
			)
		}
	}, [allRooms])

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
		if (
			params.room == null ||
			params.room === '' ||
			params.room === undefined
		) {
			return
		}
		if (
			allRooms == null ||
			allRooms.features.length === 0 ||
			mapLoadState !== LoadingState.LOADED
		) {
			return
		}

		const room = allRooms.features.find(
			(x) => x.properties?.Raum === params.room
		)?.properties

		if (room == null) {
			roomNotFoundToast(params.room, notificationColor ?? '')
			router.setParams({ room: '' })
			return
		}
		bottomSheetRef.current?.close()
		setClickedElement({
			data: params.room,
			type: SEARCH_TYPES.ROOM,
			center: room.center as Position | undefined,
			manual: false
		})
		trackEvent('Room', {
			room: params.room,
			origin: 'InAppLink'
		})
		setCurrentFloor({
			floor: (room.Ebene as string) ?? 'EG',
			manual: false
		})
		handlePresentModalPress()

		router.setParams({ room: '' })
	}, [params, mapLoadState, allRooms])

	useEffect(() => {
		setMapCenter(
			userFaculty === 'Nachhaltige Infrastruktur'
				? NEUBURG_CENTER
				: INGOLSTADT_CENTER
		)
	}, [userFaculty])

	useEffect(() => {
		if (localSearch.length === 1 && params.room != null) {
			router.setParams(undefined)
		}
	}, [localSearch])

	const { data: roomStatusData } = useQuery({
		queryKey: ['freeRooms', formatISODate(currentDate)],
		queryFn: async () => await API.getFreeRooms(currentDate),
		staleTime: 1000 * 60 * 60, // 60 minutes
		gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				return false
			}
			return failureCount < 2
		}
	})

	useEffect(() => {
		function load(): void {
			if (roomStatusData == null) {
				console.debug('No room status data')
				return
			}
			try {
				const dateObj = new Date()
				const date = formatISODate(dateObj)
				const time = formatISOTime(dateObj)
				const rooms = filterRooms(roomStatusData, date, time)
				setAvailableRooms(rooms)
				const openings = getRoomOpenings(roomStatusData, dateObj)
				setRoomOpenings(openings)
			} catch (e) {
				if (
					e instanceof NoSessionError ||
					e instanceof UnavailableSessionError
				) {
					setAvailableRooms([])
				} else {
					console.error(e)
				}
			}
		}
		setAvailableRooms(null)
		setRoomOpenings(null)
		load()
	}, [userKind, roomStatusData])

	useEffect(() => {
		if (clickedElement != null && currentFloor?.manual === true) {
			bottomSheetModalRef.current?.close()
		}
	}, [currentFloor])

	const uniqueEtages = Array.from(
		new Set(
			(Array.isArray(allRooms.features)
				? allRooms.features
				: Object.values(allRooms.features)
			)
				.map((room) => {
					const properties = (room as RoomData).properties
					return typeof properties?.Ebene === 'string' ? properties.Ebene : ''
				})
				.filter((etage) => etage != null)
		)
	).sort(
		(a: string, b: string) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b)
	)
	const [filteredGeoJSON, setFilteredGeoJSON] = useState<FeatureCollection>()
	const [availableFilteredGeoJSON, setAvailableFilteredGeoJSON] =
		useState<FeatureCollection>()

	useEffect(() => {
		if (mapOverlay == null) {
			return
		}
		// filter the filteredGeoJSON to only show available rooms
		const filteredFeatures = filterAvailableRooms(
			filteredGeoJSON,
			availableRooms
		)

		const availableFilteredGeoJSON: FeatureCollection = {
			type: 'FeatureCollection',
			features: filteredFeatures
		}

		setAvailableFilteredGeoJSON(availableFilteredGeoJSON)
	}, [availableRooms, filteredGeoJSON, mapOverlay])

	useEffect(() => {
		if (mapOverlay == null) {
			return
		}
		const filteredFeatures = filterEtage(currentFloor?.floor ?? 'EG', allRooms)

		const newGeoJSON: FeatureCollection = {
			...mapOverlay,
			features: filteredFeatures
		}

		setFilteredGeoJSON(newGeoJSON)
	}, [currentFloor, allRooms, mapOverlay]) // Ensure dependencies are correctly listed

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

	const showFiltered = useCallback(() => {
		return filteredGeoJSON != null && filteredGeoJSON.features.length > 0
	}, [filteredGeoJSON])

	const showAvailableFiltered = useCallback(() => {
		return (
			availableFilteredGeoJSON != null &&
			availableFilteredGeoJSON.features.length > 0
		)
	}, [availableFilteredGeoJSON])

	const handleRefresh = useCallback(() => {
		setMapLoadState(LoadingState.LOADING)
		// Force a reload by incrementing the key
		setMapKey((prev) => prev + 1)
	}, [])

	return (
		<View className="flex-1">
			{mapLoadState === LoadingState.ERROR && (
				<View className="bg-background flex-1 h-full justify-center absolute w-full z-[100]">
					<ErrorView
						title={t('error.map.mapLoadError')}
						onButtonPress={handleRefresh}
					/>
				</View>
			)}
			{mapLoadState === LoadingState.LOADING && (
				<View className="bg-background flex-1 h-full justify-center absolute w-full z-[100]">
					<LoadingIndicator />
				</View>
			)}

			<View className="flex-1" style={{ marginBottom: 0 }}>
				<MapView
					key={mapKey}
					style={{ flex: 1 }}
					tintColor={Platform.OS === 'ios' ? primaryColor : undefined}
					logoEnabled={false}
					mapStyle={isDark ? darkStyle : lightStyle}
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
									iconColor: primaryColor,
									iconSize: 0.17,
									iconAnchor: 'bottom',
									iconAllowOverlap: true
								}}
								layerIndex={110}
							/>
						</ShapeSource>
					)}
					{showFiltered() && (
						<ShapeSource
							id="allRoomsSource"
							shape={filteredGeoJSON}
							onPress={(e) => {
								setClickedElement({
									data: e.features[0].properties?.Raum as string,
									type: SEARCH_TYPES.ROOM,
									center: e.features[0].properties?.center as
										| Position
										| undefined,
									manual: true
								})
								trackEvent('Room', {
									room: e.features[0].properties?.Raum as string,
									origin: 'MapClick'
								})
								handlePresentModalPress()
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
					{showAvailableFiltered() && (
						<ShapeSource
							id="availableRoomsSource"
							shape={availableFilteredGeoJSON}
						>
							<FillLayer
								id="availableRoomsFill"
								style={{
									...layerStyles.availableRooms,
									fillColor: primaryColor
								}}
								layerIndex={102}
							/>
							<LineLayer
								id="availableRoomsOutline"
								style={{
									...layerStyles.availableRoomsOutline,
									lineColor: primaryColor
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
									textColor: labelColor,
									textHaloColor: backgroundColor,
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
					className="items-end h-[30px] mr-1 absolute right-0 z-[99]"
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
