import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import { FreeRoomsList } from '@/components/Elements/Map/FreeRoomsList'
import Divider from '@/components/Elements/Universal/Divider'
import Dropdown, {
    DropdownButton,
} from '@/components/Elements/Universal/Dropdown'
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
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

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

    const startDate = getNextValidDate()
    const [building, setBuilding] = useState(BUILDINGS_ALL)
    const [date, setDate] = useState(formatISODate(startDate.startDate))
    const [time, setTime] = useState(formatISOTime(startDate.startDate))
    const [duration, setDuration] = useState(DURATION_PRESET)

    const [showDate, setShowDate] = useState(Platform.OS === 'ios')
    const [showTime, setShowTime] = useState(Platform.OS === 'ios')
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
                    building,
                    duration
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
    }, [date, time, building, duration, data])

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

                            {Platform.OS === 'android' && (
                                <DropdownButton
                                    onPress={() => {
                                        setShowDate(true)
                                    }}
                                >
                                    {date.split('-').reverse().join('.')}
                                </DropdownButton>
                            )}

                            {showDate && (
                                <DateTimePicker
                                    value={new Date(date + 'T' + time)}
                                    mode="date"
                                    accentColor={colors.primary}
                                    locale="de-DE"
                                    onChange={(_event, selectedDate) => {
                                        setShowDate(Platform.OS !== 'android')
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
                            )}
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

                            {Platform.OS === 'android' && (
                                <DropdownButton
                                    onPress={() => {
                                        setShowTime(true)
                                    }}
                                >
                                    {time}
                                </DropdownButton>
                            )}

                            {showTime && (
                                <DateTimePicker
                                    value={new Date(date + 'T' + time)}
                                    mode="time"
                                    is24Hour={true}
                                    accentColor={colors.primary}
                                    locale="de-DE"
                                    minuteInterval={5}
                                    onChange={(_event, selectedDate) => {
                                        setShowTime(Platform.OS !== 'android')
                                        setTime(formatISOTime(selectedDate))
                                    }}
                                />
                            )}
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
                            <Dropdown
                                data={DURATIONS}
                                defaultValue={DURATION_PRESET}
                                onSelect={setDuration}
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
                                {t('pages.rooms.options.building')}
                            </Text>
                            <Dropdown
                                data={ALL_BUILDINGS}
                                defaultValue={BUILDINGS_ALL}
                                onSelect={setBuilding}
                            />
                        </View>
                    </View>
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
})
