import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import LibraryBookingRow from '@/components/Elements/Rows/LibraryBookingRow'
import LibraryReservationRow from '@/components/Elements/Rows/LibraryReservationRow'
import Divider from '@/components/Elements/Universal/Divider'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { queryClient } from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import { type AvailableLibrarySeats, type Reservation } from '@/types/thi-api'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { getFriendlyAvailableLibrarySeats } from '@/utils/library-utils'
import { useTheme } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    LayoutAnimation,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export default function LibraryCreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    const toggleRow = (value: string): void => {
        setExpandedRow(value === expandedRow ? null : value)
    }

    /**
     * Loads the reservations and available seats from the API.
     */
    async function loadAvailableSeats(): Promise<any> {
        const available = await getFriendlyAvailableLibrarySeats()
        const filteredAvailable = available.map((day) => {
            return {
                ...day,
                resource: day.resource.filter((timeSlot) => {
                    return !timeSlot.hasReservation
                }),
                reservationCount: 0,
            }
        })
        return filteredAvailable
    }

    async function loadLibraryReservations(): Promise<any> {
        const response = await API.getLibraryReservations()
        response.forEach((x) => {
            x.start = new Date(x.reservation_begin.replace(' ', 'T'))
            x.end = new Date(x.reservation_end.replace(' ', 'T'))
        })
        return response
    }

    async function loadLibraryData(): Promise<{
        reservations: Reservation[]
        available: AvailableLibrarySeats[]
    }> {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

        const [reservations, available] = await Promise.all([
            loadLibraryReservations(),
            loadAvailableSeats(),
        ])
        return { reservations, available }
    }

    const { data, error, isLoading, isPaused, isSuccess, refetch, isError } =
        useQuery({
            queryKey: ['library'],
            queryFn: loadLibraryData,
            gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
            retry(failureCount, error) {
                if (error instanceof NoSessionError) {
                    router.replace('user/login')
                    return false
                }
                return failureCount < 3
            },
        })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    const deleteReservationMutation = useMutation({
        mutationFn: async (id: string) => {
            await API.removeLibraryReservation(id)
        },
        onMutate: async (id: string) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['library'] })

            // Snapshot the previous value
            const previousReservations = queryClient.getQueryData(['library'])

            // Optimistically update to the new value
            queryClient.setQueryData(['library'], (old: any) => {
                const newReservations = old.reservations.filter(
                    (reservation: any) => reservation.reservation_id !== id
                )
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                )

                return { ...old, reservations: newReservations }
            })

            // Return the snapshotted value
            return { previousReservations }
        },
        onSettled: () => {
            void refetch()
        },
        onSuccess: () => {
            setExpandedRow(null)
        },
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('user/login')
                return false
            }
            return failureCount < 3
        },
    })

    const addReservationMutation = useMutation({
        mutationFn: async ({
            reservationRoom,
            reservationTime,
            reservationSeat,
        }: {
            reservationRoom: string
            reservationTime: { from: Date; to: Date }
            reservationSeat: string
        }) => {
            await API.addLibraryReservation(
                reservationRoom,
                reservationTime.from.toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                reservationTime.from.toLocaleTimeString('de-DE', {
                    timeStyle: 'short',
                }),
                reservationTime.to.toLocaleTimeString('de-DE', {
                    timeStyle: 'short',
                }),
                reservationSeat
            )
            toggleRow(reservationTime.from.toString())
        },
        onSettled: () => {
            void refetch()
        },
        onSuccess: () => {},
    })

    const addReservation = async (
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ): Promise<void> => {
        void addReservationMutation.mutateAsync({
            reservationRoom,
            reservationTime,
            reservationSeat,
        })
    }

    /**
     * Cancels a reservation.
     * @param {string} id Reservation ID
     */
    const deleteReservation = async (id: string): Promise<void> => {
        deleteReservationMutation.mutate(id)
    }

    return (
        <ScrollView
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                isSuccess ? (
                    <RefreshControl
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                ) : undefined
            }
        >
            <View>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {isError && (
                    <ErrorView
                        title={error.message}
                        onRefresh={refetchByUser}
                        refreshing={isRefetchingByUser}
                    />
                )}
                {isPaused && !isSuccess && (
                    <ErrorView
                        title={networkError}
                        onRefresh={refetchByUser}
                        refreshing={isRefetchingByUser}
                    />
                )}
                {isSuccess && data !== undefined && (
                    <>
                        {data.reservations.length > 0 && (
                            <SectionView
                                title={t('pages.library.reservations.title')}
                            >
                                <>
                                    {data.reservations?.map(
                                        (reservation, index) => (
                                            <React.Fragment key={index}>
                                                <LibraryReservationRow
                                                    reservation={reservation}
                                                    colors={colors}
                                                    deleteReservation={
                                                        deleteReservation
                                                    }
                                                />
                                                {index !==
                                                    data.reservations.length -
                                                        1 && (
                                                    <Divider
                                                        color={
                                                            colors.labelColor
                                                        }
                                                        iosPaddingLeft={16}
                                                    />
                                                )}
                                            </React.Fragment>
                                        )
                                    )}
                                </>
                            </SectionView>
                        )}

                        {data.available.length > 0 ? (
                            <>
                                {data.available?.map((day, i) => (
                                    <SectionView
                                        title={formatFriendlyDate(day.date, {
                                            weekday: 'long',
                                        })}
                                        key={i}
                                    >
                                        <View>
                                            {day.resource.length > 0 ? (
                                                day.resource.map((time, j) => {
                                                    return (
                                                        <React.Fragment
                                                            key={time.from.toString()}
                                                        >
                                                            <LibraryBookingRow
                                                                item={time}
                                                                colors={colors}
                                                                addReservation={
                                                                    addReservation
                                                                }
                                                                isExpanded={
                                                                    expandedRow ===
                                                                    time.from.toString()
                                                                }
                                                                onExpand={() => {
                                                                    toggleRow(
                                                                        time.from.toString()
                                                                    )
                                                                }}
                                                            />
                                                            {j !==
                                                                day.resource
                                                                    .length -
                                                                    1 && (
                                                                <Divider
                                                                    color={
                                                                        colors.labelColor
                                                                    }
                                                                    iosPaddingLeft={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                })
                                            ) : (
                                                <Text
                                                    style={{
                                                        ...styles.teaserText,
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {t(
                                                        'pages.library.available.noSeats'
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                    </SectionView>
                                ))}
                            </>
                        ) : (
                            <SectionView
                                title={t('pages.library.available.title')}
                            >
                                <Text
                                    style={{
                                        ...styles.teaserText,
                                        color: colors.text,
                                    }}
                                >
                                    {t('pages.library.available.ratelimit')}
                                </Text>
                            </SectionView>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    contentContainer: { paddingBottom: 32 },
    teaserText: {
        fontSize: 17,
        marginHorizontal: 10,
        textAlign: 'center',
        marginVertical: 30,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
