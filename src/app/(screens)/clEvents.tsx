import ErrorView from '@/components/Elements/Error/ErrorView'
import CLEventRow from '@/components/Elements/Rows/EventRow'
import SportsRow from '@/components/Elements/Rows/SportsRow'
import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { useRefreshByUser } from '@/hooks'
import { type UniversitySports } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import {
    loadCampusLifeEvents,
    loadUniversitySportsEvents,
} from '@/utils/events-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, pausedToast } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQueries } from '@tanstack/react-query'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Animated,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import Collapsible from 'react-native-collapsible'
import PagerView from 'react-native-pager-view'

export default function Events(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { userFaculty } = useContext(UserKindContext)
    const { t } = useTranslation('common')
    const locations = ['Ingolstadt', 'Neuburg']
    const [selectedLocations, setSelectedLocations] = useState<string[]>(
        userFaculty === 'Nachhaltige Infrastruktur'
            ? ['Neuburg']
            : ['Ingolstadt']
    )

    const results = useQueries({
        queries: [
            {
                queryKey: ['campusLifeEvents'],
                queryFn: loadCampusLifeEvents,
                staleTime: 1000 * 60 * 60, // 60 minutes
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
            {
                queryKey: ['universitySportj'],
                queryFn: loadUniversitySportsEvents,
                select: (
                    data: Array<{ title: string; data: UniversitySports[] }>
                ) => {
                    // filter data based on selected locations
                    console.log('data', data)
                    return data
                        .map((section) => ({
                            ...section,
                            data: section.data.filter((event) =>
                                selectedLocations.includes(event.campus)
                            ),
                        }))
                        .filter((section) => section.data.length > 0)
                },
                staleTime: 1000 * 60 * 60, // 60 minutes
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
        ],
    })

    const clEventsResult = results[0]
    const sportsResult = results[1]

    const {
        isRefetchingByUser: isRefetchingByUserClEvents,
        refetchByUser: refetchByUserClEvents,
    } = useRefreshByUser(clEventsResult.refetch)
    const {
        isRefetchingByUser: isRefetchingByUserSports,
        refetchByUser: refetchByUserSports,
    } = useRefreshByUser(sportsResult.refetch)
    const scrollY = new Animated.Value(0)

    useEffect(() => {
        if (
            (clEventsResult.isPaused && clEventsResult.data != null) ||
            (sportsResult.isPaused && sportsResult.data != null)
        ) {
            pausedToast()
        }
    }, [sportsResult.isPaused, clEventsResult.isPaused])
    const [selectedData, setSelectedData] = useState<number>(0)
    const screenHeight = useWindowDimensions().height

    const pagerViewRef = useRef<PagerView>(null)
    function setPage(page: number): void {
        pagerViewRef.current?.setPage(page)
    }
    const displayTypes = ['Events', t('pages.clEvents.sports.title')]

    const EventList = ({
        data,
    }: {
        data: Array<{ title: string; data: UniversitySports[] }>
    }): JSX.Element => {
        return (
            <View>
                {data.map((section, index) => (
                    <SportsWeekday
                        title={section.title}
                        data={section.data}
                        key={index}
                    />
                ))}
            </View>
        )
    }

    const SportsWeekday = ({
        title,
        data,
    }: {
        title: string
        data: UniversitySports[]
    }): JSX.Element => {
        const [collapsed, setCollapsed] = useState(false)

        return (
            <View style={styles.weekdaysContainer}>
                <Pressable
                    onPress={() => {
                        setCollapsed(!collapsed)
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    hitSlop={{ top: 6, bottom: 6 }}
                >
                    <View style={styles.categoryContainer}>
                        <Text
                            style={[
                                styles.categoryText,
                                { color: colors.text },
                            ]}
                        >
                            {title}
                        </Text>
                        <PlatformIcon
                            color={colors.primary}
                            ios={{
                                name: collapsed ? 'chevron.down' : 'chevron.up',
                                size: 14,
                                weight: 'bold',
                            }}
                            android={{
                                name: collapsed ? 'expand_more' : 'expand_less',
                                size: 20,
                            }}
                            style={styles.toggleIcon}
                        />
                    </View>
                </Pressable>
                <Collapsible collapsed={collapsed}>
                    <View style={styles.contentContainer}>
                        {data.map((event) => (
                            <SportsRow
                                event={event}
                                colors={colors}
                                key={event.id}
                            />
                        ))}
                    </View>
                </Collapsible>
            </View>
        )
    }

    const LocationButton = ({
        location,
    }: {
        location: string
    }): JSX.Element => {
        return (
            <Pressable
                style={{
                    borderColor: colors.border,
                    ...styles.locationButtonContainer,
                    backgroundColor: selectedLocations.includes(location)
                        ? colors.primary
                        : colors.card,
                }}
                onPress={() => {
                    if (selectedLocations.includes(location)) {
                        setSelectedLocations(
                            selectedLocations.filter((loc) => loc !== location)
                        )
                    } else {
                        setSelectedLocations([...selectedLocations, location])
                    }
                }}
            >
                <Text
                    style={{
                        color: getContrastColor(
                            selectedLocations.includes(location)
                                ? colors.primary
                                : colors.card
                        ),
                    }}
                >
                    {location}
                </Text>
            </Pressable>
        )
    }

    return (
        <View
            style={{
                paddingVertical: PAGE_PADDING,
                ...styles.pagerContainer,
            }}
        >
            <Animated.View
                style={{
                    borderColor: colors.border,
                    borderBottomWidth: scrollY.interpolate({
                        inputRange: [0, 0, 1],
                        outputRange: [0, 0, 0.5],
                        extrapolate: 'clamp',
                    }),
                    ...styles.toggleContainer,
                }}
            >
                <ToggleRow
                    items={displayTypes}
                    selectedElement={selectedData}
                    setSelectedElement={setPage}
                />
            </Animated.View>

            <PagerView
                ref={pagerViewRef}
                style={{
                    ...styles.pagerContainer,
                    height: screenHeight,
                }}
                initialPage={0}
                onPageSelected={(e) => {
                    const page = e.nativeEvent.position
                    setSelectedData(page)
                }}
                scrollEnabled
                overdrag
            >
                {/* Page 1: Events */}
                <View>
                    <ScrollView
                        contentContainerStyle={[styles.itemsContainer]}
                        style={{ paddingHorizontal: PAGE_PADDING }}
                        onScroll={
                            Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: scrollY },
                                        },
                                    },
                                ],
                                { useNativeDriver: false }
                            ) as any
                        }
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetchingByUserClEvents}
                                onRefresh={() => {
                                    void refetchByUserClEvents()
                                }}
                            />
                        }
                    >
                        {clEventsResult.isLoading ? (
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                            />
                        ) : clEventsResult.isError ? (
                            <ErrorView
                                title={
                                    clEventsResult.error?.message ??
                                    t('error.title')
                                }
                                onButtonPress={() => {
                                    void refetchByUserClEvents()
                                }}
                                inModal
                            />
                        ) : clEventsResult.isPaused &&
                          !clEventsResult.isSuccess ? (
                            <ErrorView title={networkError} inModal />
                        ) : (
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    ...styles.contentBorder,
                                }}
                            >
                                {clEventsResult.data != null &&
                                clEventsResult.data.length > 0 ? (
                                    <View
                                        style={{
                                            backgroundColor: colors.card,
                                            ...styles.contentBorder,
                                        }}
                                    >
                                        {clEventsResult.data?.map(
                                            (event, index) => (
                                                <React.Fragment key={index}>
                                                    <CLEventRow
                                                        event={event}
                                                        colors={colors}
                                                    />
                                                    {index !==
                                                        clEventsResult.data
                                                            .length -
                                                            1 && (
                                                        <Divider
                                                            color={
                                                                colors.labelTertiaryColor
                                                            }
                                                            iosPaddingLeft={16}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            )
                                        )}
                                    </View>
                                ) : (
                                    <ErrorView
                                        title={t(
                                            'pages.calendar.exams.noExams.title'
                                        )}
                                        message={t(
                                            'pages.calendar.exams.noExams.subtitle'
                                        )}
                                        icon={{
                                            ios: 'calendar.badge.clock',
                                            android: 'calendar_clock',
                                        }}
                                        inModal
                                        isCritical={false}
                                    />
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Page 2: Sports */}
                <View>
                    <ScrollView
                        contentContainerStyle={[styles.itemsContainer]}
                        style={{ paddingHorizontal: PAGE_PADDING }}
                        onScroll={
                            Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: scrollY },
                                        },
                                    },
                                ],
                                { useNativeDriver: false }
                            ) as any
                        }
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetchingByUserSports}
                                onRefresh={() => {
                                    void refetchByUserSports()
                                }}
                            />
                        }
                    >
                        {sportsResult.isLoading ? (
                            <ActivityIndicator
                                size="small"
                                color={colors.primary}
                            />
                        ) : sportsResult.isError ? (
                            <ErrorView
                                title={
                                    sportsResult.error?.message ??
                                    t('error.title')
                                }
                                onButtonPress={() => {
                                    void refetchByUserSports()
                                }}
                                inModal
                            />
                        ) : sportsResult.isPaused && !sportsResult.isSuccess ? (
                            <ErrorView title={networkError} inModal />
                        ) : (
                            <View>
                                <Text
                                    style={{
                                        color: colors.text,
                                        ...styles.campusHeader,
                                    }}
                                >
                                    {'Campus'}
                                </Text>
                                <View style={styles.locationRow}>
                                    {locations.map((location, index) => (
                                        <LocationButton
                                            location={location}
                                            key={index}
                                        />
                                    ))}
                                </View>
                                <View
                                    style={{
                                        ...styles.contentBorder,
                                    }}
                                >
                                    {sportsResult.data != null ? (
                                        <EventList data={sportsResult.data} />
                                    ) : (
                                        <ErrorView
                                            title={t(
                                                'pages.calendar.exams.noExams.title'
                                            )}
                                            message={t(
                                                'pages.calendar.exams.noExams.subtitle'
                                            )}
                                            icon={{
                                                ios: 'calendar.badge.clock',
                                                android: 'calendar_clock',
                                            }}
                                            inModal
                                            isCritical={false}
                                        />
                                    )}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </PagerView>
        </View>
    )
}

const styles = StyleSheet.create({
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        marginHorizontal: PAGE_PADDING,
    },
    pagerContainer: {
        flex: 1,
    },
    contentBorder: {
        borderRadius: 8,
    },
    toggleContainer: {
        paddingBottom: 12,
    },

    contentContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        paddingBottom: 10,
        paddingTop: 0,
    },
    toggleIcon: {
        marginRight: 4,

        alignSelf: 'center',
        alignContent: 'center',
    },
    categoryText: {
        fontSize: 16,
        paddingTop: 10,
        fontWeight: '600',
    },
    locationButtonContainer: {
        padding: 8,
        paddingHorizontal: 16,
        borderWidth: 1,

        borderRadius: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    weekdaysContainer: { marginBottom: 12 },
    campusHeader: {
        fontWeight: 'bold',
        verticalAlign: 'middle',
        fontSize: 16,
    },
})
