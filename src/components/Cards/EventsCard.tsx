// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import NeulandAPI from '@/api/neuland-api'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { type CLEvents } from '@customTypes/neuland-api'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const EventsCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors

    const [events, setEvents] = useState<CLEvents[]>([])
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
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

        const newEvents = campusLifeEvents.map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
        setEvents(newEvents.slice(0, 2))
    }

    const styles = StyleSheet.create({
        calendarView: {
            gap: 12,
        },
        eventTitle: {
            color: colors.text,
            fontWeight: '500',
            fontSize: 16,
        },
        eventDetails: {
            color: colors.labelColor,
            fontSize: 15,
        },
    })

    return (
        <BaseCard
            title="Events"
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
                                        style={styles.eventTitle}
                                        numberOfLines={1}
                                    >
                                        {event.title}
                                    </Text>
                                    <Text
                                        style={styles.eventDetails}
                                        numberOfLines={1}
                                    >
                                        by {event.organizer}
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

export default EventsCard
