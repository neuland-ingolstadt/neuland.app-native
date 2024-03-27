/* eslint-disable react-native/no-color-literals */
import NeulandAPI from '@/api/neuland-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import BottomSheetBackground from '@/components/Elements/Map/BottomSheetBackground'
import {
    _addRoom,
    _injectCurrentLocation,
    _injectMarker,
    _removeAllGeoJson,
    _removeMarker,
    _setView,
    htmlScript,
} from '@/components/Elements/Map/leaflet'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { RouteParamsContext, UserKindContext } from '@/components/contexts'
import i18n from '@/localization/i18n'
import { type RoomsOverlay } from '@/types/asset-api'
import { type FormListSections } from '@/types/components'
import { type AvailableRoom, type RoomEntry } from '@/types/utils'
import {
    formatFriendlyTime,
    formatISODate,
    formatISOTime,
} from '@/utils/date-utils'
import {
    BUILDINGS,
    BUILDINGS_IN,
    BUILDINGS_ND,
    filterRooms,
    getCenter,
    getCenterSingle,
    getNextValidDate,
} from '@/utils/room-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import BottomSheet, {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetTextInput,
    BottomSheetView,
    TouchableOpacity,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import { StatusBar } from 'expo-status-bar'
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
    Keyboard,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated'
import { WebView } from 'react-native-webview'

import packageInfo from '../../../package.json'

export default function Screen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>Map</title>
                <meta name="Campus Map" content="Interactive Campus Map" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <View
                style={{
                    ...styles.page,
                }}
            >
                {isPageOpen ? <MapScreen /> : <></>}
            </View>
        </>
    )
}

