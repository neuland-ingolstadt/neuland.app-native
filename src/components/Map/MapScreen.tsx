import API from '@/api/authenticated-api'
import NeulandAPI from '@/api/neuland-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import { loadTimetable } from '@/app/(tabs)/(timetable)/timetable'
import ErrorView from '@/components/Error/ErrorView'
import { BottomSheetDetailModal } from '@/components/Map/BottomSheetDetailModal'
import MapBottomSheet from '@/components/Map/BottomSheetMap'
import FloorPicker from '@/components/Map/FloorPicker'
import { UserKindContext } from '@/components/contexts'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
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
} from '@/utils/map-utils'
import { LoadingState, roomNotFoundToast } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import MapLibreGL, {
    type CameraRef,
    type MapViewRef,
    type UserLocationRef,
} from '@maplibre/maplibre-react-native'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
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
    Appearance,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    Text,
    View,
} from 'react-native'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import packageInfo from '../../../package.json'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { modalSection } from './ModalSections'

const MapScreen = (): JSX.Element => {
    const navigation = useNavigation()
    const [mapLoadState, setMapLoadState] = useState(LoadingState.LOADING)
    const { styles, theme } = useStyles(stylesheet)
    const isDark = UnistylesRuntime.themeName === 'dark'
    const params = useLocalSearchParams<{ room: string }>()
    const { userKind, userFaculty } = useContext(UserKindContext)
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
        setNextLecture,
    } = useContext(MapContext)
    const [disableFollowUser, setDisableFollowUser] = useState(false)
    const [showAllFloors, setShowAllFloors] = useState(false)
    const mapRef = useRef<MapViewRef>(null)
    const cameraRef = useRef<CameraRef>(null)
    const locationRef = useRef<UserLocationRef>(null)
    const currentDate = new Date()

    enum Locations {
        IN = 'Ingolstadt',
        ND = 'Neuburg',
    }
    const lightStyle = 'https://tile.neuland.app/styles/light/style.json'
    const darkStyle = 'https://tile.neuland.app/styles/dark/style.json'

    type LocationsType = Record<string, string>
    const locations: LocationsType = Locations
    const [isVisible, setIsVisible] = useState(true)
    const [tabBarPressed, setTabBarPressed] = useState(false)
    const opacity = useSharedValue(1)
    // required for android
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
            height: opacity.value === 0 ? 0 : 'auto',
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
            staleTime: 1000 * 60 * 60 * 24 * 14, // 2 week
            gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
            networkMode: 'always',
        })

    useEffect(() => {
        if (overlayError != null) {
            toast({
                title: t('toast.mapOverlay', { ns: 'common' }),
                preset: 'error',
                duration: 3,
                from: 'top',
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
                'Timetable is empty',
            ]
            if (ignoreErrors.includes(error?.message)) {
                return false
            }
            return failureCount < 2
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
        // @ts-expect-error - TabPress event is not defined in the type
        const unsubscribe = navigation.addListener('tabPress', (e) => {
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
            center: room.center,
            manual: false,
        })
        trackEvent('Room', {
            room: params.room,
            origin: 'InAppLink',
        })
        setCurrentFloor({
            floor: room.Ebene,
            manual: false,
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
        if (localSearch?.length === 1 && params.room != null) {
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
        },
    })

    useEffect(() => {
        async function load(): Promise<void> {
            if (roomStatusData == null) {
                console.debug('No room status data')
                return
            }
            try {
                const dateObj = new Date()
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
                animationMode: 'flyTo',
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
            animationMode: 'flyTo',
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
                animationMode: 'flyTo',
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
            fillOpacity: 0.1,
        },
        allRoomsOutline: {
            lineColor: isDark ? '#2d3035' : '#8e8e8e',
            lineWidth: 2.3,
        },
        availableRooms: {
            fillAntialias: true,
            fillOpacity: 0.2,
        },
        availableRoomsOutline: {
            lineWidth: 2.4,
        },
        osmBackground: {
            backgroundColor: isDark
                ? 'rgba(166, 173, 181, 0.70)'
                : 'rgba(218, 218, 218, 0.70)',
            paddingHorizontal: 4,
            borderRadius: theme.radius.sm,
        },
    }

    const [regionChange, setRegionChange] = useState<boolean>(false)

    useEffect(() => {
        // As required by the OSM attribution, the attribution must be displayed until the user interacts with the map or 5 seconds after the map has loaded
        let timer: any
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    return (
        <View style={styles.container}>
            <>
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
            </>

            <View style={styles.map}>
                <MapLibreGL.MapView
                    style={styles.map}
                    tintColor={
                        Platform.OS === 'ios' ? theme.colors.primary : undefined
                    }
                    logoEnabled={false}
                    styleURL={
                        UnistylesRuntime.themeName === 'dark'
                            ? darkStyle
                            : lightStyle
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
                    compassViewMargins={
                        Platform.OS === 'android'
                            ? {
                                  x: 5,
                                  y: 70,
                              }
                            : undefined
                    }
                >
                    {/* @ts-expect-error - The type definitions are incorrect */}
                    <MapLibreGL.Images
                        nativeAssetImages={['pin']}
                        images={{
                            // https://iconduck.com/icons/71717/map-marker - License: Creative Commons Zero v1.0 Universal
                            'map-marker': require('@/assets/map-marker.png'),
                        }}
                    />
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
                    {clickedElement !== null && (
                        <MapLibreGL.ShapeSource
                            id="clickedElementSource"
                            shape={{
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates:
                                                clickedElement.center as number[],
                                        },
                                        properties: {},
                                    },
                                ],
                            }}
                        >
                            <MapLibreGL.SymbolLayer
                                id="clickedElementMarker"
                                // eslint-disable-next-line react-native/no-inline-styles
                                style={{
                                    iconImage: 'map-marker',
                                    iconColor: theme.colors.primary,
                                    iconSize: 0.17,
                                    iconAnchor: 'bottom',
                                }}
                                layerIndex={104} // Ensure this layer is above others
                            />
                        </MapLibreGL.ShapeSource>
                    )}
                    {showFiltered() && (
                        <MapLibreGL.ShapeSource
                            id="allRoomsSource"
                            shape={filteredGeoJSON}
                            onPress={(e) => {
                                setClickedElement({
                                    data: e.features[0].properties?.Raum,
                                    type: SEARCH_TYPES.ROOM,
                                    center: e.features[0].properties?.center,
                                    manual: true,
                                })
                                trackEvent('Room', {
                                    room: e.features[0].properties?.Raum,
                                    origin: 'MapClick',
                                })
                                handlePresentModalPress()
                            }}
                            hitbox={{ width: 0, height: 0 }}
                        >
                            <MapLibreGL.FillLayer
                                id="allRoomsFill"
                                style={layerStyles.allRooms}
                                layerIndex={100}
                            />
                            <MapLibreGL.LineLayer
                                id="allRoomsOutline"
                                style={layerStyles.allRoomsOutline}
                                layerIndex={101}
                            />
                        </MapLibreGL.ShapeSource>
                    )}
                    {showAvailableFiltered() && (
                        <MapLibreGL.ShapeSource
                            id="availableRoomsSource"
                            shape={availableFilteredGeoJSON}
                        >
                            <MapLibreGL.FillLayer
                                id="availableRoomsFill"
                                style={{
                                    ...layerStyles.availableRooms,
                                    fillColor: theme.colors.primary,
                                }}
                                layerIndex={102}
                            />
                            <MapLibreGL.LineLayer
                                id="availableRoomsOutline"
                                style={{
                                    ...layerStyles.availableRoomsOutline,
                                    lineColor: theme.colors.primary,
                                }}
                                layerIndex={103}
                            />
                        </MapLibreGL.ShapeSource>
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

            {mapLoadState === LoadingState.LOADED && (
                <Animated.View
                    style={[
                        styles.osmContainer,
                        animatedStyles,
                        { top: Platform.OS === 'ios' ? -19 : -22 },
                    ]}
                >
                    <Pressable
                        onPressOut={() => {
                            void Linking.openURL(
                                'https://www.openstreetmap.org/copyright'
                            )
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
                    t,
                    i18n.language,
                    userKind === USER_GUEST
                )}
            />
        </View>
    )
}

export default MapScreen

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
    },
    errorContainer: {
        backgroundColor: theme.colors.background,
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        zIndex: 100,
    },
    map: {
        flex: 1,
    },
    osmAtrribution: { fontSize: 13 },
    osmContainer: {
        alignItems: 'flex-end',
        height: 30,
        marginRight: 4,
        position: 'absolute',
        right: 0,
        top: -24,
        zIndex: 99,
    },
}))
