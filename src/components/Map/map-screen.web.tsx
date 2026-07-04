import type BottomSheet from '@gorhom/bottom-sheet'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import {
	Layer,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: TODO
	Map,
	Marker,
	NavigationControl,
	Source
} from '@vis.gl/react-maplibre'
import { router, useNavigation } from 'expo-router'
import type { Position } from 'geojson'
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
import 'maplibre-gl/dist/maplibre-gl.css'

const mapContainerStyle = {
	height: '100%',
	width: '100%'
}

export function requestPermission(): void {
	// Web doesn't need explicit permission for location
}

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
	const [_disableFollowUser, setDisableFollowUser] = useState(false)
	const [showAllFloors, setShowAllFloors] = useState(false)
	const mapRef = useRef(null)

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
				header: t('pages.map.details.room.lecturers', { ns: 'common' }),
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

				selectRoom({
					room: feature.properties.Raum,
					center,
					origin: 'MapClick',
					manual: true
				})
			}
		},
		[filteredGeoJSON, selectRoom]
	)

	return (
		<View className="flex-1">
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
			<div style={mapContainerStyle}>
				<Map
					mapLib={maplibregl}
					initialViewState={{
						longitude: mapCenter[0],
						latitude: mapCenter[1],
						zoom: 16.5
					}}
					mapStyle={isDark ? darkStyle : lightStyle}
					ref={mapRef}
					onLoad={handleMapLoad}
					onError={handleMapError}
					onClick={handleMapClick}
					onMoveStart={() => setRegionChange(true)}
					attributionControl={false}
				>
					<NavigationControl position="top-right" />

					{hasFilteredRooms && (
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

					{hasAvailableFilteredRooms && (
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
									'fill-color': primaryColor,
									'fill-opacity': 0.2,
									'fill-antialias': true
								}}
							/>
							<Layer
								id="availableRoomsOutline"
								type="line"
								paint={{
									'line-color': primaryColor,
									'line-width': 2.4
								}}
							/>
						</Source>
					)}
					{buildingGeoJSON.features.length > 0 && (
						<Source
							id="buildingLettersSource"
							type="geojson"
							// biome-ignore lint/suspicious/noExplicitAny: TODO
							data={buildingGeoJSON as any}
						>
							<Layer
								id="buildingLettersLayer"
								type="symbol"
								layout={{
									'text-field': ['get', 'Raum'],
									'text-size': 14,
									'text-allow-overlap': true
								}}
								paint={{
									'text-color': labelColor,
									'text-halo-color': backgroundColor,
									'text-halo-width': 1
								}}
							/>
						</Source>
					)}

					{clickedElement?.center && (
						<Marker
							longitude={clickedElement.center[0]}
							latitude={clickedElement.center[1]}
							color={primaryColor}
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
					className="items-end h-[30px] me-1 absolute right-0 z-[99]"
					style={[animatedStyles, { top: -22 }]}
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
