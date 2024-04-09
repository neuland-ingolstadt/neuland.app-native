/* eslint-disable react-native/no-color-literals */
import API from '@/api/authenticated-api'
import NeulandAPI from '@/api/neuland-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import { BottomSheetDetailModal } from '@/components/Elements/Map/BottomSheetDetailModal'
import MapBottomSheet from '@/components/Elements/Map/BottomSheetMap'
import FloorPicker from '@/components/Elements/Map/FloorPicker'
import {
    _addRoom,
    _injectMarker,
    _removeAllGeoJson,
    _removeMarker,
    _setView,
    htmlScript,
} from '@/components/Elements/Map/leaflet'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import { type Colors } from '@/components/colors'
import { RouteParamsContext, UserKindContext } from '@/components/contexts'
import { MapContext } from '@/hooks/contexts/map'
import i18n from '@/localization/i18n'
import {
    type FeatureProperties,
    Gebaeude,
    type RoomsOverlay,
} from '@/types/asset-api'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { type RoomEntry } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    BUILDINGS,
    FLOOR_ORDER,
    FLOOR_SUBSTITUTES,
    INGOLSTADT_CENTER,
    NEUBURG_CENTER,
    adjustErrorTitle,
    filterRooms,
    getCenter,
    getCenterSingle,
    getIcon,
    getNextValidDate,
} from '@/utils/map-utils'
import { LoadingState, showToast } from '@/utils/ui-utils'
import type BottomSheet from '@gorhom/bottom-sheet'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
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
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated'
import { WebView } from 'react-native-webview'

import packageInfo from '../../../../package.json'
import { modalSection } from './ModalSections'

