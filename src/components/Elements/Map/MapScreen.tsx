import API from '@/api/authenticated-api'
import NeulandAPI from '@/api/neuland-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import { loadTimetable } from '@/app/(tabs)/timetable'
import { BottomSheetDetailModal } from '@/components/Elements/Map/BottomSheetDetailModal'
import MapBottomSheet from '@/components/Elements/Map/BottomSheetMap'
import FloorPicker from '@/components/Elements/Map/FloorPicker'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import { type Colors } from '@/components/colors'
import { RouteParamsContext, UserKindContext } from '@/components/contexts'
import { MapContext } from '@/hooks/contexts/map'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import i18n from '@/localization/i18n'
import { type FeatureProperties, Gebaeude } from '@/types/asset-api'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    BUILDINGS,
    FLOOR_ORDER,
    FLOOR_SUBSTITUTES,
    INGOLSTADT_CENTER,
    NEUBURG_CENTER,
    filterRooms,
    getCenter,
    getCenterSingle,
    getIcon,
    getNextValidDate,
} from '@/utils/map-utils'
import { LoadingState, showToast } from '@/utils/ui-utils'
import type BottomSheet from '@gorhom/bottom-sheet'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect, useNavigation } from 'expo-router'
import {
    type Feature,
    type FeatureCollection,
    type GeoJsonProperties,
    type Geometry,
} from 'geojson'
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import Toast from 'react-native-root-toast'
import { Path, Svg } from 'react-native-svg'

import packageInfo from '../../../../package.json'
import { modalSection } from './ModalSections'

