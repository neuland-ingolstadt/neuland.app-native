import { PreferencesContext, UserKindContext } from '@/components/contexts'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { SEARCH_TYPES, type SearchResult } from '@/types/map'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor, roomNotFoundToast } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import BottomSheet, {
    BottomSheetTextInput,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import Color from 'color'
import { selectionAsync } from 'expo-haptics'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import { type FeatureCollection } from 'geojson'
import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Animated,
    Easing,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    SectionList,
    Text,
    View,
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { type SharedValue } from 'react-native-reanimated'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import LoadingIndicator from '../Universal/LoadingIndicator'
import BottomSheetBackground from './BottomSheetBackground'
import ResultRow from './SearchResultRow'

interface MapBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>
    currentPosition: SharedValue<number>
    handlePresentModalPress: () => void
    allRooms: FeatureCollection
}

const AttributionLink: React.FC = () => {
    const { styles } = useStyles(stylesheet)
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
                <Text style={styles.attributionText}>
                    {t('pages.map.details.osm')}
                </Text>
                <PlatformIcon
                    ios={{
                        name: 'chevron.forward',
                        size: 11,
                    }}
                    android={{
                        name: 'chevron_right',
                        size: 16,
                    }}
                    style={styles.label}
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
    const { styles } = useStyles(stylesheet)
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
            handleIndicatorStyle={styles.indicator}
        >
            <BottomSheetView style={styles.page}>
                <BottomSheetView style={styles.inputContainer}>
                    <BottomSheetTextInput
                        ref={textInputRef}
                        style={styles.textInput}
                        placeholder={t('pages.map.search.hint')}
                        placeholderTextColor={styles.label.color}
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
                                bottomSheetRef.current?.snapToIndex(1)
                            }}
                            style={styles.cancelButton}
                        >
                            <Text
                                style={styles.cancelButtonText}
                                numberOfLines={1}
                                allowFontScaling={false}
                                ellipsizeMode="clip"
                            >
                                {t('misc.cancel')}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </BottomSheetView>

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
                                        style={styles.suggestionSectionHeader}
                                    >
                                        {t('pages.map.details.room.history')}
                                    </Text>
                                </View>
                                <View style={styles.radius}>
                                    {searchHistory?.map((history, index) => (
                                        <React.Fragment key={history.title}>
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
                                                            ios={{
                                                                name: 'trash',
                                                                size: 20,
                                                            }}
                                                            android={{
                                                                name: 'delete',
                                                                size: 24,
                                                            }}
                                                            style={styles.toast}
                                                        />
                                                    </Pressable>
                                                )}
                                            >
                                                <View style={styles.historyRow}>
                                                    <ResultRow
                                                        result={history}
                                                        index={index}
                                                        handlePresentModalPress={
                                                            handlePresentModalPress
                                                        }
                                                        updateSearchHistory={
                                                            addToSearchHistory
                                                        }
                                                    />
                                                </View>
                                            </Swipeable>
                                            {index !==
                                                searchHistory.length - 1 && (
                                                <Divider
                                                    key={`divider-${index}`}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                {searchFocused && localSearch === '' && (
                    <Text style={styles.searchHint}>
                        {t('pages.map.search.placeholder')}
                    </Text>
                )}

                {localSearch !== '' ? (
                    searchResultsExact.length > 0 ||
                    searchResultsFuzzy.length > 0 ? (
                        <SectionList
                            contentContainerStyle={styles.contentContainer}
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
                                    handlePresentModalPress={
                                        handlePresentModalPress
                                    }
                                    updateSearchHistory={addToSearchHistory}
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <Divider iosPaddingLeft={50} />
                            )}
                            stickySectionHeadersEnabled={false}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text style={styles.header}>{title}</Text>
                            )}
                        />
                    ) : (
                        <Text style={styles.noResults}>
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
                                        style={styles.suggestionSectionHeader}
                                    >
                                        {t(
                                            'pages.map.details.room.nextLecture'
                                        )}
                                    </Text>
                                    <Text style={styles.suggestionMoreDateText}>
                                        {formatFriendlyDate(
                                            nextLecture[0].date
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.radiusBg}>
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
                                                                lecture.rooms[0]
                                                        )
                                                    if (details == null) {
                                                        roomNotFoundToast(
                                                            lecture.rooms[0],
                                                            styles.toast.color
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
                                                        data: lecture.rooms[0],
                                                        type: SEARCH_TYPES.ROOM,
                                                        center: details
                                                            ?.properties
                                                            ?.center,
                                                        manual: false,
                                                    })
                                                    trackEvent('Room', {
                                                        room: lecture.rooms[0],
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
                                                        style={
                                                            styles.suggestionIconContainer
                                                        }
                                                    >
                                                        <PlatformIcon
                                                            ios={{
                                                                name: 'clock.fill',
                                                                size: 18,
                                                            }}
                                                            android={{
                                                                name: 'school',
                                                                size: 20,
                                                            }}
                                                            style={
                                                                styles.primaryContrast
                                                            }
                                                        />
                                                    </View>

                                                    <View
                                                        style={
                                                            styles.suggestionContent
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.suggestionTitle
                                                            }
                                                            numberOfLines={2}
                                                        >
                                                            {lecture.name}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.suggestionSubtitle
                                                            }
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
                                                        style={styles.timeLabel}
                                                    >
                                                        {formatFriendlyTime(
                                                            lecture.startDate
                                                        )}
                                                    </Text>
                                                    <Text style={styles.time}>
                                                        {formatFriendlyTime(
                                                            lecture.endDate
                                                        )}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            {key !== nextLecture.length - 1 && (
                                                <Divider />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View>
                            <View
                                style={styles.suggestionSectionHeaderContainer}
                            >
                                <Text style={styles.suggestionSectionHeader}>
                                    {t('pages.map.details.room.availableRooms')}
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
                                            style={
                                                styles.suggestionMoreButtonText
                                            }
                                        >
                                            {t('misc.more')}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                            <Pressable
                                style={styles.radiusBg}
                                onPress={() => {
                                    router.navigate('login')
                                }}
                                disabled={userKind !== USER_GUEST}
                            >
                                {userKind === USER_GUEST ? (
                                    <Text style={styles.noResults}>
                                        {t('pages.map.details.room.signIn')}
                                    </Text>
                                ) : availableRooms === null ? (
                                    <LoadingIndicator
                                        style={styles.loadingMargin}
                                    />
                                ) : availableRooms.length === 0 ? (
                                    <Text style={styles.noResults}>
                                        {t('pages.map.noAvailableRooms')}
                                    </Text>
                                ) : (
                                    availableRooms
                                        .slice(0, 3)
                                        .map((room, key) => (
                                            <React.Fragment key={key}>
                                                <Pressable
                                                    key={key}
                                                    style={styles.suggestionRow}
                                                    onPress={() => {
                                                        const details =
                                                            allRooms.features.find(
                                                                (x) =>
                                                                    x.properties
                                                                        ?.Raum ===
                                                                    room.room
                                                            )

                                                        if (details == null) {
                                                            roomNotFoundToast(
                                                                room.room,
                                                                styles.toast
                                                                    .color
                                                            )
                                                            return
                                                        }

                                                        const etage =
                                                            details?.properties
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
                                                            style={
                                                                styles.suggestionIconContainer
                                                            }
                                                        >
                                                            <PlatformIcon
                                                                ios={{
                                                                    name: 'studentdesk',
                                                                    size: 18,
                                                                }}
                                                                android={{
                                                                    name: 'school',
                                                                    size: 20,
                                                                }}
                                                                style={
                                                                    styles.primaryContrast
                                                                }
                                                            />
                                                        </View>

                                                        <View
                                                            style={
                                                                styles.suggestionContent
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.suggestionTitle
                                                                }
                                                            >
                                                                {room.room}
                                                            </Text>
                                                            <Text
                                                                style={
                                                                    styles.suggestionSubtitle
                                                                }
                                                            >
                                                                {room.type} (
                                                                {room.capacity}{' '}
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
                                                            style={
                                                                styles.timeLabel
                                                            }
                                                        >
                                                            {formatFriendlyTime(
                                                                room.from
                                                            )}
                                                        </Text>
                                                        <Text
                                                            style={styles.time}
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
                            </Pressable>
                        </View>
                        <AttributionLink />
                    </>
                )}
            </BottomSheetView>
        </BottomSheet>
    )
}

export default MapBottomSheet

const stylesheet = createStyleSheet((theme) => ({
    attributionContainer: { paddingVertical: 40 },
    attributionLink: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    attributionText: {
        color: theme.colors.labelColor,
        fontSize: 15,
        paddingStart: 4,
    },
    cancelButton: {
        alignSelf: 'center',
        paddingLeft: 10,

        paddingRight: 2,
    },
    cancelButtonText: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelContainer: { justifyContent: 'center' },
    contentContainer: {
        paddingBottom: theme.margins.bottomSafeArea,
    },
    header: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 2,
        paddingTop: 8,
        textAlign: 'left',
    },
    historyRow: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: 12,
        paddingVertical: 3,
        width: '100%',
    },
    indicator: {
        backgroundColor: theme.colors.labelSecondaryColor,
    },

    inputContainer: {
        flexDirection: 'row',
        height: 40,
        marginBottom: 10,
    },
    label: {
        color: theme.colors.labelColor,
    },
    loadingMargin: {
        marginVertical: 30,
    },
    noResults: {
        color: theme.colors.text,
        fontSize: 16,
        paddingVertical: 30,
        textAlign: 'center',
    },
    page: {
        paddingHorizontal: theme.margins.page,
    },
    primaryContrast: {
        color: getContrastColor(theme.colors.primary),
    },
    radius: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    radiusBg: {
        backgroundColor: theme.colors.card,
        borderRadius: 14,
        overflow: 'hidden',
    },
    searchHint: {
        color: theme.colors.labelColor,
        fontSize: 16,
        paddingTop: 60,
        paddingVertical: 30,
        textAlign: 'center',
    },
    suggestionContainer: {
        marginBottom: 10,
    },
    suggestionContent: {
        flex: 1,
        paddingRight: 14,
    },
    suggestionIconContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 50,
        height: 40,
        justifyContent: 'center',
        marginRight: 14,
        width: 40,
    },
    suggestionInnerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    suggestionMoreButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '500',
        paddingRight: 10,
        textAlign: 'right',
    },
    suggestionMoreDateText: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontWeight: '500',
        paddingRight: 10,
        textAlign: 'right',
    },
    suggestionRightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    suggestionRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    suggestionSectionHeader: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 2,
        paddingTop: 8,
        textAlign: 'left',
    },
    suggestionSectionHeaderContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    suggestionSubtitle: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '400',
    },
    suggestionTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 1,
    },
    swipeableActionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
    },
    textInput: {
        backgroundColor:
            UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.card).lighten(0.3).hex()
                : Color(theme.colors.card).darken(0.03).hex(),
        borderRadius: theme.radius.mg,
        color: theme.colors.text,
        flex: 1,
        fontSize: 17,
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    time: {
        color: theme.colors.text,
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        color: theme.colors.labelColor,
        fontVariant: ['tabular-nums'],
    },
    toast: {
        color: theme.colors.notification,
    },
}))
