import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/ErrorView'
import LibraryBookingView from '@/components/Library/LibraryBookingView'
import LibraryReservationRow from '@/components/Library/LibraryReservationRow'
import LibrarySlotRow from '@/components/Library/LibrarySlotRow'
import {
    BottomSheetRootBackground,
    renderBackdrop,
} from '@/components/Universal/BottomSheetRootBackground'
import Divider from '@/components/Universal/Divider'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import SectionView from '@/components/Universal/SectionsView'
import { queryClient } from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import {
    type AvailableLibrarySeats,
    type AvailableRoomItem,
    type Reservation,
} from '@/types/thi-api'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { getFriendlyAvailableLibrarySeats } from '@/utils/library-utils'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, RefreshControl, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function LibrarySreen(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
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

    async function loadReservations(): Promise<Reservation[]> {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        return await loadLibraryReservations()
    }

    async function loadAvailableSeatsData(): Promise<AvailableLibrarySeats[]> {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        return await loadAvailableSeats()
    }
    const {
        data: reservationsData,
        error: reservationsError,
        isLoading: isLoadingReservations,
        isPaused: isPausedReservations,
        isSuccess: isSuccessReservations,
        refetch: refetchReservations,
        isError: isErrorReservations,
    } = useQuery({
        queryKey: ['libraryReservations'],
        queryFn: loadReservations,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours,
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('/login')
                return false
            }
            return failureCount < 2
        },
    })

    const {
        data: availableSeatsData,
        error: availableSeatsError,
        isLoading: isLoadingAvailableSeats,
        isPaused: isPausedAvailableSeats,
        isSuccess: isSuccessAvailableSeats,
        refetch: refetchAvailableSeats,
        isError: isErrorAvailableSeats,
    } = useQuery({
        queryKey: ['libraryAvailableSeats'],
        queryFn: loadAvailableSeatsData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours,
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('/login')
                return false
            }
            return failureCount < 2
        },
    })

    const isLoading = isLoadingReservations || isLoadingAvailableSeats
    const isPaused = isPausedReservations || isPausedAvailableSeats
    const isSuccess = isSuccessReservations && isSuccessAvailableSeats

    const {
        isRefetchingByUser: isRefetchingReservationsByUser,
        refetchByUser: refetchReservationsByUser,
    } = useRefreshByUser(refetchReservations)
    const {
        isRefetchingByUser: isRefetchingAvailableSeatsByUser,
        refetchByUser: refetchAvailableSeatsByUser,
    } = useRefreshByUser(refetchAvailableSeats)

    const deleteReservationMutation = useMutation({
        mutationFn: async (id: string) => {
            await API.removeLibraryReservation(id)
        },
        onMutate: async (id: string) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['library'] })

            // Snapshot the previous value
            const previousReservations = queryClient.getQueryData([
                'libraryReservations',
            ])

            // Optimistically update to the new value
            queryClient.setQueryData(['libraryReservations'], (old: any) => {
                const newReservations = old.filter(
                    (reservation: any) => reservation.reservation_id !== id
                )
                LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                )

                return newReservations
            })

            // Return the snapshotted value
            return { previousReservations }
        },
        onSettled: () => {
            void refetchAvailableSeats()
            void refetchReservations()
        },
        onError: () => {
            toast({
                title: t('pages.library.reservations.error.delete'),
                message: t('toast.tryAgain'),
                preset: 'error',
                duration: 3,
                from: 'top',
            })
        },
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('/login')
                return false
            }
            return failureCount < 1
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
            const from = new Date(reservationTime.from)
            const to = new Date(reservationTime.to)
            await API.addLibraryReservation(
                reservationRoom,
                from.toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                from.toLocaleTimeString('de-DE', {
                    timeStyle: 'short',
                }),
                to.toLocaleTimeString('de-DE', {
                    timeStyle: 'short',
                }),
                reservationSeat
            )
            toggleRow(reservationTime.from.toString())
        },
        onSettled: () => {
            void refetchAvailableSeats()
            void refetchReservations()
        },
        onError: () => {
            toast({
                title: t('pages.library.reservations.error.book'),
                message: t('toast.tryAgain'),
                preset: 'error',
                duration: 3,
                from: 'top',
            })
        },
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
            .then(() => {
                bottomSheetModalRef.current?.dismiss()
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
        bottomSheetModalRef.current?.present()
    }, [])

    const snapPoints = useMemo(() => ['35%', '55%', '80%'], [])
    const [selectedItem, setSelectedItem] = useState<AvailableRoomItem>()
    return (
        <BottomSheetModalProvider>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    isSuccess ? (
                        <RefreshControl
                            refreshing={
                                isRefetchingReservationsByUser ||
                                isRefetchingAvailableSeatsByUser
                            }
                            onRefresh={() => {
                                void refetchReservations()
                                void refetchAvailableSeats()
                            }}
                        />
                    ) : undefined
                }
            >
                <View>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <LoadingIndicator />
                        </View>
                    ) : isErrorReservations ? (
                        <ErrorView
                            title={reservationsError.message}
                            onRefresh={refetchReservationsByUser}
                            refreshing={isRefetchingReservationsByUser}
                        />
                    ) : isErrorAvailableSeats ? (
                        <ErrorView
                            title={availableSeatsError.message}
                            onRefresh={refetchAvailableSeatsByUser}
                            refreshing={isRefetchingAvailableSeatsByUser}
                        />
                    ) : isPaused && !isSuccess ? (
                        <ErrorView
                            title={networkError}
                            onRefresh={() => {
                                void refetchReservations()
                                void refetchAvailableSeats()
                            }}
                            refreshing={
                                isRefetchingReservationsByUser ||
                                isRefetchingAvailableSeatsByUser
                            }
                        />
                    ) : (
                        <>
                            {(reservationsData?.length ?? 0) > 0 && (
                                <SectionView
                                    title={t(
                                        'pages.library.reservations.title'
                                    )}
                                >
                                    <>
                                        {reservationsData?.map(
                                            (reservation, index) => (
                                                <React.Fragment key={index}>
                                                    <LibraryReservationRow
                                                        reservation={
                                                            reservation
                                                        }
                                                        deleteReservation={
                                                            deleteReservation
                                                        }
                                                    />
                                                    {index !==
                                                        reservationsData.length -
                                                            1 && (
                                                        <Divider
                                                            color={
                                                                theme.colors
                                                                    .labelColor
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

                            {(availableSeatsData?.length ?? 0) > 0 ? (
                                <>
                                    {availableSeatsData?.map((day, i) => (
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
                                                                <React.Fragment
                                                                    key={j}
                                                                >
                                                                    <LibrarySlotRow
                                                                        item={
                                                                            time
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
                                                                                theme
                                                                                    .colors
                                                                                    .labelColor
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
                                                        style={
                                                            styles.teaserText
                                                        }
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
                                    <Text style={styles.teaserText}>
                                        {t('pages.library.available.ratelimit')}
                                    </Text>
                                </SectionView>
                            )}
                        </>
                    )}
                </View>
                <View></View>
            </ScrollView>

            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                backgroundComponent={BottomSheetRootBackground}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.handleIndicatorStyle}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    <Text style={styles.text}>
                        {t('pages.library.available.seatReservation')}
                    </Text>
                    {selectedItem != null && (
                        <LibraryBookingView
                            item={selectedItem}
                            addReservation={addReservation}
                        />
                    )}
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: { paddingBottom: 32 },
    handleIndicatorStyle: {
        backgroundColor: theme.colors.labelSecondaryColor,
    },

    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    sheetContainer: { flex: 1 },
    teaserText: {
        color: theme.colors.text,
        fontSize: 17,
        marginHorizontal: 10,
        marginVertical: 30,
        textAlign: 'center',
    },
    text: {
        color: theme.colors.text,
        fontSize: 23,
        fontWeight: 'bold',
        marginLeft: 10,
        marginTop: 10,
    },
}))
