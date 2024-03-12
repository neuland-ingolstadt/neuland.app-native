import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/provider'
import { useInterval } from '@/hooks/useInterval'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDateTime, formatFriendlyTime } from '@/utils/date-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const TimetableCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userKind } = useContext(UserKindContext)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [filteredTimetable, setFilteredTimetable] = useState<
        FriendlyTimetableEntry[]
    >([])
    const { t } = useTranslation('navigation')

    const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
        const timetable = await getFriendlyTimetable(new Date(), true)
        if (timetable.length === 0) {
            throw new Error('Timetable is empty')
        }
        return timetable
    }

    const { data: timetable } = useQuery({
        queryKey: ['timetable', userKind],
        queryFn: loadTimetable,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours,
        retry(failureCount, error) {
            const ignoreErrors = [
                '"Time table does not exist" (-202)',
                'Timetable is empty',
            ]
            if (ignoreErrors.includes(error?.message)) {
                return false
            }
            return failureCount < 3
        },
    })

    const loadData = useCallback(async () => {
        try {
            if (timetable == null || timetable.length === 0) {
                throw new Error('Timetable is empty')
            }
            const filteredTimetable = timetable
                .filter((item) => new Date(item.endDate) > new Date())
                .slice(0, 2)
            setFilteredTimetable(filteredTimetable)
            setLoadingState(LoadingState.LOADED)
        } catch (e) {
            setLoadingState(LoadingState.ERROR)
        }
    }, [])

    const fetchDataEvery60Secs = useCallback(() => {
        void loadData()
    }, [loadData, timetable])

    useInterval(fetchDataEvery60Secs, 60 * 1000)

    useFocusEffect(() => {
        if (userKind !== 'guest' && loadingState !== LoadingState.LOADED) {
            void loadData()
        } else if (userKind === 'guest') {
            setLoadingState(LoadingState.ERROR)
        }

        return () => {
            // @ts-expect-error overload matches
            clearInterval(fetchDataEvery60Secs)
        }
    })

    const currentTime = new Date()
    return (
        <BaseCard
            title="timetable"
            iosIcon="clock.fill"
            androidIcon="calendar_month"
            onPress={() => {
                router.push('timetable')
            }}
        >
            {loadingState === LoadingState.LOADED && (
                <View
                    style={{
                        ...styles.calendarView,
                        ...(filteredTimetable.length > 0 && styles.cardsFilled),
                    }}
                >
                    {filteredTimetable.map((x, i) => {
                        const isSoon =
                            x.startDate > currentTime &&
                            new Date(x.startDate) <=
                                new Date(currentTime.getTime() + 30 * 60 * 1000)
                        const isOngoing =
                            x.startDate < currentTime && x.endDate > currentTime
                        const isEndingSoon =
                            isOngoing &&
                            x.endDate.getTime() - currentTime.getTime() <=
                                30 * 60 * 1000
                        const isNotSoonOrOngoing = !isSoon && !isOngoing
                        let text = null

                        if (isSoon) {
                            text = t('cards.timetable.startingSoon', {
                                count: Math.ceil(
                                    (x.startDate.getTime() -
                                        currentTime.getTime()) /
                                        1000 /
                                        60
                                ),
                            })
                        } else if (isEndingSoon) {
                            text = t('cards.timetable.endingSoon', {
                                count: Math.ceil(
                                    (x.endDate.getTime() -
                                        currentTime.getTime()) /
                                        1000 /
                                        60
                                ),
                            })
                        } else if (isOngoing) {
                            text = t('cards.timetable.ongoing', {
                                time: formatFriendlyTime(x.endDate),
                            })
                        } else if (isNotSoonOrOngoing) {
                            text = formatFriendlyDateTime(x.startDate)
                        }

                        return (
                            <View key={i}>
                                <Text
                                    style={{
                                        ...styles.eventTitle,
                                        color: colors.text,
                                    }}
                                    numberOfLines={1}
                                >
                                    {x.name}
                                </Text>
                                <Text
                                    style={{
                                        ...styles.eventDetails,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {text}
                                </Text>
                                {filteredTimetable.length - 1 !== i && (
                                    <>
                                        <View style={styles.divider} />
                                        <Divider
                                            color={colors.border}
                                            width={'100%'}
                                        />
                                    </>
                                )}
                            </View>
                        )
                    })}
                </View>
            )}
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    calendarView: {
        gap: 8,
    },
    cardsFilled: {
        paddingTop: 12,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    eventDetails: {
        fontSize: 15,
    },
    divider: {
        height: 10,
    },
})

export default TimetableCard
