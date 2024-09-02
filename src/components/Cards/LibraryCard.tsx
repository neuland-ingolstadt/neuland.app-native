import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { type Reservation } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const LibraryCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userKind } = useContext(UserKindContext)

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
                router.replace('user/login')
                return false
            }
            return failureCount < 2
        },
    })

    return (
        <BaseCard title="library" onPressRoute="library">
            {isSuccess && data.length > 0 && (
                <View
                    style={{
                        ...styles.calendarView,
                        ...(data.length > 0 && styles.cardsFilled),
                    }}
                >
                    {data.slice(0, 2).map((item, index) => (
                        <React.Fragment key={index}>
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
                                    {item.rcategory}
                                </Text>
                                <Text
                                    style={[
                                        styles.eventDetails,
                                        { color: colors.labelColor },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {formatFriendlyDateTimeRange(
                                        new Date(item.start),
                                        new Date(item.end)
                                    )}
                                </Text>
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
    },
    cardsFilled: {
        paddingTop: 12,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    eventDetails: {
        fontSize: 15,
    },
})

export default LibraryCard
