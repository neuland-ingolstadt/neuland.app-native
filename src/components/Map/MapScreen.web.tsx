import { trackEvent } from '@aptabase/react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import {
	Layer,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: TODO
	Map,
	Marker,
	NavigationControl,
	Source
} from '@vis.gl/react-maplibre'
import { toast } from 'burnt'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import type { Feature, FeatureCollection, Position } from 'geojson'
import maplibregl from 'maplibre-gl'
import type React from 'react'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Appearance,
	LayoutAnimation,
	Linking,
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
import API from '@/api/authenticated-api'
import NeulandAPI from '@/api/neuland-api'
import {
	NoSessionError,
	UnavailableSessionError
} from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/ErrorView'
import { BottomSheetDetailModal } from '@/components/Map/BottomSheetDetailModal'
import MapBottomSheet from '@/components/Map/BottomSheetMap'
import FloorPicker from '@/components/Map/FloorPicker'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { type FeatureProperties, Gebaeude } from '@/types/asset-api'
import {
	type ClickedMapElement,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
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
	INGOLSTADT_CENTER,
	NEUBURG_CENTER
} from '@/utils/map-utils'
import { loadTimetable } from '@/utils/timetable-utils'
import { LoadingState, roomNotFoundToast } from '@/utils/ui-utils'
import packageInfo from '../../../package.json'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { modalSection } from './ModalSections'
import 'maplibre-gl/dist/maplibre-gl.css'

export function requestPermission(): void {
	// Web doesn't need explicit permission for location
}

