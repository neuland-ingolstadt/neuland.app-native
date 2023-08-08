import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import htmlScript from '@/components/Map/html_script'
import { _addRoom, _removeAllGeoJson, _setView } from '@/components/Map/inject'
import { type Colors } from '@/stores/colors'
import GeoJson from '@/stores/data/map.json'
import { UserKindContext } from '@/stores/provider'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    type AvailableRoom,
    type RoomEntry,
    filterRooms,
    getNextValidDate,
} from '@/utils/room-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

const Stack2 = createNativeStackNavigator()
export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    return (
        <>
            <Head>
                <title>Map</title>
                <meta name="Campus Map" content="Interactive Campus Map" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <Stack.Screen
                options={{
                    headerShown: false,
                    headerBackButtonMenuEnabled: false,
                }}
            />

            <Stack2.Navigator>
                <Stack2.Screen
                    name="Home"
                    options={{
                        title: 'Campus Map',
                        headerShown: true,
                        headerLargeTitle: false,

                        headerSearchBarOptions: {
                            placeholder: 'Search for: G, W003, Toilette, ...',
                            onChangeText: (event) => {
                                router.setParams({
                                    q: event.nativeEvent.text,
                                })
                            },
                        },
                        ...Platform.select({
                            ios: {
                                headerTransparent: true,
                                headerBlurEffect: 'regular',
                            },
                        }),
                        headerRight: () => (
                            <Pressable
                                onPress={() => {
                                    router.push('(map)/advanced')
                                }}
                            >
                                <Ionicons
                                    name="options-outline"
                                    size={24}
                                    color={colors.primary}
                                />
                            </Pressable>
                        ),
                    }}
                    component={MapScreen}
                />
            </Stack2.Navigator>
        </>
    )
}

