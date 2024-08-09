import { type Colors } from '@/components/colors'
import { PreferencesContext, UserKindContext } from '@/components/contexts'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { SEARCH_TYPES, type SearchResult } from '@/types/map'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, showToast } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import { selectionAsync } from 'expo-haptics'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import { type FeatureCollection } from 'geojson'
import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Swipeable, TextInput } from 'react-native-gesture-handler'
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

const AttributionLink: React.FC = () => {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')

    return (
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
    )
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
    bottomSheetRef,
    currentPosition,
    handlePresentModalPress,
    allRooms,
}) => {
    const router = useRouter()
    const theme = useTheme()
    const colors = theme.colors as Colors
    const isDark = theme.dark
    const { t, i18n } = useTranslation('common')
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const {
        localSearch,
        setLocalSearch,
        setClickedElement,
        availableRooms,
        nextLecture,
        setCurrentFloor,
        searchHistory,
        updateSearchHistory,
    } = useContext(MapContext)

    const { unlockedAppIcons, addUnlockedAppIcon } =
        useContext(PreferencesContext)

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

    function addToSearchHistory(newHistory: SearchResult): void {
        const newSearchHistory = searchHistory.filter(
            (history) => history.title !== newHistory.title
        )

        newSearchHistory.unshift(newHistory)

        if (newSearchHistory.length > 5) {
            newSearchHistory.length = 5
        }

        updateSearchHistory(newSearchHistory)
    }

    function deleteSearchHistoryItem(element: SearchResult): void {
        const newSearchHistory = searchHistory.filter(
            (history) => history.title !== element.title
        )
        updateSearchHistory(newSearchHistory)
    }

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
            trackEvent('EasterEgg', { easterEgg: 'mapSearchNeuland' })

            addUnlockedAppIcon('retro')
        }
    }, [localSearch])
    const textInputRef = useRef<any>(null)
    const [searchFocused, setSearchFocused] = React.useState(false)
    const searchbarBackground = isDark
        ? Color(colors.card).lighten(0.6).hex()
        : Color(colors.card).darken(0.03).hex()
    const cancelWidth = useRef(new Animated.Value(0)).current
    const cancelOpacity = useRef(new Animated.Value(0)).current

    const animate = (toValue: number): void => {
        Animated.timing(cancelWidth, {
            toValue,
            duration: 250,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        }).start()
        Animated.timing(cancelOpacity, {
            toValue: toValue === 0 ? 0 : 1,
            duration: 250,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        }).start()
    }
    const width = t('misc.cancel').length * 11
    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={['10%', '30%', '92%']}
            backgroundComponent={BottomSheetBackground}
            animatedPosition={currentPosition}
            keyboardBehavior="extend"
            onChange={(index) => {
                if (index <= 1) {
                    localSearch !== '' && setLocalSearch('')
                    textInputRef.current?.blur()
                }
            }}
            enableDynamicSizing={false}
        >
            <BottomSheetView>
                <View
                    style={{
                        paddingHorizontal: PAGE_PADDING,
                    }}
                >
                    <View style={styles.inputContainer}>
                        {Platform.OS !== 'ios' ? (
                            <TextInput
                                ref={textInputRef}
                                style={{
                                    backgroundColor: searchbarBackground,
                                    ...styles.textInput,
                                    color: colors.text,
                                }}
                                placeholder={t('pages.map.search.hint')}
                                placeholderTextColor={colors.labelColor}
                                value={localSearch}
                                enablesReturnKeyAutomatically
                                clearButtonMode="always"
                                enterKeyHint="search"
                                onChangeText={(text) => {
                                    setLocalSearch(text)
                                }}
                                onFocus={() => {
                                    setSearchFocused(true)
                                    animate(width)

                                    bottomSheetRef.current?.expand()
                                }}
                                onBlur={() => {
                                    setSearchFocused(false)
                                    animate(0)
                                }}
                            />
                        ) : (
                            <BottomSheetTextInput
                                ref={textInputRef}
                                style={{
                                    backgroundColor: searchbarBackground,
                                    ...styles.textInput,
                                    color: colors.text,
                                }}
                                placeholder={t('pages.map.search.hint')}
                                placeholderTextColor={colors.labelColor}
                                value={localSearch}
                                enablesReturnKeyAutomatically
                                clearButtonMode="always"
                                enterKeyHint="search"
                                onChangeText={(text) => {
                                    setLocalSearch(text)
                                }}
                                onFocus={() => {
                                    setSearchFocused(true)
                                    animate(width)

                                    bottomSheetRef.current?.expand()
                                }}
                                onBlur={() => {
                                    setSearchFocused(false)
                                    animate(0)
                                }}
                            />
                        )}

                        <Animated.View
                            style={{
                                width: cancelWidth,
                                opacity: cancelOpacity,
                                ...styles.cancelContainer,
                            }}
                        >
                            <Pressable
                                onPress={() => {
                                    setLocalSearch('')
                                    textInputRef.current?.blur()
                                    //    bottomSheetRef.current?.snapToIndex(1)
                                }}
                                style={styles.cancelButton}
                            >
                                <Text
                                    style={{
                                        color: colors.primary,
                                        ...styles.cancelButtonText,
                                    }}
                                    numberOfLines={1}
                                    allowFontScaling={false}
                                    ellipsizeMode="clip"
                                >
                                    {t('misc.cancel')}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </View>

                    {searchFocused &&
                        localSearch === '' &&
                        searchHistory.length !== 0 && (
                            <>
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
                                                'pages.map.details.room.history'
                                            )}
                                        </Text>
                                    </View>
                                    <View style={styles.radius}>
                                        {searchHistory?.map(
                                            (history, index) => (
                                                <React.Fragment
                                                    key={history.title}
                                                >
                                                    <Swipeable
                                                        renderRightActions={() => (
                                                            <Pressable
                                                                style={
                                                                    styles.swipeableActionContainer
                                                                }
                                                                onPress={() => {
                                                                    LayoutAnimation.configureNext(
                                                                        LayoutAnimation
                                                                            .Presets
                                                                            .easeInEaseOut
                                                                    )
                                                                    if (
                                                                        Platform.OS ===
                                                                        'ios'
                                                                    ) {
                                                                        void selectionAsync()
                                                                    }
                                                                    deleteSearchHistoryItem(
                                                                        history
                                                                    )
                                                                }}
                                                            >
                                                                <PlatformIcon
                                                                    color={
                                                                        colors.notification
                                                                    }
                                                                    ios={{
                                                                        name: 'trash',
                                                                        size: 20,
                                                                    }}
                                                                    android={{
                                                                        name: 'delete',
                                                                        size: 24,
                                                                    }}
                                                                />
                                                            </Pressable>
                                                        )}
                                                    >
                                                        <View
                                                            style={{
                                                                ...styles.historyRow,
                                                                backgroundColor:
                                                                    colors.card,
                                                            }}
                                                        >
                                                            <ResultRow
                                                                result={history}
                                                                index={index}
                                                                colors={colors}
                                                                handlePresentModalPress={
                                                                    handlePresentModalPress
                                                                }
                                                                bottomSheetRef={
                                                                    bottomSheetRef
                                                                }
                                                                updateSearchHistory={
                                                                    addToSearchHistory
                                                                }
                                                            />
                                                        </View>
                                                    </Swipeable>
                                                    {index !==
                                                        searchHistory.length -
                                                            1 && (
                                                        <Divider
                                                            key={`divider-${index}`}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            )
                                        )}
                                    </View>
                                </View>
                            </>
                        )}

                    {searchFocused && localSearch === '' && (
                        <Text
                            style={{
                                color: colors.labelColor,
                                ...styles.noResults,
                                ...styles.searchHint,
                            }}
                        >
                            {t('pages.map.search.placeholder')}
                        </Text>
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
                                        updateSearchHistory={addToSearchHistory}
                                    />
                                )}
                                ItemSeparatorComponent={() => (
                                    <Divider iosPaddingLeft={50} />
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
                    ) : searchFocused ? null : (
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
                                                        if (details == null) {
                                                            void showToast(
                                                                t(
                                                                    'toast.roomNotFound'
                                                                )
                                                            )
                                                            return
                                                        }
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
                                                        trackEvent('Room', {
                                                            room: lecture
                                                                .rooms[0],
                                                            origin: 'NextLecture',
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
                                    {userKind !== USER_GUEST && (
                                        <Pressable
                                            onPress={() => {
                                                router.navigate('roomSearch')
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
                                    )}
                                </View>
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        ...styles.radius,
                                    }}
                                >
                                    {userKind === USER_GUEST ? (
                                        <Text
                                            style={{
                                                color: colors.text,
                                                ...styles.noResults,
                                            }}
                                        >
                                            {t('pages.map.details.room.signIn')}
                                        </Text>
                                    ) : availableRooms === null ? (
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

                                                            if (
                                                                details == null
                                                            ) {
                                                                void showToast(
                                                                    t(
                                                                        'toast.roomNotFound'
                                                                    )
                                                                )
                                                                return
                                                            }

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
                                                            trackEvent('Room', {
                                                                room: room.room,
                                                                origin: 'AvailableRoomsSuggestion',
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
                                                                    {t(
                                                                        'pages.rooms.options.seats'
                                                                    )}
                                                                    )
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
                            <AttributionLink />
                        </>
                    )}
                </View>
            </BottomSheetView>
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
        flex: 1,
    },
    historyRow: {
        paddingVertical: 3,
        paddingHorizontal: 12,

        width: '100%',
    },
    suggestionRow: {
        paddingVertical: 14,
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
        overflow: 'hidden',
    },
    noResults: {
        textAlign: 'center',
        paddingVertical: 30,
        fontSize: 16,
    },
    header: {
        fontWeight: '500',
        fontSize: 20,
        paddingTop: 8,
        marginBottom: 2,
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
        paddingStart: 4,
    },
    searchHint: {
        paddingTop: 60,
    },
    swipeableActionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
    },
    cancelContainer: { justifyContent: 'center' },
    cancelButton: {
        paddingLeft: 10,
        paddingRight: 2,

        alignSelf: 'center',
    },
    cancelButtonText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        height: 40,
        marginBottom: 10,
    },
})