const MapScreen = (): React.JSX.Element => {
	const navigation = useNavigation()
	const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
	const { styles, theme } = useStyles(stylesheet)
	const isDark = UnistylesRuntime.themeName === 'dark'
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
		currentFloor,
		setCurrentFloor,
		setNextLecture
	} = use(MapContext)
	const [_disableFollowUser, setDisableFollowUser] = useState(false)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const mapRef = useRef(null)
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
		queryKey: ['2', userKind],
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
				geometry.type !== 'Polygon'
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
					Funktion_en: 'Building',
					Funktion_de: 'Gebäude',
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
			roomNotFoundToast(params.room, theme.colors.notification)
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
	}, [currentFloor, allRooms, mapOverlay])

	const roomData: RoomData = useMemo(() => {
		switch (clickedElement?.type) {
			case SEARCH_TYPES.ROOM:
				return getRoomData(
					clickedElement.data,
					availableRooms,
					allRooms,
					i18n,
					t
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

	function setView(clickedElement: ClickedMapElement | null = null): void {
		if (!mapRef.current || !clickedElement?.center) return

		const map = mapRef.current as maplibregl.Map

		// Ensure we're working with valid coordinates
		// In GeoJSON, coordinates are [longitude, latitude]
		if (
			!Array.isArray(clickedElement.center) ||
			clickedElement.center.length < 2
		) {
			console.error('Invalid center format:', clickedElement.center)
			return
		}

		const [longitude, latitude] = clickedElement.center

		// Validate coordinates are valid numbers
		if (Number.isNaN(Number(longitude)) || Number.isNaN(Number(latitude))) {
			console.error('Invalid coordinates:', clickedElement.center)
			return
		}

		const adjustedLatitude = Number(latitude) - 0.0003

		map.flyTo({
			center: [Number(longitude), adjustedLatitude],
			zoom: 17,
			duration: 500
		})
	}

	const [cameraTriggerKey, setCameraTriggerKey] = useState(0)

	useEffect(() => {
		if (!mapRef.current || mapOverlay == null) {
			return
		}

		const map = mapRef.current as maplibregl.Map

		if (clickedElement == null) {
			if (currentFloor?.manual !== true) {
				setCurrentFloor({ floor: 'EG', manual: false })
			}
			map.flyTo({
				center: mapCenter as [number, number],
				zoom: 16.5,
				bearing: 0,
				duration: 500
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
				? 'rgba(166, 173, 181, 0.70)'
				: 'rgba(218, 218, 218, 0.70)',
			paddingHorizontal: 4,
			borderRadius: theme.radius.sm
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
		} else if (!regionChange && isVisible) {
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

	const handleMapLoad = useCallback(() => {
		setMapLoadState(LoadingState.LOADED)
	}, [])

	const handleMapError = useCallback(() => {
		setMapLoadState(LoadingState.ERROR)
	}, [])

	const handleMapClick = useCallback(
		(e: maplibregl.MapMouseEvent) => {
			if (!filteredGeoJSON) return

			// Simple picking - in a real app, you'd want more sophisticated picking
			const map = mapRef.current as unknown as maplibregl.Map
			const features = map.queryRenderedFeatures(e.point, {
				layers: ['allRoomsFill']
			})

			if (features.length > 0 && features[0].properties) {
				const feature = features[0]
				let center: Position | undefined

				// Parse the center from the feature properties
				try {
					if (typeof feature.properties.center === 'string') {
						// If it's a string (like a stringified array), parse it
						center = JSON.parse(feature.properties.center)
					} else if (feature.properties.center) {
						// If it's already an array or object
						center = feature.properties.center
					}

					// Validate the center coordinates
					if (
						!Array.isArray(center) ||
						center.length < 2 ||
						Number.isNaN(Number(center[0])) ||
						Number.isNaN(Number(center[1]))
					) {
						console.error('Invalid center coordinates:', center)
						return
					}

					// Convert to proper numeric Position array
					center = [Number(center[0]), Number(center[1])]
				} catch (err) {
					console.error('Failed to parse center coordinates:', err)
					return
				}

				setClickedElement({
					data: feature.properties.Raum,
					type: SEARCH_TYPES.ROOM,
					center,
					manual: true
				})

				trackEvent('Room', {
					room: feature.properties.Raum,
					origin: 'MapClick'
				})

				handlePresentModalPress()
			}
		},
		[filteredGeoJSON, handlePresentModalPress]
	)

	const mapContainerStyle = {
		height: '100%',
		width: '100%'
	}

	return (
		<View style={styles.map}>
			{mapLoadState === LoadingState.ERROR && (
				<View style={styles.errorContainer}>
					<ErrorView title={t('error.map.mapLoadError')} />
				</View>
			)}
			{mapLoadState === LoadingState.LOADING && (
				<View style={styles.errorContainer}>
					<LoadingIndicator />
				</View>
			)}

			<div className="map-container" style={mapContainerStyle}>
				<Map
					mapLib={maplibregl}
					initialViewState={{
						longitude: mapCenter[0],
						latitude: mapCenter[1],
						zoom: 16.5
					}}
					mapStyle={
						UnistylesRuntime.themeName === 'dark' ? darkStyle : lightStyle
					}
					ref={mapRef}
					onLoad={handleMapLoad}
					onError={handleMapError}
					onClick={handleMapClick}
					onMoveStart={() => setRegionChange(true)}
					attributionControl={false}
				>
					<NavigationControl position="top-right" />

					{showFiltered() && (
						<Source
							id="allRoomsSource"
							type="geojson"
							// biome-ignore lint/suspicious/noExplicitAny: TODO
							data={filteredGeoJSON as any}
						>
							<Layer
								id="allRoomsFill"
								type="fill"
								paint={{
									'fill-color': isDark ? '#6a7178' : '#a4a4a4',
									'fill-opacity': 0.1,
									'fill-antialias': true
								}}
							/>
							<Layer
								id="allRoomsOutline"
								type="line"
								paint={{
									'line-color': isDark ? '#2d3035' : '#8e8e8e',
									'line-width': 2.3
								}}
							/>
						</Source>
					)}

					{showAvailableFiltered() && (
						<Source
							id="availableRoomsSource"
							type="geojson"
							// biome-ignore lint/suspicious/noExplicitAny: TODO
							data={availableFilteredGeoJSON as any}
						>
							<Layer
								id="availableRoomsFill"
								type="fill"
								paint={{
									'fill-color': theme.colors.primary,
									'fill-opacity': 0.2,
									'fill-antialias': true
								}}
							/>
							<Layer
								id="availableRoomsOutline"
								type="line"
								paint={{
									'line-color': theme.colors.primary,
									'line-width': 2.4
								}}
							/>
						</Source>
					)}

					{clickedElement?.center && (
						<Marker
							longitude={clickedElement.center[0]}
							latitude={clickedElement.center[1]}
							color={theme.colors.primary}
						/>
					)}
				</Map>
			</div>

			{overlayError === null && (
				<FloorPicker
					floors={uniqueEtages}
					showAllFloors={showAllFloors}
					toggleShowAllFloors={toggleShowAllFloors}
					setCameraTriggerKey={setCameraTriggerKey}
				/>
			)}

			{mapLoadState === LoadingState.LOADED && (
				<Animated.View
					style={[styles.osmContainer, animatedStyles, { top: -22 }]}
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
				modalSection={modalSection(
					roomData,
					locations,
					userKind === USER_GUEST
				)}
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
