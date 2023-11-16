import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import LibraryBookingRow from '@/components/Elements/Pages/LibraryBookingRow'
import LibraryReservationRow from '@/components/Elements/Pages/LibraryReservationRow'
import Divider from '@/components/Elements/Universal/Divider'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type AvailableLibrarySeats, type Reservation } from '@/types/thi-api'
import { formatFriendlyDate } from '@/utils/date-utils'
import { getFriendlyAvailableLibrarySeats } from '@/utils/library-utils'
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

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [available, setAvailable] = useState<AvailableLibrarySeats[]>([])

    /**
     * Loads all news from the API and sets the state accordingly.
     * @returns {Promise<void>} A promise that resolves when all news have been loaded.
     */
    /**
     * Fetches and displays the reservation data.
     */
    async function loadData(): Promise<void> {
        try {
            const available = await getFriendlyAvailableLibrarySeats()
            const response = await API.getLibraryReservations()
            response.forEach((x) => {
                x.start = new Date(x.reservation_begin.replace(' ', 'T'))
                x.end = new Date(x.reservation_end.replace(' ', 'T'))
            })
            console.log(JSON.stringify(available))
            const filteredAvailable = available.map((day) => {
                return {
                    ...day,
                    resource: day.resource.filter((timeSlot) => {
                        return !response.some(
                            (reservation) => timeSlot.hasReservation
                        )
                    }),
                    reservationCount: 0, // Add this line
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
                router.push('(user)/login')
            } else {
                setErrorMsg(e.message)
                console.error(e)
            }
        }
    }

    useEffect(() => {
        void loadData()
    }, [])

    const onRefresh: () => void = () => {
        void loadData()
    }

    /**
     * Cancels a reservation.
     * @param {string} id Reservation ID
     */
    async function deleteReservation(id: string): Promise<void> {
        await API.removeLibraryReservation(id)
        await loadData()
    }

    /**
     * Creates a new reservation.
     */
    async function addReservation(
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ): Promise<void> {
        await API.addLibraryReservation(
            reservationRoom,
            // bring the date into the correct format using reservationTime.from
            reservationTime.from.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
            // this needs to be de-DE regardless of the users locale
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

    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    const toggleRow = (value: string): void => {
        setExpandedRow(value === expandedRow ? null : value)
    }

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
                    <View>
                        <Text
                            style={[
                                styles.errorMessage,
                                { color: colors.text },
                            ]}
                        >
                            {errorMsg}
                        </Text>
                        <Text
                            style={[styles.errorInfo, { color: colors.text }]}
                        >
                            {t('error.refreshPull')}{' '}
                        </Text>
                    </View>
                )}
                {loadingState === LoadingState.LOADED && (
                    <>
                        {reservations.length > 0 && (
                            <SectionView
                                title={t('pages.library.reservations.title')}
                            >
                                <React.Fragment>
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
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            </SectionView>
                        )}

                        {available.length > 0 ? (
                            <React.Fragment>
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
                            </React.Fragment>
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
    labelText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        objectFit: 'cover',
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    teaserText: {
        fontSize: 17,
        marginHorizontal: 10,
        textAlign: 'center',
        marginVertical: 30,
    },
    errorMessage: {
        paddingTop: 100,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    titleText: {
        width: '94%',
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'left',
    },
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        marginTop: 2,
        justifyContent: 'center',
    },
})
