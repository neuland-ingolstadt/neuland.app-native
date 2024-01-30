import NeulandAPI from '@/api/neuland-api'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type CLEvents } from '@/types/neuland-api'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const EventsCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('navigation')

    async function loadEvents(): Promise<CLEvents[]> {
        const campusLifeEvents =
            (await NeulandAPI.getCampusLifeEvents()) as CLEvents[]

        const newEvents = campusLifeEvents
            .map((x) => ({
                ...x,
                begin: x.begin !== null ? new Date(x.begin) : null,
                end: x.end !== null ? new Date(x.end) : null,
            }))
            .filter((x) => x.end === null || x.end > new Date())
            .slice(0, 5) // cache only 5 events
        return newEvents
    }

    const { data, isSuccess } = useQuery({
        queryKey: ['campusLifeEvents'],
        queryFn: loadEvents,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    })

    return (
        <BaseCard
            title="events"
            iosIcon="party.popper.fill"
            androidIcon="celebration"
            onPress={() => {
                router.push('events')
            }}
        >
            {isSuccess && (
                <View
                    style={{
                        ...styles.calendarView,
                        ...(data.length > 0 && styles.calendarFilled),
                    }}
                >
                    {data.slice(0, 2).map((event, index) => (
                        <React.Fragment key={index}>
                            <View>
                                <View>
                                    <Text
                                        style={[
                                            styles.eventTitle,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {event.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.eventDetails,
                                            { color: colors.labelColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {t('cards.events.by', {
                                            name: event.organizer,
                                        })}
                                    </Text>
                                </View>
                            </View>

                            {data.length - 1 !== index && (
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
        gap: 8,
        paddingTop: 12,
    },
    calendarFilled: {
        paddingTop: 10,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    eventDetails: {
        fontSize: 15,
    },
})

export default EventsCard
