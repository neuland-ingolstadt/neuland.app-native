import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import { FreeRoomsList } from '@/components/Elements/Map/FreeRoomsList'
import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { type AvailableRoom } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    BUILDINGS,
    BUILDINGS_ALL,
    DURATION_PRESET,
    filterRooms,
    getNextValidDate,
} from '@/utils/map-utils'
import { LoadingState } from '@/utils/ui-utils'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Picker, useBinding } from 'swiftui-react-native'

const DURATIONS = [
    '00:15',
    '00:30',
    '00:45',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
]

const ALL_BUILDINGS = [BUILDINGS_ALL, ...BUILDINGS]

export default function AdvancedSearch(): JSX.Element {
    const colors = useTheme().colors as Colors
    const router = useRouter()
    const { t } = useTranslation('common')

    const { startDate, wasModified } = getNextValidDate()
    const building = useBinding(BUILDINGS_ALL)
    const [date, setDate] = useState(formatISODate(startDate))

    const [time, setTime] = useState(formatISOTime(startDate))

    /**
     * Checks if the provided date and time are equal to the start date.
     *
     * This function compares the hours and minutes from a time string in the format "HH:MM",
     * and a date string in the format "YYYY-MM-DD" against a global `startDate` object of type Date.
     * It returns true if the hours and minutes of `startDate` match the provided time,
     * and the date part of `startDate` matches the provided date string.
     *
     * @returns {boolean} True if the date and time match the start date, false otherwise.
     */
    const isDateAndTimeEqualToStart = (): boolean => {
        return (
            startDate.getHours() === parseInt(time.split(':')[0], 10) &&
            startDate.getMinutes() === parseInt(time.split(':')[1], 10) &&
            startDate.toISOString().split('T')[0] === date
        )
    }

    const duration = useBinding(DURATION_PRESET)

    const [filterState, setFilterState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const { data, error, isLoading, isError, isPaused, refetch } = useQuery({
        queryKey: ['freeRooms', date],
        queryFn: async () =>
            await API.getFreeRooms(new Date(date + 'T' + time)),
        staleTime: 1000 * 60 * 60, // 60 minutes
        gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('user/login')
                return false
            }
            return failureCount < 2
        },
    })
    const [rooms, setRooms] = useState<AvailableRoom[] | null>(null)

    useEffect(() => {
        const fetchRooms = async (): Promise<void> => {
            try {
                const validateDate = new Date(date)
                if (isNaN(validateDate.getTime())) {
                    throw new Error('Invalid date')
                }
                if (data === undefined) {
                    return
                }

                const rooms = await filterRooms(
                    data,
                    date,
                    time,
                    building.value,
                    duration.value
                )
                if (rooms == null) {
                    throw new Error('Error while filtering rooms')
                } else {
                    setRooms(rooms)
                    setFilterState(LoadingState.LOADED)
                }
            } catch (error) {
                setFilterState(LoadingState.ERROR)
                console.error(error)
            }
        }

        setFilterState(LoadingState.LOADING)
        setTimeout(() => {
            void fetchRooms()
        })
    }, [date, time, building.value, duration.value, data])

    const { refetchByUser } = useRefreshByUser(refetch)

    return (
        <>
            <ScrollView style={styles.scrollView}>
                <View>
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {t('pages.rooms.options.title')}
                    </Text>
                    <View
                        style={[
                            styles.section,
                            {
                                backgroundColor: colors.card,
                            },
                        ]}
                    >
                        <View style={styles.optionsRow}>
                            <Text
                                style={[
                                    styles.optionTitle,
                                    { color: colors.text },
                                ]}
                            >
                                {t('pages.rooms.options.date')}
                            </Text>

                            <DateTimePicker
                                value={new Date(date + 'T' + time)}
                                mode="date"
                                accentColor={colors.primary}
                                locale="de-DE"
                                onChange={(_event, selectedDate) => {
                                    setDate(formatISODate(selectedDate))
                                }}
                                minimumDate={new Date()}
                                maximumDate={
                                    new Date(
                                        new Date().setDate(
                                            new Date().getDate() + 90
                                        )
                                    )
                                }
                            />
                        </View>

                        <Divider iosPaddingLeft={16} />
                        <View style={styles.optionsRow}>
                            <Text
                                style={[
                                    styles.optionTitle,
                                    { color: colors.text },
                                ]}
                            >
                                {t('pages.rooms.options.time')}
                            </Text>

                            <DateTimePicker
                                value={new Date(date + 'T' + time)}
                                mode="time"
                                is24Hour={true}
                                accentColor={colors.primary}
                                locale="de-DE"
                                minuteInterval={5}
                                onChange={(_event, selectedDate) => {
                                    setTime(formatISOTime(selectedDate))
                                }}
                            />
                        </View>
                        <Divider iosPaddingLeft={16} />
                        <View style={styles.optionsRow}>
                            <Text
                                style={[
                                    styles.optionTitle,
                                    { color: colors.text },
                                ]}
                            >
                                {t('pages.rooms.options.duration')}
                            </Text>

                            <Picker
                                selection={duration}
                                pickerStyle="menu"
                                tint={colors.primary}
                                offset={{ x: 15, y: 0 }}
                            >
                                {DURATIONS.map((option) => (
                                    <Text key={option}>{option}</Text>
                                ))}
                            </Picker>
                        </View>
                        <Divider iosPaddingLeft={16} />
                        <View style={styles.optionsRow}>
                            <Text
                                style={[
                                    styles.optionTitle,
                                    { color: colors.text },
                                ]}
                            >
                                {t('pages.rooms.options.building')}
                            </Text>

                            <Picker
                                selection={building}
                                pickerStyle="menu"
                                tint={colors.primary}
                                offset={{ x: 20, y: 0 }}
                            >
                                {ALL_BUILDINGS.map((option) => (
                                    <Text key={option}>{option}</Text>
                                ))}
                            </Picker>
                        </View>
                    </View>
                    {wasModified && isDateAndTimeEqualToStart() && (
                        <View
                            style={{
                                ...styles.section,
                                backgroundColor: colors.card,
                            }}
                        >
                            <View style={styles.adjustContainer}>
                                <PlatformIcon
                                    ios={{
                                        name: 'sparkles',
                                        size: 18,
                                    }}
                                    android={{
                                        name: 'update',
                                        size: 20,
                                    }}
                                    color={colors.primary}
                                />
                                <Text
                                    style={{
                                        color: colors.primary,
                                        ...styles.adjustedTitle,
                                    }}
                                >
                                    {t('pages.rooms.modified.title')}
                                </Text>
                            </View>

                            <Text
                                style={{
                                    color: colors.text,
                                    ...styles.adjustText,
                                }}
                            >
                                {t('pages.rooms.modified.description', {
                                    date,
                                    time,
                                })}
                            </Text>
                        </View>
                    )}
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {t('pages.rooms.results')}
                    </Text>
                    <View style={styles.sectionContainer}>
                        <View
                            style={[
                                styles.section,
                                {
                                    backgroundColor: colors.card,
                                },
                            ]}
                        >
                            {filterState === LoadingState.LOADING ||
                            isLoading ? (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={styles.loadingIndicator}
                                />
                            ) : isPaused ? (
                                <ErrorView
                                    title={networkError}
                                    onButtonPress={() => {
                                        void refetchByUser()
                                    }}
                                    inModal
                                />
                            ) : isError ||
                              filterState === LoadingState.ERROR ? (
                                <ErrorView
                                    title={error?.message ?? t('error.title')}
                                    onButtonPress={() => {
                                        void refetchByUser()
                                    }}
                                    inModal
                                />
                            ) : filterState === LoadingState.LOADED ? (
                                <FreeRoomsList rooms={rooms} />
                            ) : null}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        paddingBottom: 20,
    },
    scrollView: {
        padding: 12,
    },
    sectionHeader: {
        fontSize: 13,

        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    optionTitle: {
        fontSize: 15,
    },
    section: {
        marginBottom: 16,
        borderRadius: 8,
    },
    loadingIndicator: {
        paddingVertical: 30,
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',

        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 6,
    },
    adjustContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        gap: 5,
    },
    adjustedTitle: {
        fontSize: 16,
        marginLeft: 5,
        fontWeight: '500',
    },
    adjustText: {
        padding: 10,
        fontSize: 15,
    },
})