export const MapScreen = (): JSX.Element => {
    const FLOOR_ORDER = ['4', '3', '2', '1.5', '1', 'EG', '-1']
    const FLOOR_SUBSTITUTES: Record<string, string> = {
        0: 'EG',
        0.5: '1.5',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
    }

    const [errorMsg, setErrorMsg] = useState('')
    const colors = useTheme().colors as Colors
    const { userKind, userFaculty } = useContext(UserKindContext)
    const { routeParams, updateRouteParams } = useContext(RouteParamsContext)
    const [webViewKey, setWebViewKey] = useState(0)
    const [currentFloor, setCurrentFloor] = useState('EG')
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)

    const INGOLSTADT_CENTER = [48.7668, 11.4328]
    const NEUBURG_CENTER = [48.73227, 11.17261]
    const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)
    // const { addUnlockedAppIcon, unlockedAppIcons } = useContext(AppIconContext)
    const mapRef = useRef<WebView>(null)
    const router = useRouter()
    const { t } = useTranslation('common')
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    )
    const [localSearch, setLocalSearch] = useState('')
    const bottomSheetRef = useRef<BottomSheet>(null)
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const [clickedElement, setClickedElement] = useState<ClickedElement | null>(
        null
    )

    const currentPosition = useSharedValue(0)
    const currentPositionModal = useSharedValue(0)

    const animatedStyles = useAnimatedStyle(() => {
        const bottom =
            clickedElement != null
                ? currentPositionModal.value
                : currentPosition.value

        return {
            transform: [{ translateY: bottom }],
        }
    })

    const [showAllFloors, setShowAllFloors] = useState(false)

    const toggleShowAllFloors = (): void => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setShowAllFloors(!showAllFloors)
    }

    interface RoomData {
        title: string
        subtitle: string
        properties: RoomEntry['properties'] | null
        occupancies: AvailableRoom | null
        type: SEARCH_TYPES
    }

    interface ClickedElement {
        type: SEARCH_TYPES
        data: string
    }

    const handleSheetChangesModal = useCallback((index: number) => {
        console.log('handleSheetChangesModal', index)
        if (index === -1) {
            setClickedElement(null)
            setLocalSearch('')
            setFilteredRooms(allRooms)
            _setView(mapCenter, mapRef)
            _removeMarker(mapRef)
            bottomSheetRef.current?.snapToIndex(1)
        }
    }, [])

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present()
    }, [])

    useEffect(() => {
        // console.log('clickedElement:', routeParams)
        if (routeParams === null || routeParams === '') {
            return
        }
        setClickedElement({
            data: routeParams,
            type: SEARCH_TYPES.ROOM,
        })

        const room = allRooms.find((x) => x.properties.Raum === routeParams)
        const center = getCenterSingle(room?.coordinates)
        const etage = room?.properties.Ebene
        _setView(center, mapRef)
        setCurrentFloor(etage ?? 'EG')
        _injectMarker(mapRef, center)
        Keyboard.dismiss()
        bottomSheetRef.current?.close()
        handlePresentModalPress()
    }, [routeParams])

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription
        void (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied')
                return
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // Update every 1 second
                    distanceInterval: 1, // Or every 1 meter
                },
                (location) => {
                    setLocation(location)
                }
            )
        })()

        return () => {
            if (locationSubscription != null) {
                locationSubscription.remove()
            }
        }
    }, [])

    // get coordiates of a giving room name

    const handleShareModal = (): void => {
        const room = filteredRooms[0].properties.Raum
        const payload = 'https://neuland.app/rooms/?highlight=' + room
        trackEvent('Share', {
            type: 'room',
        })
        void Share.share(
            Platform.OS === 'android' ? { message: payload } : { url: payload }
        )
    }

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

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const dateObj = getNextValidDate()
                const date = formatISODate(dateObj)
                const time = formatISOTime(dateObj)
                const rooms = await filterRooms(date, time)
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
        void load()
    }, [userKind, webViewKey])

    const {
        data: mapOverlay,
        refetch,
        error: overlayError,
    } = useQuery<RoomsOverlay>({
        queryKey: ['mapOverlay', packageInfo.version],
        queryFn: async () => await NeulandAPI.getMapOverlay(),
        staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        gcTime: 1000 * 60 * 60 * 24 * 14, // 2 weeks,
        // networkMode: 'always',
    })

    useEffect(() => {
        if (overlayError !== null) {
            void refetch()
        }
    }, [webViewKey])

    const allRooms = useMemo(() => {
        // filter and process the map overlay data

        if (mapOverlay == null) {
            return []
        }

        return mapOverlay.features
            .map((feature) => {
                const { geometry, properties } = feature

                if (
                    geometry?.coordinates == null ||
                    geometry.type !== 'Polygon'
                ) {
                    return []
                }

                if (properties.Ebene in FLOOR_SUBSTITUTES) {
                    properties.Ebene = FLOOR_SUBSTITUTES[properties.Ebene]
                }
                if (!FLOOR_ORDER.includes(properties.Ebene)) {
                    FLOOR_ORDER.push(properties.Ebene)
                }

                return geometry.coordinates.map((points: any) => ({
                    properties,
                    coordinates: points,
                    options: {},
                }))
            })
            .flat()
    }, [mapOverlay])
    const [filteredRooms, setFilteredRooms] = useState<RoomEntry[]>(allRooms)

    enum SEARCH_TYPES {
        BUILDING,
        ROOM,
        ROOMTYPE,
        LECTURE,
    }
    interface searchResult {
        type: SEARCH_TYPES
        highlight: RoomEntry[]
        title: string
        subtitle: string
        center: number[]
    }

    const [searchResults, center]: [searchResult[], number[]] = useMemo(() => {
        // determinate the searchType
        const searchType = (search: string): SEARCH_TYPES => {
            if (
                (search.length === 1 || search.length === 2) &&
                isNaN(Number(search[1]))
            ) {
                return SEARCH_TYPES.BUILDING
            }

            if (/^[A-Z](G|[0-9E]\.)?\d*$/.test(search)) {
                return SEARCH_TYPES.ROOM
            }

            if (/^[A-Z]+$/.test(search)) {
                return SEARCH_TYPES.ROOMTYPE
            }

            return SEARCH_TYPES.LECTURE
        }
        // basend on the type filter the rooms and setthe results
        switch (searchType(localSearch)) {
            case SEARCH_TYPES.BUILDING: {
                // check if building is in BUILDINGS_IN, BUILDINGS_ND and use it for subtitle
                const isValidBuilding = BUILDINGS.includes(
                    localSearch.toLocaleUpperCase()
                )

                const location = BUILDINGS_IN.includes(localSearch)
                    ? 'Ingolstadt'
                    : BUILDINGS_ND.includes(localSearch)
                      ? 'Neuburg'
                      : 'All'

                const building = localSearch + ' Building'
                const highlight = allRooms.filter(
                    (room) => room.properties.Gebaeude === localSearch
                )
                const center = getCenter(highlight)
                const result = isValidBuilding
                    ? [
                          {
                              type: SEARCH_TYPES.BUILDING,
                              highlight,
                              title: building,
                              subtitle: location,
                              center,
                          },
                      ]
                    : []
                // also add 9 rooms to the searchResults
                // also add 9 rooms to the searchResults
                const additionalResults = allRooms
                    .filter((room) => room.properties.Gebaeude === localSearch)
                    .map((room) => ({
                        type: SEARCH_TYPES.ROOM,
                        highlight: [room], // Wrap room in an array
                        title: room.properties.Raum,
                        subtitle: room.properties.Funktion_en,
                        center: getCenter([room]),
                    }))

                // combine the results
                const combined = [...result, ...additionalResults]

                return [combined, center]
            }
            case SEARCH_TYPES.ROOM: {
                // filter rooms that match the search
                const highlight = allRooms.filter((room) =>
                    room.properties.Raum.startsWith(localSearch)
                )
                const result = highlight.map((room) => ({
                    type: SEARCH_TYPES.ROOM,
                    highlight: [room], // Wrap room in an array
                    title: room.properties.Raum,
                    subtitle: room.properties.Funktion_en,
                    center: getCenter([room]),
                }))

                return [result, getCenter(highlight)]
            }
            default: {
                return [[], []]
            }
            // ...rest of your switch cases
        }
    }, [localSearch, allRooms])

    const uniqueEtages = Array.from(
        new Set(
            (Array.isArray(filteredRooms)
                ? filteredRooms
                : Object.values(filteredRooms)
            )
                .map((room: any) => room.properties?.Ebene?.toString())
                .filter((etage) => etage != null)
        )
    ).sort((a, b) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b))

    useEffect(() => {
        const currentFloor = uniqueEtages.includes('EG')
            ? 'EG'
            : uniqueEtages[uniqueEtages.length - 1]
        setCurrentFloor(currentFloor)
    }, [filteredRooms, localSearch])

    useEffect(() => {
        if (LoadingState.LOADED !== loadingState) return
        // _removeMarker(mapRef)
        bottomSheetModalRef.current?.close()
        bottomSheetRef.current?.snapToIndex(1)
        _removeAllGeoJson(mapRef)
        _addGeoJson()
    }, [
        currentFloor,
        filteredRooms,
        colors,
        availableRooms,
        allRooms,
        loadingState,
    ])

    const filterEtage = (etage: string): RoomEntry[] => {
        const result = filteredRooms.filter(
            (feature) => feature.properties.Ebene === etage
        )
        return result
    }

    const FloorPicker = ({
        floors,
        showAllFloors,
        toggleShowAllFloors,
    }: {
        floors: string[]
        showAllFloors: boolean
        toggleShowAllFloors: () => void
    }): JSX.Element => {
        const colors = useTheme().colors as Colors

        return (
            <View style={styles.ButtonArea}>
                <View>
                    {!showAllFloors && (
                        <Pressable
                            onPress={() => {
                                toggleShowAllFloors()
                                if (Platform.OS === 'ios') {
                                    void Haptics.selectionAsync()
                                }
                            }}
                        >
                            <Animated.View
                                style={{
                                    ...styles.ButtonAreaSection,
                                    ...(!showAllFloors
                                        ? styles.borderWithNormal
                                        : styles.borderWidthEmpty),
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                }}
                            >
                                <View style={styles.Button}>
                                    <Text
                                        style={{
                                            ...styles.ButtonText,
                                            color: colors.text,
                                        }}
                                    >
                                        {currentFloor === 'EG'
                                            ? '0'
                                            : currentFloor}
                                    </Text>
                                </View>
                            </Animated.View>
                        </Pressable>
                    )}
                    {showAllFloors && (
                        <View style={[]}>
                            <Pressable
                                onPress={() => {
                                    if (Platform.OS === 'ios') {
                                        void Haptics.selectionAsync()
                                    }
                                    toggleShowAllFloors()
                                }}
                            >
                                <View style={styles.Button}>
                                    <PlatformIcon
                                        color={'#4a4a4aff'}
                                        ios={{
                                            name: 'xmark.circle.fill',
                                            size: 26,
                                        }}
                                        android={{
                                            name: 'close',
                                            size: 22,
                                        }}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    )}
                    {showAllFloors && (
                        <View
                            style={[
                                styles.ButtonAreaSection,
                                {
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            {floors.map((floor, index) => (
                                <Pressable
                                    onPress={() => {
                                        setCurrentFloor(floor)
                                    }}
                                    key={index}
                                >
                                    <View
                                        style={[
                                            styles.Button,
                                            // eslint-disable-next-line react-native/no-inline-styles
                                            {
                                                borderBottomColor:
                                                    colors.border,
                                                backgroundColor:
                                                    currentFloor === floor
                                                        ? colors.primary
                                                        : colors.card,
                                                borderBottomWidth:
                                                    index === floors.length - 1
                                                        ? 0
                                                        : 1,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.ButtonText,
                                                {
                                                    color:
                                                        currentFloor === floor
                                                            ? colors.background
                                                            : colors.text,
                                                },
                                            ]}
                                        >
                                            {floor === 'EG' ? '0' : floor}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                    {
                        <Pressable
                            onPress={() => {
                                if (location === null) return
                                _injectCurrentLocation(
                                    mapRef,
                                    colors,
                                    location.coords.accuracy ?? 5,
                                    [
                                        location.coords.latitude,
                                        location.coords.longitude,
                                    ]
                                )
                                _setView(
                                    [
                                        location.coords.latitude,
                                        location.coords.longitude,
                                    ],
                                    mapRef
                                )
                            }}
                        >
                            <View
                                style={{
                                    ...styles.ButtonAreaSection,
                                    ...(!showAllFloors
                                        ? styles.borderWithNormal
                                        : styles.borderWidthEmpty),
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                }}
                            >
                                <View style={styles.Button}>
                                    <PlatformIcon
                                        color={colors.labelColor}
                                        ios={{
                                            name: 'location.fill',
                                            size: 18,
                                        }}
                                        android={{
                                            name: 'near_me',
                                            size: 22,
                                        }}
                                    />
                                </View>
                            </View>
                        </Pressable>
                    }
                    {filteredRooms.length === 1 && (
                        <View
                            style={[
                                styles.ButtonAreaSection,
                                {
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Pressable
                                onPress={() => {
                                    handleShareModal()
                                }}
                            >
                                <View
                                    style={[
                                        styles.Button,
                                        {
                                            backgroundColor: colors.card,
                                        },
                                    ]}
                                >
                                    <PlatformIcon
                                        color={colors.text}
                                        ios={{
                                            name: 'square.and.arrow.up',
                                            size: 18,
                                        }}
                                        android={{
                                            name: 'share',
                                            size: 22,
                                        }}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    const _addGeoJson = (): void => {
        const filteredFeatures = filterEtage(currentFloor)
        filteredFeatures?.forEach((feature) => {
            _addRoom(feature, availableRooms, mapRef, colors)
        })
    }

    const onContentProcessDidTerminate = (): void => {
        setWebViewKey((k) => k + 1)
        _addGeoJson()
    }

    const getRoomData = (room: string): any => {
        const occupancies = availableRooms?.find((x) => x.room === room)
        const properties = filteredRooms.find(
            (x) => x.properties.Raum === room
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
        const buildingCode = building.split(' ')[0]
        const roomNumber = filteredRooms.filter(
            (x) => x.properties.Gebaeude === buildingCode
        ).length
        const buildingData = {
            title: building,
            subtitle: roomNumber + ' Rooms',
            properties: null,
            occupancies: null,
            type: SEARCH_TYPES.BUILDING,
        }
        return buildingData
    }

    enum Locations {
        IN = 'Ingolstadt',
        ND = 'Neuburg',
    }

    type LocationsType = Record<string, string>
    const locations: LocationsType = Locations

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

    const roomSection: FormListSections[] =
        roomData.occupancies !== null || roomData.properties !== null
            ? [
                  {
                      header: t('pages.map.details.room.availability'),
                      items:
                          roomData.occupancies == null
                              ? [
                                    {
                                        title: t(
                                            'pages.map.details.room.available'
                                        ),
                                        value: t(
                                            'pages.map.details.room.notAvailable'
                                        ),
                                    },
                                ]
                              : [
                                    {
                                        title: t(
                                            'pages.map.details.room.timeLeft'
                                        ),
                                        value: (() => {
                                            const timeLeft =
                                                new Date(
                                                    roomData.occupancies.until
                                                ).getTime() -
                                                new Date().getTime()
                                            const minutes = Math.floor(
                                                (timeLeft / 1000 / 60) % 60
                                            )
                                            const hours = Math.floor(
                                                (timeLeft / (1000 * 60 * 60)) %
                                                    24
                                            )
                                            const formattedMinutes =
                                                minutes < 10
                                                    ? `0${minutes}`
                                                    : minutes
                                            return `${hours}:${formattedMinutes}h`
                                        })(),
                                    },
                                    {
                                        title: t(
                                            'pages.map.details.room.timeSpan'
                                        ),
                                        value: `${formatFriendlyTime(
                                            roomData.occupancies.from
                                        )} - ${formatFriendlyTime(
                                            roomData.occupancies.until
                                        )}`,
                                    },
                                ],
                  },
                  ...(roomData.properties !== null
                      ? [
                            {
                                header: t('pages.map.details.room.details'),
                                items: [
                                    {
                                        title: t('pages.map.details.room.type'),
                                        value:
                                            roomData.properties.Funktion_en ??
                                            t('misc.unknown'),
                                    },
                                    ...(roomData.occupancies != null
                                        ? [
                                              {
                                                  title: t(
                                                      'pages.map.details.room.capacity'
                                                  ),
                                                  value: `${roomData.occupancies.capacity} ${t('pages.rooms.options.seats')}`,
                                              },
                                          ]
                                        : []),
                                    {
                                        title: t(
                                            'pages.map.details.room.building'
                                        ),
                                        value:
                                            roomData.properties.Gebaeude ??
                                            t('misc.unknown'),
                                    },
                                    {
                                        title: t(
                                            'pages.map.details.room.floor'
                                        ),
                                        value:
                                            roomData.properties.Ebene ??
                                            t('misc.unknown'),
                                    },
                                    {
                                        title: 'Campus',
                                        value:
                                            locations[
                                                roomData.properties.Standort
                                            ] ?? t('misc.unknown'),
                                    },
                                ],
                            },
                        ]
                      : []),
              ]
            : []

    /**
     * Adjusts error message to use it with ErrorView
     * @param errorMsg Error message
     * @returns
     */
    function adjustErrorTitle(errorMsg: string): string {
        switch (errorMsg) {
            case 'noInternetConnection':
                return 'Network request failed'
            case 'mapLoadError':
                return t('error.map.mapLoadError')
            case 'mapOverlay':
                return t('error.map.mapOverlay')
            default:
                return 'Error'
        }
    }

    // get room data for given room, like properties, availability, etc.

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.innerContainer}>
                {loadingState === LoadingState.ERROR ||
                    (overlayError !== null && (
                        <View
                            style={{
                                backgroundColor: colors.background,
                                ...styles.errorContainer,
                            }}
                        >
                            <ErrorView
                                title={adjustErrorTitle(errorMsg)}
                                onButtonPress={() => {
                                    setWebViewKey(webViewKey + 1)
                                    setLoadingState(LoadingState.LOADING)
                                }}
                            />
                        </View>
                    ))}

                <View style={styles.map}>
                    <WebView
                        key={webViewKey}
                        ref={mapRef}
                        source={{
                            html: htmlScript,
                        }}
                        onLoadEnd={() => {
                            if (loadingState !== LoadingState.ERROR) {
                                console.log('Map loaded')
                                setFilteredRooms(allRooms)
                                setLoadingState(LoadingState.LOADED)
                                _setView(
                                    localSearch !== '' ? center : mapCenter,
                                    mapRef
                                )
                                _addGeoJson()
                            }
                        }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View
                                style={{
                                    ...styles.loadingContainer,
                                    backgroundColor: colors.background,
                                }}
                            >
                                <ActivityIndicator
                                    style={styles.loadingIndicator}
                                />
                            </View>
                        )}
                        onContentProcessDidTerminate={
                            onContentProcessDidTerminate
                        }
                        onMessage={(event) => {
                            let data = event.nativeEvent.data as any

                            if (typeof data === 'string') {
                                try {
                                    data = JSON.parse(data)
                                } catch (e) {
                                    console.error('Could not parse data:', e)
                                }
                            }

                            if (
                                // data === 'mapLoadError'
                                data === 'noInternetConnection'
                            ) {
                                setLoadingState(LoadingState.ERROR)
                                setErrorMsg(data)
                            } else if (data.type === 'roomClick') {
                                setClickedElement({
                                    data: data.payload.properties.room,
                                    type: SEARCH_TYPES.ROOM,
                                })
                                const center = getCenterSingle(
                                    data.payload.properties.coordinates
                                )

                                _injectMarker(mapRef, center)
                                Keyboard.dismiss()
                                bottomSheetRef.current?.close()
                                handlePresentModalPress()
                            } else {
                                console.log('Unhandled message:', data)
                            }
                        }}
                        style={{
                            backgroundColor: colors.background,
                        }}
                    ></WebView>
                    {loadingState === LoadingState.LOADED && (
                        <>
                            <FloorPicker
                                floors={uniqueEtages}
                                showAllFloors={showAllFloors}
                                toggleShowAllFloors={toggleShowAllFloors}
                            />
                        </>
                    )}
                </View>
            </View>
            <Animated.View style={[styles.osmContainer, animatedStyles]}>
                <Pressable
                    onPress={() => {
                        void Linking.openURL(
                            'https://www.openstreetmap.org/copyright'
                        )
                    }}
                    style={styles.osmBackground}
                >
                    <Text style={styles.osmAtrribution}>
                        {'© OpenStreetMap'}
                    </Text>
                </Pressable>
            </Animated.View>
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={['10%', '30%', '92%']}
                backgroundComponent={BottomSheetBackground}
                animatedPosition={currentPosition}
                keyboardBehavior="extend"
            >
                <View
                    style={{
                        paddingHorizontal: PAGE_PADDING,
                    }}
                >
                    <BottomSheetTextInput
                        style={{
                            ...styles.textInput,
                            color: colors.text,
                            ...Platform.select({
                                android: {
                                    backgroundColor: colors.card,
                                },
                            }),
                        }}
                        placeholder={t('pages.map.search')}
                        placeholderTextColor={colors.labelColor}
                        value={localSearch}
                        enablesReturnKeyAutomatically
                        clearButtonMode="always"
                        enterKeyHint="search"
                        onChangeText={(text) => {
                            setLocalSearch(text.toUpperCase().trim())
                        }}
                        onFocus={() => {
                            bottomSheetRef.current?.snapToIndex(2)
                        }}
                        onEndEditing={() => {
                            // dismiss the keyboard when the user is done typing
                            bottomSheetRef.current?.collapse()
                        }}
                    />
                    {localSearch !== '' ? (
                        searchResults.length > 0 ? (
                            <>
                                <View>
                                    {searchResults.map((result, index) => {
                                        const icon =
                                            result.type ===
                                            SEARCH_TYPES.BUILDING
                                                ? 'building'
                                                : result.type ===
                                                    SEARCH_TYPES.ROOM
                                                  ? 'studentdesk'
                                                  : result.type ===
                                                      SEARCH_TYPES.ROOMTYPE
                                                    ? 'edit'
                                                    : 'lecture'
                                        return (
                                            <React.Fragment key={index}>
                                                <TouchableOpacity
                                                    style={
                                                        styles.searchRowContainer
                                                    }
                                                    onPress={() => {
                                                        Keyboard.dismiss()
                                                        bottomSheetRef.current?.collapse()
                                                        _setView(
                                                            result.center,
                                                            mapRef
                                                        )
                                                        setClickedElement({
                                                            data: result.title,
                                                            type: result.type,
                                                        })
                                                        handlePresentModalPress()
                                                        // bottomSheetRef.current?.forceClose()

                                                        // print the center of the highlighted room(s) to the console
                                                        _injectMarker(
                                                            mapRef,
                                                            result.center
                                                        )
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            ...styles.searchIconContainer,
                                                            backgroundColor:
                                                                colors.primary,
                                                        }}
                                                    >
                                                        <PlatformIcon
                                                            color={
                                                                colors.background
                                                            }
                                                            ios={{
                                                                name: icon,
                                                                size: 18,
                                                            }}
                                                            android={{
                                                                name: 'edit',
                                                                size: 20,
                                                            }}
                                                        />
                                                    </View>

                                                    <View>
                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                ...styles.suggestionTitle,
                                                            }}
                                                        >
                                                            {result.title}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                ...styles.suggestionSubtitle,
                                                            }}
                                                        >
                                                            {result.subtitle}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                                {index !== 9 && (
                                                    <Divider
                                                        iosPaddingLeft={50}
                                                    />
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                </View>
                            </>
                        ) : (
                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.noResults,
                                }}
                            >
                                {t('pages.map.noResults')}
                            </Text>
                        )
                    ) : (
                        availableRooms.length > 0 && (
                            <>
                                <View
                                    style={
                                        styles.suggestionSectionHeaderContainer
                                    }
                                >
                                    <Text
                                        style={{
                                            color: colors.text,
                                            ...styles.suggestionSectionHeader,
                                        }}
                                    >
                                        {t(
                                            'pages.map.details.room.availableRooms'
                                        )}
                                    </Text>
                                    <Pressable
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            router.push('(map)/advanced')
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.primary,
                                                ...styles.suggestionMoreButtonText,
                                            }}
                                        >
                                            {t('misc.more')}
                                        </Text>
                                    </Pressable>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        ...styles.radius,
                                    }}
                                >
                                    {availableRooms
                                        .slice(0, 3)
                                        .map((room, key) => (
                                            <>
                                                <Pressable
                                                    key={key}
                                                    style={styles.suggestionRow}
                                                    onPress={() => {
                                                        const details =
                                                            allRooms.find(
                                                                (x) =>
                                                                    x.properties
                                                                        .Raum ===
                                                                    room.room
                                                            )

                                                        const center =
                                                            getCenterSingle(
                                                                details?.coordinates
                                                            )

                                                        const etage =
                                                            details?.properties
                                                                .Ebene

                                                        _setView(
                                                            getCenterSingle(
                                                                details?.coordinates
                                                            ),
                                                            mapRef
                                                        )
                                                        setCurrentFloor(
                                                            etage ?? 'EG'
                                                        )
                                                        setClickedElement({
                                                            data: room.room,
                                                            type: SEARCH_TYPES.ROOM,
                                                        })
                                                        _injectMarker(
                                                            mapRef,
                                                            center
                                                        )

                                                        handlePresentModalPress()
                                                        bottomSheetRef.current?.forceClose()
                                                    }}
                                                >
                                                    <View
                                                        style={
                                                            styles.suggestionInnerRow
                                                        }
                                                    >
                                                        <View
                                                            style={{
                                                                backgroundColor:
                                                                    colors.primary,
                                                                ...styles.suggestionIconContainer,
                                                            }}
                                                        >
                                                            <PlatformIcon
                                                                color={
                                                                    colors.background
                                                                }
                                                                ios={{
                                                                    name: 'studentdesk',
                                                                    size: 18,
                                                                }}
                                                                android={{
                                                                    name: 'edit',
                                                                    size: 20,
                                                                }}
                                                            />
                                                        </View>

                                                        <View>
                                                            <Text
                                                                style={{
                                                                    color: colors.text,
                                                                    ...styles.suggestionTitle,
                                                                }}
                                                            >
                                                                {room.room}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    color: colors.text,
                                                                    ...styles.suggestionSubtitle,
                                                                }}
                                                            >
                                                                {room.type} (
                                                                {room.capacity}{' '}
                                                                seats)
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.suggestionRightContainer
                                                        }
                                                    >
                                                        <Text
                                                            style={{
                                                                color: colors.labelColor,
                                                                fontVariant: [
                                                                    'tabular-nums',
                                                                ],
                                                            }}
                                                        >
                                                            {formatFriendlyTime(
                                                                room.from
                                                            )}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                fontVariant: [
                                                                    'tabular-nums',
                                                                ],
                                                            }}
                                                        >
                                                            {formatFriendlyTime(
                                                                room.until
                                                            )}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                                {key !== 2 && <Divider />}
                                            </>
                                        ))}
                                </View>
                            </>
                        )
                    )}
                </View>
            </BottomSheet>

            <BottomSheetModalProvider>
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    snapPoints={['30%', '47%', '60%']}
                    onChange={handleSheetChangesModal}
                    backgroundComponent={BottomSheetBackground}
                    animatedPosition={currentPositionModal}
                >
                    <BottomSheetView style={styles.contentContainer}>
                        <View style={styles.roomSectionHeaderContainer}>
                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.roomSectionHeader,
                                }}
                            >
                                {roomData.title}
                            </Text>
                            <Pressable
                                onPress={() => {
                                    bottomSheetModalRef.current?.close()
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        ...styles.roomDismissButton,
                                    }}
                                >
                                    <PlatformIcon
                                        color={colors.text}
                                        ios={{
                                            name: 'chevron.down',
                                            size: 14,
                                        }}
                                        android={{
                                            name: 'expand_more',
                                            size: 24,
                                        }}
                                        style={Platform.select({
                                            android: {
                                                height: 24,
                                                width: 24,
                                            },
                                        })}
                                    />
                                </View>
                            </Pressable>
                        </View>
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.roomSubtitle,
                            }}
                        >
                            {roomData.subtitle}
                        </Text>
                        <View style={styles.formList}>
                            <FormList sections={roomSection} />
                        </View>
                    </BottomSheetView>
                </BottomSheetModal>
            </BottomSheetModalProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: { flex: 1 },
    map: {
        flex: 1,
        position: 'relative',
    },
    ButtonArea: {
        marginHorizontal: 10,
        marginTop: 100,
        position: 'absolute',
        right: 0,
    },
    formList: {
        marginVertical: 16,
        width: '100%',
        alignSelf: 'center',
    },

    ButtonAreaSection: {
        borderRadius: 7,
        overflow: 'hidden',
        borderWidth: 1,
        marginTop: 5,
    },
    borderWidthEmpty: {
        borderWidth: 0,
    },
    borderWithNormal: {
        borderWidth: 1,
    },
    Button: {
        width: 38,
        height: 38,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    ButtonText: {
        fontWeight: '500',
        fontSize: 14,
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 3,
        paddingTop: 70,
        alignItems: 'center',
    },
    loadingContainer: {
        top: 0,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 2,
    },
    loadingIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 3,
    },
    page: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: PAGE_PADDING,
    },
    suggestionSectionHeader: {
        fontWeight: '600',
        fontSize: 22,
        marginTop: 6,
        marginBottom: 6,
        textAlign: 'left',
    },
    suggestionSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    suggestionMoreButtonText: {
        textAlign: 'right',
        marginBottom: -16,
        paddingRight: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    roomSectionHeader: {
        fontWeight: '600',
        fontSize: 24,
        marginBottom: 4,
        textAlign: 'left',
    },
    roomSubtitle: {
        fontSize: 16,
    },
    roomSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textInput: {
        backgroundColor: 'rgba(6, 6, 6, 0.16)',
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    searchRowContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    searchIconContainer: {
        marginRight: 14,

        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionRow: {
        padding: 10,
        flexDirection: 'row',

        justifyContent: 'space-between',
    },
    suggestionInnerRow: {
        flexDirection: 'row',
    },
    suggestionIconContainer: {
        marginRight: 14,
        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    suggestionSubtitle: {
        fontWeight: '400',
        fontSize: 14,
    },
    suggestionRightContainer: {
        paddingRight: 10,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    radius: {
        borderRadius: 14,
    },
    roomDismissButton: {
        borderRadius: 25,
        padding: 7,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    osmAtrribution: { fontSize: 12 },
    osmContainer: {
        height: 30,
        right: 0,
        top: -17,
        marginRight: 4,
        alignItems: 'flex-end',
        zIndex: 100,
        position: 'absolute',
    },
    osmBackground: {
        backgroundColor: 'rgba(222, 221, 203, 0.69)',
        paddingHorizontal: 4,
        borderRadius: 4,
    },

    noResults: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
})
