/* eslint-disable react-native/no-color-literals */
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { MapContext } from '@/hooks/contexts/map'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { SEARCH_TYPES } from '@/types/map'
import { type RoomEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import {
    BUILDINGS,
    BUILDINGS_IN,
    BUILDINGS_ND,
    determineSearchType,
    getCenter,
    getCenterSingle,
} from '@/utils/map-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import BottomSheet, {
    BottomSheetTextInput,
    TouchableOpacity,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { type SharedValue } from 'react-native-reanimated'
import type WebView from 'react-native-webview'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'
import { _injectMarker, _setView } from './leaflet'

interface searchResult {
    type: SEARCH_TYPES
    highlight: RoomEntry[]
    title: string
    subtitle: string
    center: number[]
}

interface MapBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>
    currentPosition: SharedValue<number>
    handlePresentModalPress: () => void
    allRooms: RoomEntry[]
    mapRef: React.RefObject<WebView>
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
    bottomSheetRef,
    currentPosition,
    handlePresentModalPress,
    allRooms,
    mapRef,
}) => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const { userKind } = useContext(UserKindContext)
    const {
        localSearch,
        setLocalSearch,
        setClickedElement,
        availableRooms,
        setCurrentFloor,
    } = useContext(MapContext)

    const searchResults: searchResult[] = useMemo(() => {
        switch (determineSearchType(localSearch)) {
            case SEARCH_TYPES.BUILDING: {
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

                const combined = [...result, ...additionalResults]
                return combined
            }
            case SEARCH_TYPES.ROOM: {
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
                return result
            }
            default: {
                return []
            }
        }
    }, [localSearch, allRooms])

    return (
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
                        setLocalSearch(text.trim())
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
                                        result.type === SEARCH_TYPES.BUILDING
                                            ? 'building'
                                            : result.type === SEARCH_TYPES.ROOM
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
                                                    setLocalSearch('')
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
                                                <Divider iosPaddingLeft={50} />
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
                ) : userKind === USER_GUEST ? (
                    <Text
                        style={{
                            color: colors.text,
                            ...styles.noResults,
                        }}
                    >
                        {t('pages.map.details.room.signIn')}
                    </Text>
                ) : availableRooms.length > 0 ? (
                    <>
                        <View style={styles.suggestionSectionHeaderContainer}>
                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.suggestionSectionHeader,
                                }}
                            >
                                {t('pages.map.details.room.availableRooms')}
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
                            {availableRooms.slice(0, 3).map((room, key) => (
                                <>
                                    <Pressable
                                        key={key}
                                        style={styles.suggestionRow}
                                        onPress={() => {
                                            const details = allRooms.find(
                                                (x) =>
                                                    x.properties.Raum ===
                                                    room.room
                                            )

                                            if (
                                                details?.coordinates !==
                                                undefined
                                            ) {
                                                const center = getCenterSingle(
                                                    details?.coordinates
                                                )
                                                _setView(center, mapRef)
                                                _injectMarker(mapRef, center)
                                            }

                                            const etage =
                                                details?.properties.Ebene

                                            setCurrentFloor(etage ?? 'EG')
                                            setClickedElement({
                                                data: room.room,
                                                type: SEARCH_TYPES.ROOM,
                                            })

                                            handlePresentModalPress()
                                            bottomSheetRef.current?.forceClose()
                                        }}
                                    >
                                        <View style={styles.suggestionInnerRow}>
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        colors.primary,
                                                    ...styles.suggestionIconContainer,
                                                }}
                                            >
                                                <PlatformIcon
                                                    color={colors.background}
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
                                                    {room.type} ({room.capacity}{' '}
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
                                                {formatFriendlyTime(room.from)}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: colors.text,
                                                    fontVariant: [
                                                        'tabular-nums',
                                                    ],
                                                }}
                                            >
                                                {formatFriendlyTime(room.until)}
                                            </Text>
                                        </View>
                                    </Pressable>
                                    {key !== 2 && <Divider />}
                                </>
                            ))}
                        </View>
                    </>
                ) : (
                    <Text
                        style={{
                            color: colors.text,
                            ...styles.noResults,
                        }}
                    >
                        {t('pages.map.noAvailableRooms')}
                    </Text>
                )}
            </View>
        </BottomSheet>
    )
}

export default MapBottomSheet

const styles = StyleSheet.create({
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
        paddingRight: 10,
        fontSize: 16,
        fontWeight: '500',
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
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
})
