import Divider from '@/components/Universal/Divider'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useInterval } from '@/hooks/useInterval'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDateTime, formatFriendlyTime } from '@/utils/date-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const TimetableCard: React.FC = () => {
    const { styles, theme } = useStyles(stylesheet)
    const { userKind = USER_GUEST } = useContext(UserKindContext)
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
        queryKey: ['timetableV2', userKind],
        queryFn: loadTimetable,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 24 * 60 * 60 * 1000, // 24 hours,
        retry(failureCount, error) {
            const ignoreErrors = [
                '"Time table does not exist" (-202)',
                'Timetable is empty',
            ]
            return !ignoreErrors.includes(error?.message) && failureCount < 2
        },
    })

    const filterData = useCallback(() => {
        if (timetable == null) return
        const now = new Date()
        const upcomingEvents = timetable
            .filter((item) => new Date(item.endDate) > now)
            .slice(0, 2)
        setFilteredTimetable(upcomingEvents)
        setLoadingState(LoadingState.LOADED)
    }, [timetable])

    useInterval(filterData, 60 * 1000)

    useFocusEffect(
        useCallback(() => {
            if (
                userKind !== USER_GUEST &&
                loadingState !== LoadingState.LOADED
            ) {
                filterData()
            } else if (userKind === USER_GUEST) {
                setLoadingState(LoadingState.ERROR)
            }
        }, [userKind, loadingState, filterData])
    )

    useEffect(() => {
        if (timetable != null) filterData()
    }, [timetable, filterData])

    const renderEvent = (
        event: FriendlyTimetableEntry,
        index: number,
        currentTime: Date
    ): JSX.Element => {
        const isSoon =
            event.startDate > currentTime &&
            new Date(event.startDate) <=
                new Date(currentTime.getTime() + 30 * 60 * 1000)
        const isOngoing =
            event.startDate < currentTime && event.endDate > currentTime
        const isEndingSoon =
            isOngoing &&
            event.endDate.getTime() - currentTime.getTime() <= 30 * 60 * 1000

        let eventText: string | null = null
        if (isSoon) {
            eventText = t('cards.timetable.startingSoon', {
                count: Math.ceil(
                    (event.startDate.getTime() - currentTime.getTime()) / 60000
                ),
            })
        } else if (isEndingSoon) {
            eventText = t('cards.timetable.endingSoon', {
                count: Math.ceil(
                    (event.endDate.getTime() - currentTime.getTime()) / 60000
                ),
            })
        } else if (isOngoing) {
            eventText = t('cards.timetable.ongoing', {
                time: formatFriendlyTime(event.endDate),
            })
        } else {
            eventText = formatFriendlyDateTime(event.startDate)
        }

        return (
            <View key={index}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.name}
                </Text>
                <Text style={styles.eventDetails}>{eventText}</Text>
                {index < filteredTimetable.length - 1 && (
                    <>
                        <View style={styles.divider} />
                        <Divider width="100%" color={theme.colors.border} />
                    </>
                )}
            </View>
        )
    }

    return (
        <BaseCard title="timetable" onPressRoute="/timetable">
            {loadingState === LoadingState.LOADED && (
                <View
                    style={[
                        styles.calendarView,
                        filteredTimetable.length > 0 && styles.cardsFilled,
                    ]}
                >
                    {filteredTimetable.map((event, index) =>
                        renderEvent(event, index, new Date())
                    )}
                </View>
            )}
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    calendarView: { gap: 8 },
    cardsFilled: { paddingTop: 12 },
    divider: { height: 10 },
    eventDetails: { color: theme.colors.labelColor, fontSize: 15 },
    eventTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '500' },
}))

export default TimetableCard
