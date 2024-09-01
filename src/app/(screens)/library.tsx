import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import LibraryBookinView from '@/components/Elements/Libraray/LibraryBookingView'
import LibraryReservationRow from '@/components/Elements/Libraray/LibraryReservationRow'
import LibrarySlotRow from '@/components/Elements/Libraray/LibrarySlotRow'
import {
    BottomSheetRootBackground,
    renderBackdrop,
} from '@/components/Elements/Universal/BottomSheetRootBackground'
import Divider from '@/components/Elements/Universal/Divider'
import Dropdown from '@/components/Elements/Universal/Dropdown'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { queryClient } from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import { type AvailableLibrarySeats, type Reservation } from '@/types/thi-api'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { getFriendlyAvailableLibrarySeats } from '@/utils/library-utils'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Button,
    LayoutAnimation,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Pressable, ScrollView } from 'react-native-gesture-handler'

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
                return failureCount < 2
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
            return failureCount < 2
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
        addReservationMutation
            .mutateAsync({
                reservationRoom,
                reservationTime,
                reservationSeat,
            })
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {
                bottomSheetModalRef.current?.dismiss()
            })
    }

    /**
     * Cancels a reservation.
     * @param {string} id Reservation ID
     */
    const deleteReservation = async (id: string): Promise<void> => {
        deleteReservationMutation.mutate(id)
    }
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null)
    const handlePresentModalPress = useCallback(() => {
        console.log('handlePresentModalPress')
        bottomSheetModalRef.current?.present()
    }, [])
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index)
    }, [])
    const snapPoints = useMemo(() => ['35%', '55%', '80%'], [])
    const [selectedItem, setSelectedItem] = useState<AvailableLibrarySeats>()
    return (
        <BottomSheetModalProvider>
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
                                    title={t(
                                        'pages.library.reservations.title'
                                    )}
                                >
                                    <>
                                        {data.reservations?.map(
                                            (reservation, index) => (
                                                <React.Fragment key={index}>
                                                    <LibraryReservationRow
                                                        reservation={
                                                            reservation
                                                        }
                                                        colors={colors}
                                                        deleteReservation={
                                                            deleteReservation
                                                        }
                                                    />
                                                    {index !==
                                                        data.reservations
                                                            .length -
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
                                            title={formatFriendlyDate(
                                                day.date,
                                                {
                                                    weekday: 'long',
                                                }
                                            )}
                                            key={i}
                                        >
                                            <View>
                                                {day.resource.length > 0 ? (
                                                    day.resource.map(
                                                        (time, j) => {
                                                            return (
                                                                <React.Fragment key={j}>
                                                                    <LibrarySlotRow
                                                                        item={
                                                                            time
                                                                        }
                                                                        colors={
                                                                            colors
                                                                        }
                                                                        onExpand={() => {
                                                                            setSelectedItem(
                                                                                time
                                                                            )

                                                                            handlePresentModalPress()
                                                                        }}
                                                                    />
                                                                    {j !==
                                                                        day
                                                                            .resource
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
                                                        }
                                                    )
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

            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundComponent={BottomSheetRootBackground}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{
                    backgroundColor: colors.labelSecondaryColor,
                }}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    <Text style={{ ...styles.text, color: colors.text }}>
                        Seat Reservation
                    </Text>
                    <LibraryBookinView
                        item={selectedItem}
                        colors={colors}
                        addReservation={addReservation}
                        onComplete={() => {
                            bottomSheetModalRef.current?.forceClose()
                        }}
                    />
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const styles = StyleSheet.create({
    contentContainer: { paddingBottom: 32, flex: 1 },
    sheetContainer: { flex: 1 },
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
    text: {
        fontSize: 23,
        fontWeight: 'bold',
        marginTop: 10,
        marginLeft: 10,
    },
})
