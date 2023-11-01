import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { type Calendar } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const CalendarCard = (): JSX.Element => {
    type Combined = Calendar | CardExams
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const time = new Date()
    const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
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
                name: `Prüfung ${x.name}`,
                begin: x.date,
            }))
        } catch (e) {
            if (e instanceof NoSessionError) {
                // router.replace('/login')
            } else if ((e as Error).message === 'Query not possible') {
                // ignore, leaving examList empty
            } else {
                console.error(e as Error)
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
            title="Calendar"
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
                                        ? event.name.en
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
                                        ? 'ends ' +
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
