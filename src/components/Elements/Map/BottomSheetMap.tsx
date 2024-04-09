/* eslint-disable react-native/no-color-literals */
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { MapContext } from '@/hooks/contexts/map'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { SEARCH_TYPES } from '@/types/map'
import { type RoomEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getCenterSingle } from '@/utils/map-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor } from '@/utils/ui-utils'
import BottomSheet, { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { type SharedValue } from 'react-native-reanimated'
import type WebView from 'react-native-webview'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'
import ResultRow from './SearchResultRow'
import { _injectMarker, _setView } from './leaflet'

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
    const { t, i18n } = useTranslation('common')
    const { userKind } = useContext(UserKindContext)
    const {
        localSearch,
        setLocalSearch,
        setClickedElement,
        availableRooms,
        setCurrentFloor,
    } = useContext(MapContext)

    const fuse = new Fuse(allRooms, {
        keys: [
            'properties.Raum',
            i18n.language === 'de'
                ? 'properties.Funktion_de'
                : 'properties.Funktion_en',
            'properties.Gebaeude',
        ],
        threshold: 0.4,
        useExtendedSearch: true,
    })

    const [searchResultsExact, searchResultsFuzzy] = useMemo(() => {
        const results = fuse.search(localSearch.trim().toUpperCase())
        const roomResults = results.map((result) => ({
            title: result.item.properties.Raum,
            subtitle: result.item.properties.Funktion_en,
            isExactMatch: result.item.properties.Raum.toUpperCase().includes(
                localSearch.toUpperCase()
            ),
            item: result.item,
        }))

        const exactMatches = roomResults.filter((result) => result.isExactMatch)
        const fuzzyMatches = roomResults.filter(
            (result) => !result.isExactMatch
        )

        return [exactMatches, fuzzyMatches]
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
                {Platform.OS === 'ios' ? (
                    <BottomSheetTextInput
                        style={{
                            backgroundColor: colors.inputBackground,
                            ...styles.textInput,
                            color: colors.text,
                        }}
                        placeholder={t('pages.map.search.placeholder')}
                        placeholderTextColor={colors.labelColor}
                        value={localSearch}
                        enablesReturnKeyAutomatically
                        clearButtonMode="always"
                        enterKeyHint="search"
                        onChangeText={(text) => {
                            setLocalSearch(text)
                        }}
                        onFocus={() => {
                            bottomSheetRef.current?.snapToIndex(2)
                        }}
                        onEndEditing={() => {
                            bottomSheetRef.current?.collapse()
                        }}
                    />
                ) : (
                    <TextInput
                        style={{
                            backgroundColor: colors.inputBackground,
                            ...styles.textInput,
                            color: colors.text,
                        }}
                        placeholder={t('pages.map.search.placeholder')}
                        placeholderTextColor={colors.labelColor}
                        value={localSearch}
                        enablesReturnKeyAutomatically
                        clearButtonMode="always"
                        onChangeText={(text) => {
                            setLocalSearch(text)
                        }}
                        onFocus={() => {
                            bottomSheetRef.current?.snapToIndex(2)
                        }}
                        onEndEditing={() => {
                            bottomSheetRef.current?.collapse()
                        }}
                    />
                )}
                {localSearch !== '' ? (
                    searchResultsExact.length > 0 ||
                    searchResultsFuzzy.length > 0 ? (
                        <SectionList
                            contentContainerStyle={{
                                paddingBottom: PAGE_BOTTOM_SAFE_AREA,
                            }}
                            keyboardShouldPersistTaps="always"
                            sections={[
                                ...(searchResultsExact.length > 0
                                    ? [
                                          {
                                              title: t(
                                                  'pages.map.search.results'
                                              ),
                                              data: searchResultsExact,
                                          },
                                      ]
                                    : []),
                                ...(searchResultsFuzzy.length > 0
                                    ? [
                                          {
                                              title: t(
                                                  'pages.map.search.fuzzy'
                                              ),
                                              data: searchResultsFuzzy,
                                          },
                                      ]
                                    : []),
                            ]}
                            keyExtractor={(item, index) => item.title + index}
                            renderItem={({ item, index }) => (
                                <ResultRow
                                    result={item}
                                    index={index}
                                    colors={colors}
                                    mapRef={mapRef}
                                    handlePresentModalPress={
                                        handlePresentModalPress
                                    }
                                    bottomSheetRef={bottomSheetRef}
                                />
                            )}
                            stickySectionHeadersEnabled={false}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text
                                    style={{
                                        color: colors.text,
                                        ...styles.header,
                                    }}
                                >
                                    {title}
                                </Text>
                            )}
                        />
                    ) : (
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.noResults,
                            }}
                        >
                            {t('pages.map.search.noResults')}
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
                ) : (
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
                                    router.push('(map)/advanced')
                                }}
                                hitSlop={{
                                    top: 10,
                                    right: 10,
                                    bottom: 10,
                                    left: 10,
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
                            {availableRooms === null ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                    style={styles.loadingMargin}
                                />
                            ) : availableRooms.length === 0 ? (
                                <Text
                                    style={{
                                        color: colors.text,
                                        ...styles.noResults,
                                    }}
                                >
                                    {t('pages.map.noAvailableRooms')}
                                </Text>
                            ) : (
                                availableRooms.slice(0, 3).map((room, key) => (
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
                                                    const center =
                                                        getCenterSingle(
                                                            details?.coordinates
                                                        )
                                                    _setView(center, mapRef)
                                                    _injectMarker(
                                                        mapRef,
                                                        center,
                                                        colors
                                                    )
                                                }

                                                const etage =
                                                    details?.properties.Ebene

                                                setCurrentFloor(etage ?? 'EG')
                                                setClickedElement({
                                                    data: room.room,
                                                    type: SEARCH_TYPES.ROOM,
                                                })

                                                handlePresentModalPress()
                                                bottomSheetRef.current?.close()
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
                                                        color={getContrastColor(
                                                            colors.primary
                                                        )}
                                                        ios={{
                                                            name: 'studentdesk',
                                                            size: 18,
                                                        }}
                                                        android={{
                                                            name: 'school',
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
                                                        {room.capacity} seats)
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
                                ))
                            )}
                        </View>
                    </>
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
        marginBottom: 4,
        textAlign: 'left',
    },
    suggestionSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 3,
    },
    suggestionMoreButtonText: {
        textAlign: 'right',
        paddingRight: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    textInput: {
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontSize: 17,
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
        paddingVertical: 30,
        fontSize: 16,
    },
    header: {
        fontSize: 15,
        marginTop: 12,
        marginBottom: 6,
        textAlign: 'left',
    },
    loadingMargin: {
        marginVertical: 30,
    },
})
