import ErrorView from '@/components/Elements/Error/ErrorView'
import SportsRow from '@/components/Elements/Rows/SportsRow'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { type UniversitySports } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { type UseQueryResult } from '@tanstack/react-query'
import React, { useState } from 'react'
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
} from 'react-native'
import Collapsible from 'react-native-collapsible'

export default function ClSportsPage({
    sportsResult,
    selectedLocations,
    setSelectedLocations,
}: {
    sportsResult: UseQueryResult<
        Array<{ title: string; data: UniversitySports[] }>,
        Error
    >
    selectedLocations: string[]
    setSelectedLocations: (locations: string[]) => void
}): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const locations = ['Ingolstadt', 'Neuburg']

    const {
        isRefetchingByUser: isRefetchingByUserSports,
        refetchByUser: refetchByUserSports,
    } = useRefreshByUser(sportsResult.refetch)
    const scrollY = new Animated.Value(0)

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
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : sportsResult.isError ? (
                    <ErrorView
                        title={sportsResult.error?.message ?? t('error.title')}
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
    )
}

const styles = StyleSheet.create({
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        marginHorizontal: PAGE_PADDING,
    },
    contentBorder: {
        borderRadius: 8,
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
