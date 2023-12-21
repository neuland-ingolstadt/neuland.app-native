import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import LibraryBookingRow from '@/components/Elements/Rows/LibraryBookingRow'
import LibraryReservationRow from '@/components/Elements/Rows/LibraryReservationRow'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorGuestView from '@/components/Elements/Universal/ErrorPage'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type AvailableLibrarySeats, type Reservation } from '@/types/thi-api'
import { formatFriendlyDate } from '@/utils/date-utils'
import { getFriendlyAvailableLibrarySeats } from '@/utils/library-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export default function newsSCreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const [errorMsg, setErrorMsg] = useState('')
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [available, setAvailable] = useState<AvailableLibrarySeats[]>([])
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    const toggleRow = (value: string): void => {
        setExpandedRow(value === expandedRow ? null : value)
    }

    /**
     * Loads the reservations and available seats from the API.
     */
    async function loadData(): Promise<void> {
        try {
            const available = await getFriendlyAvailableLibrarySeats()
            const response = await API.getLibraryReservations()
            response.forEach((x) => {
                x.start = new Date(x.reservation_begin.replace(' ', 'T'))
                x.end = new Date(x.reservation_end.replace(' ', 'T'))
            })
            const filteredAvailable = available.map((day) => {
                return {
                    ...day,
                    resource: day.resource.filter((timeSlot) => {
                        return !response.some(() => timeSlot.hasReservation)
                    }),
                    reservationCount: 0,
                }
            })
            setAvailable(filteredAvailable)
            setReservations(response)
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                setErrorMsg(t('error.noSession'))
                router.push('(user)/login')
            } else {
                setErrorMsg(e.message)
                console.error(e)
            }
        }
    }

    /**
     * Creates a new reservation.
     * @param {string} reservationRoom Room ID
     * @param {object} reservationTime Reservation time
     * @param {string} reservationSeat Seat ID
     * @returns {Promise<void>}
     */
    async function addReservation(
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ): Promise<void> {
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
        await loadData()
    }

    /**
     * Cancels a reservation.
     * @param {string} id Reservation ID
     */
    async function deleteReservation(id: string): Promise<void> {
        await API.removeLibraryReservation(id)
        await loadData()
    }

    const onRefresh: () => void = () => {
        void loadData()
    }

    useEffect(() => {
        void loadData()
    }, [])

    return (
        <ScrollView
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                loadingState !== LoadingState.LOADING &&
                loadingState !== LoadingState.LOADED ? (
                    <RefreshControl
                        refreshing={loadingState === LoadingState.REFRESHING}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }
        >
            <View>
                {loadingState === LoadingState.LOADING && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {loadingState === LoadingState.ERROR && (
                    <ErrorGuestView
                        title={errorMsg}
                        onRefresh={onRefresh}
                        refreshing={false}
                    />
                )}
                {loadingState === LoadingState.LOADED && (
                    <>
                        {reservations.length > 0 && (
                            <SectionView
                                title={t('pages.library.reservations.title')}
                            >
                                <>
                                    {reservations?.map((reservation, index) => (
                                        <React.Fragment key={index}>
                                            <LibraryReservationRow
                                                reservation={reservation}
                                                colors={colors}
                                                deleteReservation={
                                                    deleteReservation
                                                }
                                            />
                                            {index !==
                                                reservations.length - 1 && (
                                                <Divider
                                                    color={colors.labelColor}
                                                    iosPaddingLeft={16}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </>
                            </SectionView>
                        )}

                        {available.length > 0 ? (
                            <>
                                {available?.map((day, i) => (
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
                                                                onToggle={() => {
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
                                                        'pages.library.available.noMoreSeats'
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
