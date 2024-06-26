/* eslint-disable react-native/no-color-literals */
import { type Colors } from '@/components/colors'
import { AppIconContext, UserKindContext } from '@/components/contexts'
import { MapContext } from '@/hooks/contexts/map'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import { SEARCH_TYPES } from '@/types/map'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor } from '@/utils/ui-utils'
import BottomSheet, { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import { type FeatureCollection } from 'geojson'
import React, { useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { type SharedValue } from 'react-native-reanimated'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'
import ResultRow from './SearchResultRow'

interface MapBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>
    currentPosition: SharedValue<number>
    handlePresentModalPress: () => void
    allRooms: FeatureCollection
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
    bottomSheetRef,
    currentPosition,
    handlePresentModalPress,
    allRooms,
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
        nextLecture,
        setCurrentFloor,
    } = useContext(MapContext)

    const { unlockedAppIcons, addUnlockedAppIcon } = useContext(AppIconContext)

    const fuse = new Fuse(allRooms.features, {
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
            title: result.item.properties?.Raum,
            subtitle: result.item.properties?.Funktion_en,
            isExactMatch: Boolean(
                result.item.properties?.Raum.toUpperCase().includes(
                    localSearch.toUpperCase()
                )
            ),
            item: result.item,
        }))

        const exactMatches = roomResults.filter((result) => result.isExactMatch)
        const fuzzyMatches = roomResults.filter(
            (result) => !result.isExactMatch
        )

        return [exactMatches, fuzzyMatches]
    }, [localSearch, allRooms])

    useEffect(() => {
        if (
            localSearch.toLocaleLowerCase() === 'neuland' &&
            Platform.OS === 'ios'
        ) {
            if (unlockedAppIcons.includes('retro')) {
                return
            }
            Alert.alert(
                t('pages.map.easterEgg.title'),

                t('pages.map.easterEgg.message'),
                [
                    {
                        text: t('pages.map.easterEgg.confirm'),
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            )

            addUnlockedAppIcon('retro')
        }
    }, [localSearch])

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={['10%', '30%', '92%']}
            backgroundComponent={BottomSheetBackground}
            animatedPosition={currentPosition}
            keyboardBehavior="extend"
        >
            <View>
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
                                keyExtractor={(item, index) =>
                                    item.title + index
                                }
                                renderItem={({ item, index }) => (
                                    <ResultRow
                                        result={item}
                                        index={index}
                                        colors={colors}
                                        handlePresentModalPress={
                                            handlePresentModalPress
                                        }
                                        bottomSheetRef={bottomSheetRef}
                                    />
                                )}
                                stickySectionHeadersEnabled={false}
                                renderSectionHeader={({
                                    section: { title },
                                }) => (
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
                            {nextLecture !== null && nextLecture.length > 0 && (
                                <View style={styles.suggestionContainer}>
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
                                                'pages.map.details.room.nextLecture'
                                            )}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.labelColor,
                                                ...styles.suggestionMoreDateText,
                                            }}
                                        >
                                            {formatFriendlyDate(
                                                nextLecture[0].date
                                            )}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: colors.card,
                                            ...styles.radius,
                                        }}
                                    >
                                        {nextLecture.map((lecture, key) => (
                                            <React.Fragment key={key}>
                                                <Pressable
                                                    style={styles.suggestionRow}
                                                    onPress={() => {
                                                        const details =
                                                            allRooms.features.find(
                                                                (x) =>
                                                                    x.properties
                                                                        ?.Raum ===
                                                                    lecture
                                                                        .rooms[0]
                                                            )

                                                        const etage =
                                                            details?.properties
                                                                ?.Ebene
                                                        bottomSheetRef.current?.close()
                                                        setCurrentFloor({
                                                            floor:
                                                                (etage as string) ??
                                                                'EG',
                                                            manual: false,
                                                        })
                                                        setClickedElement({
                                                            data: lecture
                                                                .rooms[0],
                                                            type: SEARCH_TYPES.ROOM,
                                                            center: details
                                                                ?.properties
                                                                ?.center,
                                                            manual: false,
                                                        })
                                                        handlePresentModalPress()
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
                                                                    name: 'clock.fill',
                                                                    size: 18,
                                                                }}
                                                                android={{
                                                                    name: 'school',
                                                                    size: 20,
                                                                }}
                                                            />
                                                        </View>

                                                        <View
                                                            style={
                                                                styles.suggestionContent
                                                            }
                                                        >
                                                            <Text
                                                                style={{
                                                                    color: colors.text,
                                                                    ...styles.suggestionTitle,
                                                                }}
                                                                numberOfLines={
                                                                    2
                                                                }
                                                            >
                                                                {lecture.name}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    color: colors.text,
                                                                    ...styles.suggestionSubtitle,
                                                                }}
                                                            >
                                                                {lecture.rooms.join(
                                                                    ', '
                                                                )}
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
                                                                lecture.startDate
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
                                                                lecture.endDate
                                                            )}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                                {key !==
                                                    nextLecture.length - 1 && (
                                                    <Divider />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View>
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
                                        availableRooms
                                            .slice(0, 3)
                                            .map((room, key) => (
                                                <React.Fragment key={key}>
                                                    <Pressable
                                                        key={key}
                                                        style={
                                                            styles.suggestionRow
                                                        }
                                                        onPress={() => {
                                                            const details =
                                                                allRooms.features.find(
                                                                    (x) =>
                                                                        x
                                                                            .properties
                                                                            ?.Raum ===
                                                                        room.room
                                                                )

                                                            const etage =
                                                                details
                                                                    ?.properties
                                                                    ?.Ebene

                                                            setCurrentFloor({
                                                                floor:
                                                                    (etage as string) ??
                                                                    'EG',
                                                                manual: false,
                                                            })
                                                            setClickedElement({
                                                                data: room.room,
                                                                type: SEARCH_TYPES.ROOM,
                                                                center:
                                                                    details
                                                                        ?.properties
                                                                        ?.center ??
                                                                    undefined,
                                                                manual: false,
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

                                                            <View
                                                                style={
                                                                    styles.suggestionContent
                                                                }
                                                            >
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
                                                                    {room.type}{' '}
                                                                    (
                                                                    {
                                                                        room.capacity
                                                                    }{' '}
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
                                                                    fontVariant:
                                                                        [
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
                                                                    fontVariant:
                                                                        [
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
                                                </React.Fragment>
                                            ))
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                </View>
                <View style={styles.attributionContainer}>
                    <Pressable
                        onPress={() => {
                            void Linking.openURL(
                                'https://www.openstreetmap.org/copyright'
                            )
                        }}
                        style={styles.attributionLink}
                    >
                        <Text
                            style={{
                                color: colors.labelColor,
                                ...styles.attributionText,
                            }}
                        >
                            {t('pages.map.details.osm')}
                        </Text>
                        <PlatformIcon
                            color={colors.labelColor}
                            ios={{
                                name: 'chevron.forward',
                                size: 11,
                            }}
                            android={{
                                name: 'chevron_right',
                                size: 16,
                            }}
                        />
                    </Pressable>
                </View>
            </View>
        </BottomSheet>
    )
}

export default MapBottomSheet

const styles = StyleSheet.create({
    suggestionContainer: {
        marginBottom: 10,
    },
    suggestionSectionHeader: {
        fontWeight: '600',
        fontSize: 20,
        paddingTop: 8,
        marginBottom: 2,
        textAlign: 'left',
    },
    suggestionContent: {
        flex: 1,
        paddingRight: 14,
    },
    suggestionSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    suggestionMoreButtonText: {
        textAlign: 'right',
        paddingRight: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    suggestionMoreDateText: {
        textAlign: 'right',
        paddingRight: 10,
        fontSize: 15,
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
    },
    suggestionInnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
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
        marginBottom: 1,
    },
    suggestionSubtitle: {
        fontWeight: '400',
        fontSize: 14,
    },
    suggestionRightContainer: {
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
    attributionContainer: { paddingVertical: 40 },
    attributionLink: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    attributionText: {
        fontSize: 15,
        paddingStart: 12,
    },
})
