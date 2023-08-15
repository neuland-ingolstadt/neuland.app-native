import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import {
    _addRoom,
    _removeAllGeoJson,
    _setView,
    htmlScript,
} from '@/components/Elements/Map/leaflet'
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
import * as Haptics from 'expo-haptics'
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
                    name="Map"
                    options={{
                        title: 'Campus Map',
                        headerShown: true,
                        headerLargeTitle: false,

                        headerSearchBarOptions: {
                            placeholder: 'Search for: G, W003, Toilette, ...',
                            hideWhenScrolling: false,
                            hideNavigationBar: true,
                            onChangeText: (event) => {
                                router.setParams({
                                    q: event.nativeEvent.text,
                                })
                            },
                            ...Platform.select({
                                android: {
                                    headerIconColor: colors.text,
                                    textColor: colors.text,
                                    hintTextColor: colors.text,
                                    tintColor: colors.text,
                                },
                            }),
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
        0: 'EG',
        0.5: '1.5',
        1: '1',
        2: '2',
        3: '3',
    }
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
    const [webViewKey, setWebViewKey] = useState(0)
    const [showDismissModal, setShowDismissModal] = useState(false)
    const [currentFloor, setCurrentFloor] = useState('EG')
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const mapRef = useRef<WebView>(null)
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
        const searchProps = ['Gebaeude', 'Raum', 'Funktion']
        const fullTextSearcher = (room: any): boolean =>
            searchProps.some(
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
    }, [q, allRooms, userKind])

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

    useEffect(() => {
        // Only execute if the map is already loaded
        if (loadingState === LoadingState.LOADED) {
            _removeAllGeoJson(mapRef)
            _addGeoJson()
        }
    }, [currentFloor, filteredRooms, colors, availableRooms])

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
            <View
                style={[
                    styles.ButtonArea,
                    { marginTop: Platform.OS === 'ios' ? 175 : 20 },
                ]}
            >
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
                                void Haptics.selectionAsync()
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

    const onContentProcessDidTerminate = (): void => {
        setWebViewKey((k) => k + 1)
        _addGeoJson()
    }
    return (
        <View style={styles.container}>
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
                            backgroundColor: colors.background,
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
                                color: colors.text,
                            }}
                        >
                            {errorMsg === 'noInternetConnection' &&
                                'Network request failed'}
                            {errorMsg === 'mapLoadError' && 'Map load error'}
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                marginBottom: 20,
                                textAlign: 'center',
                                color: colors.text,
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
                            <View
                                style={{
                                    backgroundColor: colors.background,
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    position: 'absolute',
                                    right: 0,
                                    zIndex: 2,
                                }}
                            >
                                <ActivityIndicator
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 3,
                                    }}
                                />
                            </View>
                        )}
                        onContentProcessDidTerminate={
                            onContentProcessDidTerminate
                        }
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
                        style={{
                            backgroundColor: colors.background,
                        }}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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
