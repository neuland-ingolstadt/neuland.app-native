import NeulandAPI from '@/api/neuland-api'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type CLEvents } from '@/types/neuland-api'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const EventsCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('navigation')
    const [events, setEvents] = useState<CLEvents[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
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
        const campusLifeEvents =
            (await NeulandAPI.getCampusLifeEvents()) as CLEvents[]

        const newEvents = campusLifeEvents
            .map((x) => ({
                ...x,
                begin: x.begin !== null ? new Date(x.begin) : null,
                end: x.end !== null ? new Date(x.end) : null,
            }))
            .filter((x) => x.end === null || x.end > new Date())
        setEvents(newEvents.slice(0, 2))
    }

    return (
        <BaseCard
            title="events"
            icon="bonfire"
            onPress={() => {
                router.push('events')
            }}
        >
            {loadingState === LoadingState.LOADED && (
                <View style={styles.calendarView}>
                    {events.map((event, index) => (
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

                            {events.length - 1 !== index && (
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

export default EventsCard
