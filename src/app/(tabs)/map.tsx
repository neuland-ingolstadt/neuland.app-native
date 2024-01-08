import AssetAPI from '@/api/asset-api'
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
import ErrorView from '@/components/Elements/Universal/ErrorView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { RouteParamsContext, UserKindContext } from '@/components/provider'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { type RoomsOverlay } from '@/types/asset-api'
import { type AvailableRoom, type RoomEntry } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { filterRooms, getNextValidDate } from '@/utils/room-utils'
import { LoadingState } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useNavigation, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Linking,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { WebView } from 'react-native-webview'

export default function Screen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    const { t } = useTranslation('common')

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
            <WorkaroundStack
                name={'Map'}
                titleKey={'navigation.campusMap'}
                component={isPageOpen ? MapScreen : () => <></>}
                transparent={true}
                headerSearchBarOptions={{ placeholder: t('pages.map.search') }}
            />
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
    const { userKind, userFaculty } = React.useContext(UserKindContext)
    const { routeParams, updateRouteParams } =
        React.useContext(RouteParamsContext)
    const [webViewKey, setWebViewKey] = useState(0)
    const [showDismissModal, setShowDismissModal] = useState(false)
    const [currentFloor, setCurrentFloor] = useState('EG')
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [mapOverlay, setMapOverlay] = useState<RoomsOverlay | null>(null)

    const INGOLSTADT_CENTER = [48.76709, 11.4328]
    const NEUBURG_CENTER = [48.73227, 11.17261]
    const [mapCenter, setMapCenter] = useState(INGOLSTADT_CENTER)

    const mapRef = useRef<WebView>(null)
    const router = useRouter()
    const navigation = useNavigation()
    const { t } = useTranslation('common')

    const [localSearch, setLocalSearch] = useState('')

    // update the local search state if the routeParams change
    useEffect(() => {
        setLocalSearch(routeParams)
    }, [routeParams])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => {
                        router.push('(map)/advanced')
                    }}
                    hitSlop={10}
                >
                    <PlatformIcon
                        color={colors.text}
                        ios={{
                            name: 'text.magnifyingglass',
                            size: 22,
                        }}
                        android={{
                            name: 'manage-search',
                            size: 24,
                        }}
                    />
                </Pressable>
            ),
            headerSearchBarOptions: {
                placeholder: t('pages.map.search'),
                shouldShowHintSearchIcon: false,
                hideWhenScrolling: false,
                onChangeText: (event: { nativeEvent: { text: string } }) => {
                    setLocalSearch(event.nativeEvent.text)
                },
                // if open hide the headerRight button
                onFocus: () => {
                    if (Platform.OS === 'android') {
                        navigation.setOptions({
                            headerRight: () => null,
                        })
                    }
                },
                // if closed show the headerRight button
                onClose: () => {
                    // android only anyway so no need to check
                    const advancedButton = (
                        <Pressable
                            onPress={() => {
                                router.push('(map)/advanced')
                            }}
                        >
                            <PlatformIcon
                                color={colors.text}
                                ios={{
                                    name: 'text.magnifyingglass',
                                    size: 22,
                                }}
                                android={{
                                    name: 'manage-search',
                                    size: 24,
                                }}
                            />
                        </Pressable>
                    )
                    navigation.setOptions({
                        headerRight: () => advancedButton,
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
        })
    }, [navigation])

    const handleDismissModal = (): void => {
        router.setParams({ q: '' })
        updateRouteParams('')
        _setView(mapCenter, mapRef)
        setShowDismissModal(false)
    }

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
        // if the user was redirected to the map screen, show the dismiss modal
        if (routeParams !== '') {
            setShowDismissModal(true)
        }
    }, [routeParams])

    useEffect(() => {
        // if the user starts a new search, reset the dismiss modal button
        if (localSearch?.length === 1) {
            setShowDismissModal(false)
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

    useEffect(() => {
        // load the map overlay from asset api
        AssetAPI.getMapOverlay()
            .then((data) => {
                setMapOverlay(data)
            })
            .catch((e) => {
                console.error(e)
                setLoadingState(LoadingState.ERROR)
                setErrorMsg('mapOverlay')
            })
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

    const [filteredRooms, center] = useMemo(() => {
        // logic for filtering the map overlay data
        if (localSearch == null) {
            return [allRooms, mapCenter]
        }

        const cleanedText = localSearch.toUpperCase().trim()

        const getProp = (
            room: {
                properties: {
                    [x: string]: string
                    Funktion_de: string
                    Funktion_en: string
                }
            },
            prop: string
        ): string => {
            if (prop.includes('Funktion')) {
                return room?.properties[prop]
            }

            return room.properties[prop]?.toUpperCase()
        }
        const searchProps = [
            'Gebaeude',
            'Raum',
            i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en',
        ]
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

        // this doesn't affect the search results itself, but ensures that the map is centered on the correct campus
        const showNeuburg =
            userFaculty === 'Nachhaltige Infrastruktur' ||
            cleanedText.substring(0, 2).includes('N')
        const campusRooms = filtered.filter(
            (x) => x.properties.Raum.includes('N') === showNeuburg
        )
        const centerRooms = campusRooms.length > 0 ? campusRooms : filtered

        let lon = 0
        let lat = 0
        let count = 0
        centerRooms.forEach((x: any) => {
            lon += Number(x.coordinates[0][0])
            lat += Number(x.coordinates[0][1])
            count += 1
        })
        const filteredCenter =
            count > 0 ? [lat / count, lon / count] : mapCenter
        return [filtered, filteredCenter]
    }, [localSearch, allRooms, userKind])

    const uniqueEtages = Array.from(
        new Set(
            filteredRooms
                .map((room) => room.properties?.Ebene?.toString())
                .filter((etage) => etage != null)
        )
    ).sort((a, b) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b))

    useEffect(() => {
        const currentFloor = uniqueEtages.includes('EG')
            ? 'EG'
            : uniqueEtages[uniqueEtages.length - 1]
        setCurrentFloor(currentFloor)
        _setView(localSearch !== '' ? center : mapCenter, mapRef)
    }, [filteredRooms, localSearch])

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
        const { t } = useTranslation('common')
        return (
            <View
                style={{
                    ...styles.ButtonArea,
                    ...(Platform.OS === 'ios'
                        ? styles.buttonAreaIOS
                        : styles.buttonAreaAndroid),
                }}
            >
                <View
                    style={{
                        ...styles.ButtonAreaSection,
                        ...(!isEmpty
                            ? styles.borderWithNormal
                            : styles.borderWidthEmpty),
                        borderColor: colors.border,
                    }}
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
                                        // eslint-disable-next-line react-native/no-inline-styles
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
                                        {floor === 'EG'
                                            ? t('pages.map.gf')
                                            : floor}
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
                            },
                        ]}
                    >
                        <Pressable
                            onPress={() => {
                                if (Platform.OS === 'ios') {
                                    void Haptics.selectionAsync()
                                }
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
                                <PlatformIcon
                                    color={colors.text}
                                    ios={{
                                        name: 'xmark',
                                        size: 18,
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
        )
    }

    const _addGeoJson = (): void => {
        const filteredFeatures = filterEtage(currentFloor)
        filteredFeatures.forEach((feature) => {
            _addRoom(
                feature,
                availableRooms,
                mapRef,
                colors,
                i18n.language as LanguageKey
            )
        })
    }

    const onContentProcessDidTerminate = (): void => {
        setWebViewKey((k) => k + 1)
        _addGeoJson()
    }

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
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                {loadingState === LoadingState.LOADED && (
                    <FloorPicker floors={uniqueEtages} />
                )}
                {loadingState === LoadingState.ERROR && (
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
                )}

                <View style={styles.map}>
                    <WebView
                        key={webViewKey}
                        ref={mapRef}
                        source={{
                            html: htmlScript,
                        }}
                        onLoadEnd={() => {
                            if (loadingState === LoadingState.LOADING) {
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
                        onShouldStartLoadWithRequest={(event) => {
                            if (event.url !== 'about:blank') {
                                void Linking.openURL(event.url)
                                return false
                            }
                            return true
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
    innerContainer: { flex: 1, position: 'relative' },
    map: {
        flex: 1,
        position: 'relative',
    },
    ButtonArea: {
        marginHorizontal: 10,

        position: 'absolute',
        zIndex: 1,
    },
    buttonAreaAndroid: {
        marginTop: 20,
    },
    buttonAreaIOS: {
        marginTop: 175,
    },
    ButtonAreaSection: {
        borderRadius: 7,
        overflow: 'hidden',
        borderWidth: 1,
        marginTop: 10,
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
})
