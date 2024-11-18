import ErrorView from '@/components/Error/ErrorView'
import SportsRow from '@/components/Rows/SportsRow'
import PlatformIcon from '@/components/Universal/Icon'
import { UserKindContext } from '@/components/contexts'
import { useRefreshByUser } from '@/hooks'
import { type UniversitySports } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { type UseQueryResult } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import Collapsible from 'react-native-collapsible'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import LoadingIndicator from '../Universal/LoadingIndicator'

export default function ClSportsPage({
    sportsResult,
}: {
    sportsResult: UseQueryResult<
        Array<{ title: UniversitySports['weekday']; data: UniversitySports[] }>,
        Error
    >
}): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { userCampus } = useContext(UserKindContext)
    const [selectedLocation, setSelectedLocation] =
        useState<string>('Ingolstadt')

    useEffect(() => {
        if (userCampus != null) {
            setSelectedLocation(userCampus)
        }
    }, [userCampus])

    const sportsEvents = useMemo(() => {
        if (sportsResult.data == null) {
            return []
        }
        return sportsResult.data
            .map((section) => ({
                ...section,
                data: section.data.filter(
                    (event) => event.campus === selectedLocation
                ),
            }))
            .filter((section) => section.data.length > 0)
    }, [sportsResult.data, selectedLocation])

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
        data: Array<{
            title: UniversitySports['weekday']
            data: UniversitySports[]
        }>
    }): JSX.Element => {
        return (
            <View>
                {data.map((section, index) => (
                    <SportsWeekday
                        title={
                            section.title.toLowerCase() as Lowercase<
                                UniversitySports['weekday']
                            >
                        }
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
        title: Lowercase<UniversitySports['weekday']>
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
                        <Text style={styles.categoryText}>
                            {t(`dates.weekdays.${title}`)}
                        </Text>
                        <PlatformIcon
                            ios={{
                                name: collapsed ? 'chevron.down' : 'chevron.up',
                                size: 13,
                                weight: 'semibold',
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
                        {data.map((event, index) => (
                            <React.Fragment key={event.id}>
                                <SportsRow event={event} />
                                {index < data.length - 1 && (
                                    <Divider iosPaddingLeft={16} />
                                )}
                            </React.Fragment>
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
        const isSelected = selectedLocation === location

        return (
            <Pressable
                style={styles.locationButtonContainer}
                onPress={() => {
                    setSelectedLocation(location)
                    if (Platform.OS === 'ios') {
                        void selectionAsync()
                    }
                }}
            >
                <View style={styles.locationTextContainer}>
                    {/* Invisible text to reserve space */}
                    <Text style={styles.invisibleFont}>{location}</Text>
                    <Text style={styles.locationText(isSelected)}>
                        {location}
                    </Text>
                </View>
            </Pressable>
        )
    }

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.itemsContainer}
                style={styles.page}
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
                    <LoadingIndicator />
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
                        <Text style={styles.campusHeader}>{'Campus'}</Text>
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
                                <EventList data={sportsEvents} />
                            ) : (
                                <ErrorView
                                    title={t(
                                        'pages.clEvents.sports.noEvents.title'
                                    )}
                                    icon={{
                                        ios: 'sportscourt',
                                        android: 'sports_gymnastics',
                                    }}
                                    message={t(
                                        'pages.clEvents.sports.noEvents.subtitle'
                                    )}
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

const stylesheet = createStyleSheet((theme) => ({
    campusHeader: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
        verticalAlign: 'middle',
    },
    categoryContainer: {
        alignContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    categoryText: {
        colors: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        paddingTop: 10,
    },
    contentBorder: {
        borderRadius: theme.radius.md,
    },
    contentContainer: {
        borderRadius: theme.radius.md,
        overflow: 'hidden',
    },
    invisibleFont: {
        color: '#00000000',
        fontWeight: '600',
    },
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.margins.page,
        paddingBottom: theme.margins.bottomSafeArea,
        width: '100%',
    },
    locationButtonContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center',
        padding: 8,
        paddingHorizontal: 16,
    },
    locationRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
        paddingTop: 8,
    },
    locationText: (isSelect: boolean) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontWeight: isSelect ? '600' : undefined,
        color: isSelect ? theme.colors.primary : theme.colors.text,
    }),
    locationTextContainer: { alignItems: 'center', position: 'relative' },
    page: {
        paddingHorizontal: theme.margins.page,
    },
    toggleIcon: {
        alignSelf: 'flex-end',
        marginRight: 4,
    },
    weekdaysContainer: { marginBottom: 10 },
}))
