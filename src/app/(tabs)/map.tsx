import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import htmlScript from '@/components/Map/html_script'
import { type Colors } from '@/stores/colors'
import GeoJson from '@/stores/data/map.json'
import { UserKindContext } from '@/stores/provider'
import {
    formatFriendlyTime,
    formatISODate,
    formatISOTime,
} from '@/utils/date-utils'
import {
    type AvailableRoom,
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
    const FLOOR_SUBSTITUTES: Record<string, string> = {
        0: 'EG', // room G0099
        0.5: '1.5',
        1: '1',
        2: '2',
        3: '3',
    }
    const { userKind } = React.useContext(UserKindContext)
    const { q } = useLocalSearchParams<{ q: string }>()
    const { h } = useLocalSearchParams<{ h: string }>()

    const FLOOR_ORDER = ['4', '3', '2', '1.5', '1', 'EG', '-1']
    const [showDismissModal, setShowDismissModal] = useState(false)
    const router = useRouter()
    const handleDismissModal = (): void => {
        router.setParams({ h: '' })
        router.setParams({ q: '' })
        _setView(DEFAULT_CENTER)
        setShowDismissModal(false)
    }
    const selectedLocation = 'IN'

    useEffect(() => {
        if (h !== '') {
            setShowDismissModal(true)
        }
    }, [h])
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

    const SEARCHED_PROPERTIES = ['Gebaeude', 'Raum', 'Funktion']

    const [currentFloor, setCurrentFloor] = useState('EG')
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
    }

    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)

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
        _setView(center)
    }, [filteredRooms])

    const filterEtage = (etage: string): RoomEntry[] => {
        const result = filteredRooms.filter(
            (feature) => feature.properties.Ebene === etage
        )
        return result
    }
    const colors = useTheme().colors as Colors
    const FloorPicker = (floors: { floors: string[] }): JSX.Element => {
        const isEmpty = floors.floors.length === 0
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

    const DEFAULT_CENTER = [48.76709, 11.4328]

    const _addGeoJson = (): void => {
        const filteredFeatures = filterEtage(currentFloor)
        // create two layers for available and unavailable rooms
        // the available rooms are purple and in the front

        filteredFeatures.forEach((feature) => {
            console.log(feature)
            _addRoom(feature)
        })
    }

    interface RoomEntry {
        coordinates: number[][]
        options?: string[]
        properties: Properties
    }

    interface Properties {
        Ebene: string
        Etage: string
        Funktion: string
        Gebaeude: string
        Raum: string
        Standort: string
    }

    const _addRoom = (room: RoomEntry): void => {
        const coordinates = [[...room.coordinates]]
        const name = room?.properties?.Raum
        const functionType = room?.properties?.Funktion
        const avail = availableRooms?.find((x) => x.room === name)

        const color = avail != null ? colors.primary : 'grey'

        if (coordinates == null) return
        mapRef.current?.injectJavaScript(`
    var geojsonFeature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": ${JSON.stringify(coordinates)}
        },
    };

    L.geoJSON(geojsonFeature, {
        color: ${JSON.stringify(color)},
        fillOpacity: 0.2,
    }).addTo(mymap).bringToBack()
    .bindPopup("<b>${name.toString()} </b><br>${
        functionType != null ? functionType.toString() : ''
    }<br>${
        avail != null
            ? 'Free from ' +
              formatFriendlyTime(avail.from) +
              ' to ' +
              formatFriendlyTime(avail.until)
            : ''
    }");
    true
`)
    }

    const _removeAllGeoJson = (): void => {
        mapRef.current?.injectJavaScript(`
            mymap.eachLayer(function (layer) {
                if (layer instanceof L.GeoJSON) {
                    mymap.removeLayer(layer);
                }
            });
            true
        `)
    }

    const _setView = (center: number[] | undefined): void => {
        if (center == null) return
        mapRef.current?.injectJavaScript(`
    mymap.setView(${JSON.stringify(center)}, 18);
    true;
  `)
    }

    // add the geojson overlay to the map if floor is changed
    useEffect(() => {
        _removeAllGeoJson()
        _addGeoJson()
    }, [currentFloor, filteredRooms, colors])

    const mapRef = useRef<WebView>(null)
    const onContentProcessDidTerminate = (): void => mapRef.current?.reload()

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
                    alert(e.message)
                    setAvailableRooms([])
                } else {
                    console.error(e)
                    alert(e)
                }
            }
        }
        void load()
    }, [userKind])

    // ...

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={{ flex: 1, position: 'relative' }}>
                {loadingState === LoadingState.LOADED && (
                    <FloorPicker floors={uniqueEtages} />
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
                        ref={mapRef}
                        source={{ html: htmlScript }}
                        onLoadStart={() => {
                            setLoadingState(LoadingState.LOADING)
                        }}
                        onLoadEnd={() => {
                            setLoadingState(LoadingState.LOADED)
                            _addGeoJson()
                        }}
                        onContentProcessDidTerminate={
                            onContentProcessDidTerminate
                        }
                        cacheMode="LOAD_CACHE_ELSE_NETWORK"
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
