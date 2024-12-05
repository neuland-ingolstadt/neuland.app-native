import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Universal/Divider'
import { FlowContext, UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { type LanguageKey } from '@/localization/i18n'
import { type Calendar } from '@/types/data'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const CalendarCard = (): JSX.Element => {
    type Combined = Calendar | CardExams
    const router = useRouter()
    const time = new Date()
    const { i18n, t } = useTranslation('navigation')
    const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
    const flow = useContext(FlowContext)
    const { userKind = USER_GUEST } = React.useContext(UserKindContext)
    interface CardExams {
        name: string
        begin: Date
        end?: Date
    }

    async function loadExams(): Promise<CardExams[]> {
        let exams: CardExams[] = []
        try {
            // TODO: extract the fetch logic into a separate function to improve caching
            exams = (await loadExamList()).map((x) => ({
                name: t('cards.calendar.exam', { name: x.name }),
                begin: new Date(x.date),
            }))
        } catch (e) {
            if (e instanceof NoSessionError) {
                if (flow.isOnboarded === true) {
                    router.navigate('/login')
                }
            } else if ((e as Error).message === 'Query not possible') {
                // ignore, leaving examList empty
            } else {
                console.log(e as Error)
            }
        }
        return exams
    }

    const { data: exams } = useQuery({
        queryKey: ['cardExams'],
        queryFn: loadExams,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.navigate('/login')
                return false
            }
            return failureCount < 2
        },
        enabled: userKind === USER_STUDENT,
    })

    useEffect(() => {
        const combined = [...calendar, ...(exams ?? [])]
            .map((item) => ({ ...item, begin: new Date(item.begin) })) // begin might a string due to JSON serialization in cache
            .sort((a, b) => a.begin.getTime() - b.begin.getTime())
            .filter(
                (x) => x.begin > time || (x.end ?? '-1') > time
            ) as Combined[]
        setMixedCalendar(combined.slice(0, 2))
    }, [calendar, exams])

    const { styles, theme } = useStyles(stylesheet)

    return (
        <BaseCard title="calendar" onPressRoute="calendar">
            <View
                style={{
                    ...styles.calendarView,
                    ...(mixedCalendar.length > 0 && styles.calenderFilled),
                }}
            >
                {mixedCalendar.map((event, index) => (
                    <React.Fragment key={index}>
                        <View>
                            <Text style={styles.eventTitle} numberOfLines={2}>
                                {typeof event.name === 'object'
                                    ? event.name[i18n.language as LanguageKey]
                                    : event.name}
                            </Text>
                            <Text style={styles.eventDetails} numberOfLines={1}>
                                {event.end != null && event.begin < time
                                    ? t('cards.calendar.ends') +
                                      formatFriendlyRelativeTime(event.end)
                                    : formatFriendlyRelativeTime(event.begin)}
                            </Text>
                        </View>
                        {mixedCalendar.length - 1 !== index && (
                            <Divider
                                color={theme.colors.border}
                                width={'100%'}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    calendarView: {
        gap: 8,
    },
    calenderFilled: {
        paddingTop: 12,
    },
    eventDetails: {
        color: theme.colors.labelColor,
        fontSize: 15,
    },
    eventTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
}))

export default CalendarCard