export const MapScreen = (): JSX.Element => {
    const FLOOR_ORDER = ['4', '3', '2', '1.5', '1', 'EG', '-1']
    const FLOOR_SUBSTITUTES: Record<string, string> = {
        0: 'EG', // room G0099
        0.5: '1.5',
        1: '1',
        2: '2',
        3: '3',
    }
    const SEARCHED_PROPERTIES = ['Gebaeude', 'Raum', 'Funktion']
    const DEFAULT_CENTER = [48.76709, 11.4328]
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
    }
    const [errorMsg, setErrorMsg] = useState('')
    const selectedLocation = 'IN'
    const colors = useTheme().colors as Colors
    const { userKind } = React.useContext(UserKindContext)
    const { q } = useLocalSearchParams<{ q: string }>()
    const { h } = useLocalSearchParams<{ h: string }>()

    const [showDismissModal, setShowDismissModal] = useState(false)
    const [currentFloor, setCurrentFloor] = useState('EG')
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const mapRef = useRef<WebView>(null)
    const onContentProcessDidTerminate = (): void => mapRef.current?.reload()
    const router = useRouter()
    const handleDismissModal = (): void => {
        router.setParams({ h: '' })
        router.setParams({ q: '' })
        _setView(DEFAULT_CENTER, mapRef)
        setShowDismissModal(false)
    }

    useEffect(() => {
        // if the user was redirected to the map screen, show the dismiss modal
        if (h !== '' && h !== undefined) {
            setShowDismissModal(true)
        }
    }, [h])

    useEffect(() => {
        // if the user starts a new search, reset the dismiss modal button
        if (q?.length === 1) {
            setShowDismissModal(false)
            router.setParams({ h: '' })
        }
    }, [q])

    const allRooms = useMemo(() => {
        return GeoJson.features
            .map((feature) => {
                const { geometry, properties } = feature

                if (
                    geometry == null ||
                    geometry.coordinates == null ||
                    geometry.type !== 'Polygon'
                ) {
                    return []
                }
                if (properties.Standort !== selectedLocation) {
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
    }, [GeoJson])
    const [webViewKey, setWebViewKey] = useState(0)
    const [filteredRooms, center] = useMemo(() => {
        if (q == null) {
            return [allRooms, DEFAULT_CENTER]
        }

        const cleanedText = q.toUpperCase().trim()

        const getProp = (
            room: { properties: { [x: string]: string; Funktion: string } },
            prop: string
        ): string => {
            if (prop === 'Funktion') {
                return room?.properties?.Funktion
            }

            return room.properties[prop]?.toUpperCase()
        }

        const fullTextSearcher = (room: any): boolean =>
            SEARCHED_PROPERTIES.some(
                (x) => getProp(room, x)?.toUpperCase().includes(cleanedText)
            )
        const roomOnlySearcher = (room: any): boolean =>
            getProp(room, 'Raum').startsWith(cleanedText)
        const filtered = allRooms.filter(
            /^[A-Z](G|[0-9E]\.)?\d*$/.test(cleanedText)
                ? roomOnlySearcher
                : fullTextSearcher
        )

        let lon = 0
        let lat = 0
        let count = 0
        filtered.forEach((x: any) => {
            lon += Number(x.coordinates[0][0])
            lat += Number(x.coordinates[0][1])
            count += 1
        })
        const filteredCenter =
            count > 0 ? [lat / count, lon / count] : DEFAULT_CENTER

        return [filtered, filteredCenter]
    }, [q, allRooms])

    const uniqueEtages = Array.from(
        new Set(
            filteredRooms
                .map((room) => room.properties?.Ebene?.toString())
                .filter((etage) => etage != null)
        )
    ).sort((a, b) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b))

    // set the current floor to the first floor in the uniqueEtages array
    useEffect(() => {
        const currentFloor = uniqueEtages.includes('EG')
            ? 'EG'
            : uniqueEtages[uniqueEtages.length - 1]
        setCurrentFloor(currentFloor)
        _setView(q !== '' ? center : DEFAULT_CENTER, mapRef)
    }, [filteredRooms])

    const filterEtage = (etage: string): RoomEntry[] => {
        const result = filteredRooms.filter(
            (feature) => feature.properties.Ebene === etage
        )
        return result
    }

    const FloorPicker = (floors: { floors: string[] }): JSX.Element => {
        const isEmpty = floors.floors.length === 0
        const colors = useTheme().colors as Colors
        return (
            <View style={[styles.ButtonArea, { marginTop: 100 }]}>
                <View
                    style={[
                        styles.ButtonAreaSection,
                        {
                            borderColor: colors.border,
                            borderWidth: isEmpty ? 0 : 1,
                        },
                    ]}
                >
                    {floors.floors.map((floor, index) => {
                        const isLastButton =
                            floors.floors.length === 0 ||
                            index === floors.floors.length - 1

                        return (
                            <Pressable
                                onPress={() => {
                                    setCurrentFloor(floor)
                                }}
                                key={floor}
                            >
                                <View
                                    style={[
                                        styles.Button,
                                        {
                                            borderBottomColor: colors.border,
                                            backgroundColor:
                                                currentFloor === floor
                                                    ? colors.primary
                                                    : colors.card,
                                            borderBottomWidth: isLastButton
                                                ? 0
                                                : 1,
                                        },
                                    ]}
                                    key={floor}
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
                                        {floor}
                                    </Text>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>
                {showDismissModal && (
                    <View
                        style={[
                            styles.ButtonAreaSection,
                            {
                                borderColor: colors.border,
                                borderWidth: 1,
                                marginTop: 10,
                            },
                        ]}
                    >
                        <Pressable
                            onPress={() => {
                                handleDismissModal()
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
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </View>
                        </Pressable>
                    </View>
                )}
            </View>
        )
    }

    const _addGeoJson = (): void => {
        const filteredFeatures = filterEtage(currentFloor)
        filteredFeatures.forEach((feature) => {
            _addRoom(feature, availableRooms, mapRef, colors)
        })
    }

    // add the geojson overlay to the map if floor is changed
    useEffect(() => {
        _removeAllGeoJson(mapRef)
        _addGeoJson()
    }, [currentFloor, filteredRooms, colors])

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={{ flex: 1, position: 'relative' }}>
                {loadingState === LoadingState.LOADED && (
                    <FloorPicker floors={uniqueEtages} />
                )}
                {loadingState === LoadingState.ERROR && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 3,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                marginBottom: 10,
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            {errorMsg === 'noInternetConnection' &&
                                'No internet connection'}
                            {errorMsg === 'mapLoadError' && 'Unknown error'}
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                marginBottom: 20,
                                textAlign: 'center',
                            }}
                        >
                            There was a problem loading the map.
                            {'\n'}
                            Please try again.
                        </Text>
                        <Pressable
                            onPress={() => {
                                // Increment the key to trigger a WebView reload
                                setWebViewKey(webViewKey + 1)
                                setLoadingState(LoadingState.LOADING)
                            }}
                            style={{
                                backgroundColor: colors.datePickerBackground,
                                padding: 10,
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{ color: colors.text }}> Reload </Text>
                        </Pressable>
                    </View>
                )}

                <View style={styles.map}>
                    {loadingState === LoadingState.LOADING && (
                        <ActivityIndicator
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 2,
                            }}
                        />
                    )}

                    <WebView
                        key={webViewKey}
                        ref={mapRef}
                        source={{ html: htmlScript }}
                        onLoadEnd={() => {
                            if (loadingState === LoadingState.LOADING) {
                                setLoadingState(LoadingState.LOADED)
                                _addGeoJson()
                            }
                        }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <ActivityIndicator
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 2,
                                }}
                            />
                        )}
                        onContentProcessDidTerminate={
                            onContentProcessDidTerminate
                        }
                        renderError={() => (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 2,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text>
                                    Beim Laden der Karte ist ein Fehler
                                    aufgetreten.
                                </Text>
                            </View>
                        )}
                        cacheMode="LOAD_NO_CACHE"
                        onMessage={(event) => {
                            const data = event.nativeEvent.data
                            if (
                                data === 'mapLoadError' ||
                                data === 'noInternetConnection'
                            ) {
                                setLoadingState(LoadingState.ERROR)
                                setErrorMsg(data)
                            }
                        }}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    filteredRoomsList: {
        maxHeight: 200,
        overflow: 'scroll',
        marginBottom: 16,
    },
    dismissButton: {
        color: 'blue',
        fontSize: 16,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        position: 'relative',

        justifyContent: 'flex-end',
    },
    map: {
        flex: 1,
        position: 'relative',
    },
    ButtonArea: {
        marginHorizontal: 10,

        position: 'absolute',
        zIndex: 1,
    },
    ButtonAreaSection: {
        borderRadius: 7,

        overflow: 'hidden',
    },

    Button: {
        width: 38,
        height: 38,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ButtonText: {
        fontWeight: '500',
        fontSize: 14,
    },
})
