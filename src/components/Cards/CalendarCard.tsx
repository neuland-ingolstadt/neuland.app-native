import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { type Calendar } from '@customTypes/data'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

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
                router.replace('/login')
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
            <View
                style={{
                    flexDirection: 'row',
                }}
            >
                {loadingState === LoadingState.LOADED && (
                    <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {mixedCalendar.map((event, index) => (
                            <React.Fragment key={index}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        paddingBottom: 12,
                                        paddingTop: index === 0 ? 0 : 12,
                                        width: '90%',
                                    }}
                                >
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text
                                            style={{
                                                color: colors.text,
                                                fontWeight: '500',
                                                fontSize: 16,
                                            }}
                                            numberOfLines={2}
                                        >
                                            {typeof event.name === 'object'
                                                ? event.name.en
                                                : event.name}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.labelColor,
                                                fontSize: 15,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {event.end != null &&
                                            event.begin < time
                                                ? 'ends ' +
                                                  formatFriendlyRelativeTime(
                                                      event.end
                                                  )
                                                : formatFriendlyRelativeTime(
                                                      event.begin
                                                  )}
                                        </Text>
                                    </View>
                                </View>
                                {mixedCalendar.length - 1 !== index && (
                                    <Divider
                                        color={colors.border}
                                        position="center"
                                        width={'90%'}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </View>
        </BaseCard>
    )
}

export default CalendarCard
