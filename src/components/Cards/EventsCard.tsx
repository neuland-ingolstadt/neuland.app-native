import Divider from '@/components/Universal/Divider'
import { loadCampusLifeEvents } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const EventsCard = (): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')

    const { data, isSuccess } = useQuery({
        queryKey: ['campusLifeEvents'],
        queryFn: loadCampusLifeEvents,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    })

    return (
        <BaseCard title="events" onPressRoute="clEvents">
            {Boolean(isSuccess) && data !== undefined && (
                <View
                    style={[
                        styles.calendarView,
                        data.length > 0 && styles.calendarFilled,
                    ]}
                >
                    {data.slice(0, 2).map((event, index, slicedData) => (
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
                                        {t('cards.events.by', {
                                            name: event.organizer,
                                        })}
                                    </Text>
                                </View>
                            </View>

                            {slicedData.length - 1 !== index && (
                                <Divider width={'100%'} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    calendarFilled: {
        paddingTop: 10,
    },
    calendarView: {
        gap: 8,
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

export default EventsCard
