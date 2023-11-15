import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { FlowContext } from '@/components/provider'
import { type LanguageKey } from '@/localization/i18n'
import { type Calendar } from '@/types/data'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const CalendarCard = (): JSX.Element => {
    type Combined = Calendar | CardExams
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const time = new Date()
    const { i18n, t } = useTranslation('navigation')
    const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
    const flow = useContext(FlowContext)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)

    interface CardExams {
        name: string
        begin: Date
        end?: Date
    }
    useEffect(() => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setLoadingState(LoadingState.ERROR)
            })
    }, [])

    async function loadEvents(): Promise<void> {
        let exams: CardExams[] = []
        try {
            exams = (await loadExamList()).map((x) => ({
                name: t('cards.calendar.exam', { name: x.name }),
                begin: x.date,
            }))
        } catch (e) {
            if (e instanceof NoSessionError) {
                if (flow.isOnboarded === true) {
                    router.push('(user)/login')
                }
            } else if ((e as Error).message === 'Query not possible') {
                // ignore, leaving examList empty
            } else {
                console.log(e as Error)
            }
        }

        const combined = [...calendar, ...exams]
            .sort((a, b) => a.begin.getTime() - b.begin.getTime())
            .filter(
                (x) => x.begin > time || (x.end ?? '-1') > time
            ) as Combined[]
        setMixedCalendar(combined.slice(0, 2))
    }

    return (
        <BaseCard
            title="calendar"
            icon="calendar"
            onPress={() => {
                router.push('calendar')
            }}
        >
            {loadingState === LoadingState.LOADED && (
                <View style={styles.calendarView}>
                    {mixedCalendar.map((event, index) => (
                        <React.Fragment key={index}>
                            <View>
                                <Text
                                    style={[
                                        styles.eventTitle,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {/* Always use .de or .en? */}
                                    {typeof event.name === 'object'
                                        ? event.name[
                                              i18n.language as LanguageKey
                                          ]
                                        : event.name}
                                </Text>
                                <Text
                                    style={[
                                        styles.eventDetails,
                                        { color: colors.labelColor },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {event.end != null && event.begin < time
                                        ? t('cards.calendar.ends') +
                                          formatFriendlyRelativeTime(event.end)
                                        : formatFriendlyRelativeTime(
                                              event.begin
                                          )}
                                </Text>
                            </View>

                            {mixedCalendar.length - 1 !== index && (
                                <Divider color={colors.border} width={'100%'} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    calendarView: {
        gap: 12,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    eventDetails: {
        fontSize: 15,
    },
})

export default CalendarCard
