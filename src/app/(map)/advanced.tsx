import { NoSessionError } from '@/api/thi-session-handler'
import { FreeRoomsList } from '@/components/Elements/Map/FreeRoomsList'
import Divider from '@/components/Elements/Universal/Divider'
import Dropdown, {
    DropdownButton,
} from '@/components/Elements/Universal/Dropdown'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import { type Colors } from '@/components/colors'
import { type AvailableRoom } from '@/types/utils'
import { isKnownError } from '@/utils/api-utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
    BUILDINGS,
    BUILDINGS_ALL,
    DURATION_PRESET,
    filterRooms,
    getNextValidDate,
} from '@/utils/map-utils'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@react-navigation/native'
import { captureException } from '@sentry/react-native'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Platform,
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
    const { t } = useTranslation('common')

    const startDate = getNextValidDate()
    const [building, setBuilding] = useState(BUILDINGS_ALL)
    const [date, setDate] = useState(formatISODate(startDate))
    const [time, setTime] = useState(formatISOTime(startDate))
    const [duration, setDuration] = useState(DURATION_PRESET)

    const [showDate, setShowDate] = useState(Platform.OS === 'ios')
    const [showTime, setShowTime] = useState(Platform.OS === 'ios')

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
            if (e instanceof NoSessionError) {
                router.replace('(user)/login')
            } else {
                setLoadingState(LoadingState.ERROR)
                setError(e as Error)
                if (!isKnownError(e as Error)) {
                    captureException(e)
                }
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
                                defaultText={DURATION_PRESET}
                                onSelect={setDuration}
                                selected={duration}
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
                            {loadingState === LoadingState.LOADING && (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={styles.loadingIndicator}
                                />
                            )}
                            {loadingState === LoadingState.ERROR && (
                                <ErrorView
                                    title={error?.message ?? t('error.title')}
                                    onButtonPress={() => {
                                        onRefresh()
                                    }}
                                    inModal
                                />
                            )}
                            {loadingState === LoadingState.LOADED && (
                                <FreeRoomsList rooms={filterResults} />
                            )}
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
