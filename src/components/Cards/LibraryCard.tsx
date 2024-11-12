import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { type Reservation } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const LibraryCard = (): JSX.Element => {
    const { styles, theme } = useStyles(stylesheet)
    const { userKind } = useContext(UserKindContext)
    const router = useRouter()

    async function loadLibraryReservations(): Promise<Reservation[]> {
        const response = await API.getLibraryReservations()
        response.forEach((x) => {
            x.start = new Date(x.reservation_begin.replace(' ', 'T'))
            x.end = new Date(x.reservation_end.replace(' ', 'T'))
        })
        return response
    }

    const { data, isSuccess } = useQuery({
        queryKey: ['libraryReservations'],
        queryFn: loadLibraryReservations,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours,
        enabled: userKind !== USER_GUEST,
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('login')
                return false
            }
            return failureCount < 2
        },
    })

    return (
        <BaseCard title="library" onPressRoute="library">
            {isSuccess && data.length > 0 && (
                <View
                    style={[
                        styles.calendarView,
                        data.length > 0 && styles.cardsFilled,
                    ]}
                >
                    {data.slice(0, 2).map((item, index) => (
                        <React.Fragment key={index}>
                            <View>
                                <Text
                                    style={styles.eventTitle}
                                    numberOfLines={1}
                                >
                                    {item.rcategory}
                                </Text>
                                <Text
                                    style={styles.eventDetails}
                                    numberOfLines={1}
                                >
                                    {formatFriendlyDateTimeRange(
                                        new Date(item.start),
                                        new Date(item.end)
                                    )}
                                </Text>
                            </View>
                            {data.length - 1 !== index && (
                                <Divider
                                    color={theme.colors.border}
                                    width={'100%'}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    calendarView: { gap: 8 },
    cardsFilled: { paddingTop: 12 },
    eventDetails: { color: theme.colors.labelColor, fontSize: 15 },
    eventTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '500' },
}))

export default LibraryCard
