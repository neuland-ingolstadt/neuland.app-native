import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import { FreeRoomsList } from '@/components/Elements/Map/FreeRoomsList'
import Divider from '@/components/Elements/Universal/Divider'
import Dropdown, {
    DropdownButton,
} from '@/components/Elements/Universal/Dropdown'
import { type Colors } from '@/stores/colors'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    type AvailableRoom,
    BUILDINGS,
    BUILDINGS_ALL,
    DURATION_PRESET,
    filterRooms,
    getNextValidDate,
} from '@/utils/room-utils'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

const DURATIONS = [
    '00:15',
    '00:30',
    '00:45',
    '01:00',
    '01:15',
    '01:30',
    '01:45',
    '02:00',
    '02:15',
    '02:30',
    '02:45',
    '03:00',
    '03:15',
    '03:30',
    '03:45',
    '04:00',
    '04:15',
    '04:30',
    '04:45',
    '05:00',
    '05:15',
    '05:30',
    '05:45',
    '06:00',
]

const ALL_BUILDINGS = [BUILDINGS_ALL, ...BUILDINGS]

export default function AdvancedSearch(): JSX.Element {
    const colors = useTheme().colors as Colors
    const router = useRouter()
    const startDate = getNextValidDate()
    const [building, setBuilding] = useState(BUILDINGS_ALL)
    const [date, setDate] = useState(formatISODate(startDate))
    const [time, setTime] = useState(formatISOTime(startDate))
    const [duration, setDuration] = useState(DURATION_PRESET)

    const [showDate, setShowDate] = useState(false)
    const [showTime, setShowTime] = useState(false)

    const [filterResults, setFilterResults] = useState<AvailableRoom[] | null>(
        null
    )

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }

    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const [error, setError] = useState<Error | null>(null)

    const filter = useCallback(async () => {
        // when entering dates on desktop, for a short time the date is invalid (e.g. 2023-07-00) when the user is still typing
        const validateDate = new Date(date)
        if (isNaN(validateDate.getTime())) {
            return
        }

        setFilterResults(null)
        const rooms = await filterRooms(date, time, building, duration)
        if (rooms == null) {
            throw new Error('Error while filtering rooms')
        } else {
            setFilterResults(rooms)
            setLoadingState(LoadingState.LOADED)
        }
    }, [building, date, duration, time])

    useEffect(() => {
        setLoadingState(LoadingState.LOADING)
        void loadData()
    }, [filter, router])

    const loadData = async (): Promise<void> => {
        try {
            await filter()
        } catch (e) {
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                router.replace('(user)/login')
            } else {
                setLoadingState(LoadingState.ERROR)
                setError(e as Error)
                console.error(e)
            }
        }
    }

    const onRefresh: () => void = () => {
        void loadData()
    }

    return (
        <>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    loadingState !== LoadingState.LOADED ? (
                        <RefreshControl
                            refreshing={
                                loadingState === LoadingState.REFRESHING
                            }
                            onRefresh={onRefresh}
                        />
                    ) : undefined
                }
            >
                <View>
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        Search options
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.card,
                            marginBottom: 15,
                            borderRadius: 10,
                        }}
                    >
                        <View
                            style={[
                                styles.optionsRow,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text style={{ fontSize: 15, color: colors.text }}>
                                Date
                            </Text>

                            <DropdownButton
                                onPress={() => {
                                    setShowDate(true)
                                }}
                            >
                                {date.split('-').reverse().join('.')}
                            </DropdownButton>

                            {showDate && (
                                <DateTimePicker
                                    value={new Date(date + 'T' + time)}
                                    mode="date"
                                    accentColor={colors.primary}
                                    locale="de-DE"
                                    onChange={(_event, selectedDate) => {
                                        setShowDate(false)
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
                        <Divider />
                        <View
                            style={[
                                styles.optionsRow,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text style={{ fontSize: 15, color: colors.text }}>
                                Time
                            </Text>

                            <DropdownButton
                                onPress={() => {
                                    setShowTime(true)
                                }}
                            >
                                {time}
                            </DropdownButton>

                            {showTime && (
                                <DateTimePicker
                                    value={new Date(date + 'T' + time)}
                                    mode="time"
                                    is24Hour={true}
                                    accentColor={colors.primary}
                                    locale="de-DE"
                                    minuteInterval={5}
                                    onChange={(_event, selectedDate) => {
                                        setShowTime(false)
                                        setTime(formatISOTime(selectedDate))
                                    }}
                                    minimumDate={
                                        new Date(
                                            new Date().setHours(8, 15, 0, 0)
                                        )
                                    }
                                    maximumDate={
                                        new Date(
                                            new Date().setHours(21, 25, 0, 0)
                                        )
                                    }
                                />
                            )}
                        </View>
                        <Divider />
                        <View
                            style={[
                                styles.optionsRow,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text style={{ fontSize: 15, color: colors.text }}>
                                Duration
                            </Text>
                            <Dropdown
                                data={DURATIONS}
                                defaultValue={DURATION_PRESET}
                                defaultText={DURATION_PRESET}
                                onSelect={setDuration}
                                selected={duration}
                            />
                        </View>
                        <Divider />
                        <View
                            style={[
                                styles.optionsRow,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text style={{ fontSize: 15, color: colors.text }}>
                                Building
                            </Text>
                            <Dropdown
                                data={ALL_BUILDINGS}
                                defaultValue={BUILDINGS_ALL}
                                defaultText={BUILDINGS_ALL}
                                onSelect={setBuilding}
                                selected={building}
                            />
                        </View>
                    </View>
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        Available free rooms
                    </Text>
                    <View
                        style={{
                            alignSelf: 'center',
                            backgroundColor: colors.card,
                            borderRadius: 8,
                            width: '100%',
                            marginBottom: 16,
                            justifyContent: 'center',
                        }}
                    >
                        {loadingState === LoadingState.LOADING && (
                            <ActivityIndicator
                                color={colors.primary}
                                style={{ paddingVertical: 30 }}
                            />
                        )}
                        {loadingState === LoadingState.ERROR && (
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 30,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.errorMessage,
                                        { color: colors.text },
                                    ]}
                                >
                                    {error?.message}
                                </Text>
                                <Text
                                    style={[
                                        styles.errorInfo,
                                        { color: colors.text },
                                    ]}
                                >
                                    An error occurred while loading the data.
                                    {'\n'}Pull down to refresh.
                                </Text>
                            </View>
                        )}
                        {loadingState === LoadingState.LOADED && (
                            <FreeRoomsList rooms={filterResults} />
                        )}
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        padding: 12,
    },
    sectionHeader: {
        fontSize: 13,

        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    errorMessage: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        padding: 10,
        marginHorizontal: 8,
        height: 50,
    },
})