const MapScreen = (): JSX.Element => {
    const navigation = useNavigation()
    const isFocused = useNavigation().isFocused()
    const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
    const theme = useTheme()
    const colors = theme.colors as Colors
    const isDark = theme.dark

    const { userKind, userFaculty } = useContext(UserKindContext)
    const { routeParams, updateRouteParams } = useContext(RouteParamsContext)
    const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)
    const { t } = useTranslation('common')
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
        setNextLecture,
    } = useContext(MapContext)
    const [disableFollowUser, setDisableFollowUser] = useState(false)
    const [showAllFloors, setShowAllFloors] = useState(false)
    const mapRef = useRef<MapLibreGL.MapView>(null)
    const cameraRef = useRef<MapLibreGL.Camera>(null)
    const locationRef = useRef<MapLibreGL.UserLocation>(null)
    const currentDate = new Date()

    enum Locations {
        IN = 'Ingolstadt',
        ND = 'Neuburg',
    }
    const lightStyle = 'https://maps.opheys.dev/styles/light/style.json'
    const darkStyle = 'https://maps.opheys.dev/styles/dark/style.json'

    type LocationsType = Record<string, string>
    const locations: LocationsType = Locations
    const [isVisible, setIsVisible] = useState(true)
    const opacity = useSharedValue(1)
    void MapLibreGL.setAccessToken(null)

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
            opacity: opacity.value,
        }
    })

    const handleSheetChangesModal = useCallback(() => {
        setClickedElement(null)

        bottomSheetRef.current?.snapToIndex(1)
    }, [])

    const handlePresentModalPress = useCallback(() => {
        bottomSheetRef.current?.close()

        bottomSheetModalRef.current?.present()
    }, [])

    const { data: mapOverlay, error: overlayError } =
        useQuery<FeatureCollection>({
            queryKey: ['mapOverlay', packageInfo.version],
            queryFn: async () => await NeulandAPI.getMapOverlay(),
            staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
            gcTime: 1000 * 60 * 60 * 24 * 90, // 90 days
            networkMode: 'always',
        })

    useEffect(() => {
        if (overlayError != null) {
            Toast.show(t('toast.mapOverlay', { ns: 'common' }), {
                duration: Toast.durations.SHORT,
                position: 50,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
            })
        }
    }, [overlayError])

    const { data: timetable } = useQuery({
        queryKey: ['timetable', userKind],
        queryFn: loadTimetable,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry(failureCount, error) {
            const ignoreErrors = [
                '"Time table does not exist" (-202)',
                'Timetable is empty',
            ]
            if (ignoreErrors.includes(error?.message)) {
                return false
            }
            return failureCount < 3
        },
        enabled: userKind !== USER_GUEST,
    })

    const getOngoingOrNextEvent = (
        timetable: FriendlyTimetableEntry[]
    ): FriendlyTimetableEntry[] => {
        const now = new Date()

        // Filter out past events
        const futureEvents = timetable.filter(
            (entry) => new Date(entry.endDate) > now
        )

        // Find currently ongoing events
        const ongoingEvents = futureEvents.filter(
            (entry) =>
                new Date(entry.startDate) <= now &&
                new Date(entry.endDate) >= now
        )

        if (ongoingEvents.length > 0) {
            return ongoingEvents
        }

        // If no ongoing events, find the next event
        futureEvents.sort(
            (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
        )
        const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null

        return nextEvent != null ? [nextEvent] : []
    }

    useEffect(() => {
        if (timetable == null) {
            return
        }
        const ongoingOrNextEvent = getOngoingOrNextEvent(timetable)
        if (ongoingOrNextEvent.length > 0) {
            setNextLecture(ongoingOrNextEvent)
        }
    }, [timetable])

    const allRooms: FeatureCollection = useMemo(() => {
        if (mapOverlay == null) {
            console.log('No map overlay data')
            return { type: 'FeatureCollection', features: [] }
        }

        const rooms = mapOverlay.features
            .map((feature) => {
                const { type, id, geometry, properties } = feature

                if (
                    geometry == null ||
                    properties == null ||
                    geometry.type !== 'Polygon'
                ) {
                    return []
                }

                if (properties.Ebene in FLOOR_SUBSTITUTES) {
                    properties.Ebene = FLOOR_SUBSTITUTES[properties.Ebene]
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
                            result: { item: { properties } },
                        }),
                    } as unknown as FeatureProperties,
                    geometry,
                }
            })
            .flat()
        const buildings = BUILDINGS.map((building) => {
            const buildingRooms = rooms.filter(
                (room) => room.properties.Gebaeude === building
            )
            const floorCount = Array.from(
                new Set(buildingRooms.map((room) => room.properties.Ebene))
            ).length
            const location = buildingRooms[0].properties.Standort
            const center = getCenter(
                buildingRooms.map((x) => x.geometry.coordinates)
            )
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
                    icon: getIcon(SEARCH_TYPES.BUILDING),
                },
                geometry: {
                    type: 'Point',
                    coordinates: center,
                },
            } satisfies Feature
        })
        return {
            type: 'FeatureCollection',
            features: [...rooms, ...buildings],
        }
    }, [mapOverlay])

    useEffect(() => {
        // @ts-expect-error - no types for tabPress
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            // if already on the map screen, reset the map without animation
            // if not on the map screen, reset the map with animation
            // _setView(mapCenter, mapRef, isFocused)
            bottomSheetModalRef.current?.close()
            setView()
        })

        return unsubscribe
    }, [navigation, isFocused])

    useEffect(() => {
        if (routeParams === null || routeParams === '') {
            return
        }

        const room = allRooms.features.find(
            (x) => x.properties?.Raum === routeParams
        )?.properties

        if (room == null) {
            void showToast(t('toast.roomNotFound'))
            updateRouteParams('')
            return
        }

        setClickedElement({
            data: routeParams,
            type: SEARCH_TYPES.ROOM,
            center: room.center,
            manual: false,
        })
        setCurrentFloor({
            floor: room.Ebene,
            manual: false,
        })
        handlePresentModalPress()

        updateRouteParams('')
        bottomSheetRef.current?.forceClose()
    }, [routeParams])

    useEffect(() => {
        setMapCenter(
            userFaculty === 'Nachhaltige Infrastruktur'
                ? NEUBURG_CENTER
                : INGOLSTADT_CENTER
        )
    }, [userFaculty])

    useEffect(() => {
        if (localSearch?.length === 1) {
            updateRouteParams('')
        }
    }, [localSearch])

    const { data: roomStatusData } = useQuery({
        queryKey: ['fnreeRooms', formatISODate(currentDate)],
        queryFn: async () => await API.getFreeRooms(currentDate),
        staleTime: 1000 * 60 * 60, // 60 minutes
        gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                return false
            }
            return failureCount < 3
        },
    })

    useEffect(() => {
        async function load(): Promise<void> {
            if (roomStatusData == null) {
                console.log('No room status data')
                return
            }
            try {
                const dateObj = getNextValidDate()
                const date = formatISODate(dateObj)
                const time = formatISOTime(dateObj)
                const rooms = await filterRooms(roomStatusData, date, time)
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
        void load()
    }, [userKind, roomStatusData])

    // if current floor changes hide the detail sheet and marker
    useEffect(() => {
        if (clickedElement != null) {
            bottomSheetModalRef.current?.close()
        }
    }, [currentFloor])

    const uniqueEtages = Array.from(
        new Set(
            (Array.isArray(allRooms.features)
                ? allRooms.features
                : Object.values(allRooms.features)
            )
                .map((room: any) => room.properties?.Ebene?.toString())
                .filter((etage) => etage != null)
        )
    ).sort(
        (a: string, b: string) =>
            FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b)
    )
    const [filteredGeoJSON, setFilteredGeoJSON] = useState<FeatureCollection>()
    const [availableFilteredGeoJSON, setAvailableFilteredGeoJSON] =
        useState<FeatureCollection>()

    useEffect(() => {
        if (mapOverlay == null) {
            return
        }
        // filter the filteredGeoJSON to only show available rooms
        const filterAvailableRooms = (
            rooms: FeatureCollection | undefined
        ): Array<Feature<Geometry, GeoJsonProperties>> => {
            if (rooms == null) {
                return []
            }
            const result = rooms.features.filter(
                (feature) =>
                    feature.properties != null &&
                    availableRooms?.find(
                        (x) => x.room === feature.properties?.Raum
                    )
            )
            return result
        }
        const filteredFeatures = filterAvailableRooms(filteredGeoJSON)

        const availableFilteredGeoJSON: FeatureCollection<
            Geometry,
            GeoJsonProperties
        > = {
            type: 'FeatureCollection',
            features: filteredFeatures,
        }

        setAvailableFilteredGeoJSON(availableFilteredGeoJSON)
    }, [availableRooms, filteredGeoJSON, mapOverlay])

    useEffect(() => {
        if (mapOverlay == null) {
            return
        }
        const filterEtage = (etage: string): any => {
            return allRooms.features.filter(
                (feature) => feature.properties?.Ebene === etage
            )
        }

        const filteredFeatures = filterEtage(currentFloor?.floor ?? 'EG')

        const newGeoJSON: FeatureCollection<Geometry, GeoJsonProperties> = {
            ...mapOverlay,
            features: filteredFeatures,
        }

        setFilteredGeoJSON(newGeoJSON)
    }, [currentFloor, allRooms, mapOverlay]) // Ensure dependencies are correctly listed

    const getRoomData = (room: string): any => {
        const occupancies = availableRooms?.find((x) => x.room === room)
        const properties = allRooms.features.find(
            (x) => x.properties?.Raum === room
        )?.properties

        const roomData = {
            title: room,
            subtitle:
                properties != null &&
                (i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en') in
                    properties
                    ? properties[
                          i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
                      ]
                    : t('misc.unknown'),
            properties,

            occupancies,
            type: SEARCH_TYPES.ROOM,
        }
        return roomData
    }

    const getBuildingData = (building: string): any => {
        const buildingDetails = allRooms.features.find(
            (x) =>
                x.properties?.Gebaeude === building &&
                x.properties?.rtype === SEARCH_TYPES.BUILDING
        )
        const numberOfFreeRooms = availableRooms?.filter(
            (x) => x.room[0] === building || x.room.slice(0, 1) === building
        ).length
        const numberOfRooms = allRooms.features.filter(
            (x) =>
                x.properties?.Gebaeude === building &&
                x.properties?.rtype === SEARCH_TYPES.ROOM
        ).length
        const buildingData = {
            title: building,
            subtitle: t('pages.map.details.room.building'),
            properties: buildingDetails?.properties,
            occupancies: {
                total: numberOfRooms,
                available: numberOfFreeRooms,
            },
            type: SEARCH_TYPES.BUILDING,
        }
        return buildingData
    }

    const roomData: RoomData = useMemo(() => {
        switch (clickedElement?.type) {
            case SEARCH_TYPES.ROOM:
                return getRoomData(clickedElement.data)
            case SEARCH_TYPES.BUILDING:
                return getBuildingData(clickedElement.data)

            default:
                return {
                    title: t('misc.unknown'),
                    properties: null,
                    occupancies: null,
                }
        }
    }, [clickedElement])

    function setView(clickedElement: any = null): void {
        if (clickedElement == null) {
            cameraRef.current?.setCamera({
                centerCoordinate: mapCenter,
                zoomLevel: 16.5,
                animationDuration: 400,
                heading: 0,
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
            })
        } else if (clickedElement !== null && clickedElement.manual === false) {
            setView(clickedElement)
        }
    }, [clickedElement])

    useFocusEffect(() => {
        StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content')
        return () => {
            StatusBar.setBarStyle('default')
        }
    })

    useEffect(() => {
        setDisableFollowUser(false)
    }, [cameraTriggerKey])

    useEffect(() => {
        if (clickedElement !== null) {
            setDisableFollowUser(true)
        }
    }, [clickedElement])

    const layerStyles = {
        allRooms: {
            fillAntialias: true,
            fillColor: isDark ? '#848995' : '#a4a4a4',
            fillOpacity: 0.1,
        },
        allRoomsOutline: {
            lineColor: isDark ? '#9297a3' : '#979797',
            lineWidth: 2.2,
        },
        availableRooms: {
            fillAntialias: true,
            fillOpacity: 0.3,
        },
        availableRoomsOutline: {
            lineWidth: 2.5,
        },
        osmBackground: {
            backgroundColor: isDark
                ? 'rgba(166, 173, 181, 0.69)'
                : 'rgba(222, 221, 203, 0.69)',
            paddingHorizontal: 4,
            borderRadius: 4,
        },
    }

    const [regionChange, setRegionChange] = useState<boolean>(false)

    useEffect(() => {
        // As required by the OSM attribution, the attribution must be displayed until the user interacts with the map or 5 seconds after the map has loaded
        let timer: NodeJS.Timeout
        const startFadeOut = (): void => {
            opacity.value = withTiming(0, { duration: 500 }, () => {
                runOnJS(setIsVisible)(false)
            })
        }

        if (regionChange) {
            // If region changes, fade out directly without waiting for 5 seconds
            startFadeOut()
        } else if (!regionChange && isVisible) {
            // Otherwise, wait for 5 seconds before fading out
            timer = setTimeout(() => {
                startFadeOut()
            }, 5000)
        }

        return () => {
            clearTimeout(timer)
        }
    }, [regionChange, isVisible, opacity])

    return (
        <View style={styles.container}>
            <>
                {mapLoadState === LoadingState.ERROR && (
                    <View
                        style={{
                            ...styles.errorContainer,
                            backgroundColor: colors.background,
                        }}
                    >
                        <ErrorView
                            title={t('error.map.mapLoadError')}
                            onRefresh={() => mapRef.current?.render()}
                            refreshing={true}
                        />
                    </View>
                )}
                {mapLoadState === LoadingState.LOADING && (
                    <View
                        style={{
                            ...styles.errorContainer,
                            backgroundColor: colors.background,
                        }}
                    >
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
            </>

            <View style={styles.innerContainer}>
                <View style={styles.map}>
                    <MapLibreGL.MapView
                        style={styles.map}
                        tintColor={
                            Platform.OS === 'ios' ? colors.primary : undefined
                        }
                        logoEnabled={false}
                        styleURL={theme.dark ? darkStyle : lightStyle}
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
                    >
                        <MapLibreGL.Camera
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
                            followUserMode={MapLibreGL.UserTrackingMode.Follow}
                        />
                        <MapLibreGL.UserLocation
                            ref={locationRef}
                            renderMode="native"
                            animated={true}
                            showsUserHeadingIndicator
                        />

                        {filteredGeoJSON != null && (
                            <MapLibreGL.ShapeSource
                                id="allRoomsSource"
                                shape={filteredGeoJSON}
                                onPress={(e) => {
                                    setClickedElement({
                                        data: e.features[0].properties?.Raum,
                                        type: SEARCH_TYPES.ROOM,
                                        center: e.features[0].properties
                                            ?.center,
                                        manual: true,
                                    })

                                    handlePresentModalPress()
                                }}
                                hitbox={{ width: 0, height: 0 }}
                            >
                                <MapLibreGL.FillLayer
                                    id="allRoomsFill"
                                    style={layerStyles.allRooms}
                                />
                                <MapLibreGL.LineLayer
                                    id="allRoomsOutline"
                                    style={layerStyles.allRoomsOutline}
                                />
                            </MapLibreGL.ShapeSource>
                        )}
                        {availableFilteredGeoJSON != null && (
                            <MapLibreGL.ShapeSource
                                id="availableRoomsSource"
                                shape={availableFilteredGeoJSON}
                            >
                                <MapLibreGL.FillLayer
                                    id="availableRoomsFill"
                                    style={{
                                        ...layerStyles.availableRooms,
                                        fillColor: colors.primary,
                                    }}
                                />
                                <MapLibreGL.LineLayer
                                    id="availableRoomsOutline"
                                    style={{
                                        ...layerStyles.availableRoomsOutline,
                                        lineColor: colors.primary,
                                    }}
                                />
                            </MapLibreGL.ShapeSource>
                        )}
                        {clickedElement != null && (
                            <MapLibreGL.MarkerView
                                id="selectedRoomMarker"
                                coordinate={clickedElement.center as number[]}
                                anchor={{ x: 0.5, y: 1 }}
                            >
                                <Svg
                                    width={45}
                                    height={55}
                                    viewBox="170 0 624 944"
                                    fill="none"
                                >
                                    <Path
                                        d="M512 85.3c-164.9 0-298.6 133.7-298.6 298.6 0 164.9 298.6 554.6 298.6 554.6s298.6-389.7 298.6-554.6c0-164.9-133.7-298.6-298.6-298.6z m0 448a149.3 149.3 0 1 1 0-298.6 149.3 149.3 0 0 1 0 298.6z"
                                        fill={colors.primary}
                                        strokeWidth="0"
                                    />
                                </Svg>
                            </MapLibreGL.MarkerView>
                        )}
                    </MapLibreGL.MapView>
                    <>
                        {overlayError === null && (
                            <FloorPicker
                                floors={uniqueEtages}
                                showAllFloors={showAllFloors}
                                toggleShowAllFloors={toggleShowAllFloors}
                                setCameraTriggerKey={setCameraTriggerKey}
                            />
                        )}
                    </>
                </View>
            </View>

            <Animated.View style={[styles.osmContainer, animatedStyles]}>
                <Pressable
                    onPress={() => {
                        void Linking.openURL(
                            'https://www.openstreetmap.org/copyright'
                        )
                    }}
                    style={layerStyles.osmBackground}
                >
                    <Text style={styles.osmAtrribution}>
                        {'© OpenStreetMap'}
                    </Text>
                </Pressable>
            </Animated.View>

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
                modalSection={modalSection(roomData, locations, t)}
            />
        </View>
    )
}

export default MapScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: { flex: 1 },
    map: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 100,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    osmAtrribution: { fontSize: 13 },
    osmContainer: {
        height: 30,
        right: 0,
        top: -19,
        marginRight: 4,
        alignItems: 'flex-end',
        zIndex: 99,
        position: 'absolute',
        gap: 2,
    },
})