const MapScreen = (): JSX.Element => {
    const [errorMsg, setErrorMsg] = useState('')
    const colors = useTheme().colors as Colors
    const { userKind, userFaculty } = useContext(UserKindContext)
    const { routeParams, updateRouteParams } = useContext(RouteParamsContext)
    const [webViewKey, setWebViewKey] = useState(0)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)
    const { t } = useTranslation('common')
    const bottomSheetRef = useRef<BottomSheet>(null)
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const currentPosition = useSharedValue(0)
    const currentPositionModal = useSharedValue(0)
    const mapRef = useRef<WebView>(null)
    const {
        localSearch,
        clickedElement,
        setClickedElement,
        availableRooms,
        setAvailableRooms,
        currentFloor,
        setCurrentFloor,
    } = useContext(MapContext)

    const [showAllFloors, setShowAllFloors] = useState(false)

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
        }
    })

    const handleSheetChangesModal = useCallback((index: number) => {
        if (index === -1) {
            setClickedElement(null)
            setCurrentFloor('EG')
            _setView(mapCenter, mapRef)
            _removeMarker(mapRef)
            bottomSheetRef.current?.snapToIndex(1)
        }
    }, [])

    const handlePresentModalPress = useCallback(() => {
        bottomSheetRef.current?.close()
        bottomSheetModalRef.current?.present()
    }, [])

    const {
        data: mapOverlay,
        refetch,
        error: overlayError,
    } = useQuery<RoomsOverlay>({
        queryKey: ['mapOverlay', packageInfo.version],
        queryFn: async () => await NeulandAPI.getMapOverlay(),
        staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        gcTime: 1000 * 60 * 60 * 24 * 90, // 90 days
        networkMode: 'always',
    })

    const allRooms = useMemo(() => {
        if (mapOverlay == null) {
            return []
        }

        const rooms = mapOverlay.features
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

                return geometry.coordinates.map((points: number[][]) => ({
                    properties,
                    coordinates: points,
                    options: {
                        type: SEARCH_TYPES.ROOM,
                        center: getCenterSingle(points),
                        icon: getIcon(SEARCH_TYPES.ROOM, {
                            result: { item: { properties } },
                        }),
                    },
                }))
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

            return {
                properties: {
                    Raum: building,
                    Funktion_en: 'Building',
                    Funktion_de: 'Gebäude',
                    Gebaeude: Gebaeude[building as keyof typeof Gebaeude],
                    Ebene: 'EG', // Dummy value to not break the floor picker
                    Etage: floorCount.toString(),
                    Standort: location,
                } satisfies FeatureProperties,
                coordinates: [],
                options: {
                    type: SEARCH_TYPES.BUILDING,
                    center: getCenter(buildingRooms.map((x) => x.coordinates)),
                    icon: getIcon(SEARCH_TYPES.BUILDING),
                },
            }
        })
        return [...rooms, ...buildings]
    }, [mapOverlay])

    const navigation = useNavigation()

    useEffect(() => {
        // @ts-expect-error - no types for tabPress
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            _setView(mapCenter, mapRef)
        })

        return unsubscribe
    }, [navigation])

    useEffect(() => {
        if (routeParams === null || routeParams === '') {
            return
        }
        setClickedElement({
            data: routeParams,
            type: SEARCH_TYPES.ROOM,
        })

        const room = allRooms.find((x) => x.properties.Raum === routeParams)
        if (room == null) {
            void showToast(t('toast.roomNotFound'))
            updateRouteParams('')
            return
        }
        const center = room.options.center
        const etage = room?.properties.Ebene
        _setView(center, mapRef)
        setCurrentFloor(etage ?? 'EG')
        _injectMarker(mapRef, center)
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
    const currentDate = new Date()

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
    }, [userKind, webViewKey, roomStatusData])

    useEffect(() => {
        if (overlayError !== null) {
            void refetch()
        }
    }, [webViewKey])

    const uniqueEtages = Array.from(
        new Set(
            (Array.isArray(allRooms) ? allRooms : Object.values(allRooms))
                .map((room: any) => room.properties?.Ebene?.toString())
                .filter((etage) => etage != null)
        )
    ).sort(
        (a: string, b: string) =>
            FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b)
    )

    useEffect(() => {
        if (LoadingState.LOADED !== loadingState) return
        // bottomSheetRef.current?.snapToIndex(1)
        _removeAllGeoJson(mapRef)
        _addGeoJson()
    }, [currentFloor, allRooms, colors, availableRooms, allRooms, loadingState])

    const _addGeoJson = (): void => {
        if (availableRooms == null) {
            return
        }
        const filterEtage = (etage: string): RoomEntry[] => {
            const result = allRooms.filter(
                (feature) => feature.properties.Ebene === etage
            )
            return result
        }
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
        const properties = allRooms.find(
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
        const buildingDetails = allRooms.find(
            (x) =>
                x.properties.Gebaeude === building &&
                x.options.type === SEARCH_TYPES.BUILDING
        )
        const numberOfFreeRooms = availableRooms?.filter(
            (x) => x.room[0] === building || x.room.slice(0, 1) === building
        ).length
        const numberOfRooms = allRooms.filter(
            (x) =>
                x.properties.Gebaeude === building &&
                x.options.type === SEARCH_TYPES.ROOM
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

    return (
        <View style={styles.container}>
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
                                title={adjustErrorTitle(errorMsg, t)}
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
                                setLoadingState(LoadingState.LOADED)
                                _setView(mapCenter, mapRef)
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

                            if (data === 'noInternetConnection') {
                                setLoadingState(LoadingState.ERROR)
                                setErrorMsg(data as string)
                            } else if (data.type === 'roomClick') {
                                setClickedElement({
                                    data: data.payload.properties.room,
                                    type: SEARCH_TYPES.ROOM,
                                })
                                const center = data.payload.properties
                                    .center as number[]
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
                                mapRef={mapRef}
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
            <MapBottomSheet
                bottomSheetRef={bottomSheetRef}
                currentPosition={currentPosition}
                mapRef={mapRef}
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
        position: 'relative',
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
})
