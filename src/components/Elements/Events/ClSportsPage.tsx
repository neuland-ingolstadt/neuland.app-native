import ErrorView from '@/components/Elements/Error/ErrorView'
import SportsRow from '@/components/Elements/Rows/SportsRow'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { useRefreshByUser } from '@/hooks'
import { type UniversitySports } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { type UseQueryResult } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
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

import Divider from '../Universal/Divider'

export default function ClSportsPage({
    sportsResult,
}: {
    sportsResult: UseQueryResult<
        Array<{ title: UniversitySports['weekday']; data: UniversitySports[] }>,
        Error
    >
}): JSX.Element {
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
                        <Text
                            style={[
                                styles.categoryText,
                                { color: colors.text },
                            ]}
                        >
                            {t(`dates.weekdays.${title}`)}
                        </Text>
                        <PlatformIcon
                            color={colors.primary}
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
                                <SportsRow event={event} colors={colors} />
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
        const fontWeight = isSelected ? '600' : undefined
        const invisibleText = '#00000000'

        return (
            <Pressable
                style={{
                    borderColor: colors.border,
                    ...styles.locationButtonContainer,
                    backgroundColor: colors.card,
                }}
                onPress={() => {
                    setSelectedLocation(location)
                    if (Platform.OS === 'ios') {
                        void selectionAsync()
                    }
                }}
            >
                <View style={styles.locationTextContainer}>
                    {/* Invisible text to reserve space */}
                    <Text
                        style={{
                            color: invisibleText,
                            ...styles.invisibleFont,
                        }}
                    >
                        {location}
                    </Text>
                    <Text
                        style={{
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight,
                            ...styles.locationText,
                        }}
                    >
                        {location}
                    </Text>
                </View>
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

const styles = StyleSheet.create({
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        marginHorizontal: PAGE_PADDING,
        paddingBottom: 64,
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
    },
    toggleIcon: {
        marginRight: 4,
        alignSelf: 'flex-end',
    },
    categoryText: {
        fontSize: 16,
        paddingTop: 10,
        fontWeight: '600',
    },
    locationButtonContainer: {
        padding: 8,
        paddingHorizontal: 16,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 8,
        paddingBottom: 4,
    },
    weekdaysContainer: { marginBottom: 10 },
    campusHeader: {
        fontWeight: '500',
        verticalAlign: 'middle',
        fontSize: 16,
    },
    invisibleFont: {
        fontWeight: '600',
    },
    locationText: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
    },
    locationTextContainer: { position: 'relative', alignItems: 'center' },
})
