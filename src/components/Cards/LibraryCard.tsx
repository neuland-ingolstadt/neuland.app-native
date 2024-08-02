import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { FlowContext, UserKindContext } from '@/components/contexts'
import { type Reservation } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const LibraryCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const flow = useContext(FlowContext)
    const { userKind } = useContext(UserKindContext)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [reservations, setReservations] = useState<Reservation[]>([])

    useEffect(() => {
        if (userKind !== 'guest') {
            void loadData()
        }
    }, [userKind])

    async function loadData(): Promise<void> {
        try {
            const response = await API.getLibraryReservations()
            const firstTwoReservations = response.slice(0, 2).map((x) => {
                x.start = new Date(x.reservation_begin.replace(' ', 'T'))
                x.end = new Date(x.reservation_end.replace(' ', 'T'))
                return x
            })

            setReservations(firstTwoReservations)
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            if (e instanceof NoSessionError && flow.isOnboarded === true) {
                router.navigate('login')
            } else {
                // ignore
            }
        }
    }
    return (
        <BaseCard title="library" onPressRoute="library">
            {loadingState === LoadingState.LOADED && (
                <View
                    style={{
                        ...styles.calendarView,
                        ...(reservations.length > 0 && styles.cardsFilled),
                    }}
                >
                    {reservations.map((item, index) => (
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
                                        item.start,
                                        item.end
                                    )}
                                </Text>
                            </View>
                            {reservations.length - 1 !== index && (
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
