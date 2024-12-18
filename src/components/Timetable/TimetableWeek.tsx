import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type ITimetableViewProps } from '@/types/timetable'
import { type FriendlyTimetableEntry } from '@/types/utils'
import {
    CalendarBody,
    CalendarContainer,
    CalendarHeader,
    type CalendarKitHandle,
    type OnEventResponse,
    type PackedEvent,
} from '@howljs/calendar-kit'
import { useNavigation, useRouter } from 'expo-router'
import moment from 'moment-timezone'
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { HeaderLeft, HeaderRight } from './HeaderButtons'
import EventComponent from './WeekEventComponent'

export default function TimetableWeek({
    timetable,
}: ITimetableViewProps): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const today = moment().startOf('day').toDate()
    const firstElementeDate = timetable.find(
        (entry: FriendlyTimetableEntry) =>
            moment(entry.startDate).startOf('day').toDate() >= today
    )?.startDate
    const calendarRef = useRef<CalendarKitHandle>(null)
    const setSelectedLecture = useRouteParamsStore(
        (state) => state.setSelectedLecture
    )
    const [events, setEvents] = React.useState<PackedEvent[]>([])
    const [calendarLoaded, setCalendarLoaded] = React.useState(false)
    const isDark = UnistylesRuntime.themeName === 'dark'
    const router = useRouter()
    const navigation = useNavigation()

    const calendarTheme = {
        colors: {
            primary: theme.colors.notification,
            onPrimary: theme.colors.contrast,
            background: theme.colors.background,
            onBackground: theme.colors.text,
            border: theme.colors.border,
            text: theme.colors.text,
            surface: theme.colors.labelBackground,
        },
    }

    function showEventDetails(entry: OnEventResponse): void {
        if (entry.eventType === 'lecture') {
            setSelectedLecture(entry as unknown as FriendlyTimetableEntry)
            router.navigate('/lecture')
        }
    }

    useEffect(() => {
        if (timetable.length > 0) {
            const friendlyTimetableWithColor = timetable.map(
                (entry: FriendlyTimetableEntry, index: number) => ({
                    ...entry,
                    eventType: 'lecture',
                    id: index.toString(),
                    start: {
                        dateTime: entry.startDate,
                    },
                    end: {
                        dateTime: entry.endDate,
                    },
                })
            )
            setEvents(friendlyTimetableWithColor as unknown as PackedEvent[])
        }
    }, [timetable])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderRight
                    setToday={() => {
                        const calDate = calendarRef.current?.getVisibleStart()
                        if (calDate != null) {
                            const momentCalDate = moment(calDate).startOf('day')
                            const momentToday = moment().startOf('day')
                            const targetDate = momentCalDate.isSame(momentToday)
                                ? (firstElementeDate ?? new Date())
                                : new Date()
                            calendarRef.current?.goToDate({ date: targetDate })
                        }
                    }}
                />
            ),
            headerLeft: () => (
                <View style={styles.buttons}>
                    <HeaderLeft />
                    {Platform.OS === 'web' && (
                        <View style={styles.buttons}>
                            <Pressable
                                onPress={() => {
                                    onPressPrevious()
                                }}
                            >
                                <PlatformIcon
                                    web={{
                                        name: 'ChevronLeft',
                                        size: 24,
                                    }}
                                    android={{
                                        name: 'chevron_right',
                                        size: 24,
                                    }}
                                    ios={{
                                        name: 'chevron-left',
                                        size: 24,
                                    }}
                                    style={{ color: theme.colors.text }}
                                />
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    onPressNext()
                                }}
                            >
                                <PlatformIcon
                                    web={{
                                        name: 'ChevronRight',
                                        size: 24,
                                    }}
                                    android={{
                                        name: 'chevron_right',
                                        size: 24,
                                    }}
                                    ios={{
                                        name: 'chevron-right',
                                        size: 24,
                                    }}
                                    style={{ color: theme.colors.text }}
                                />
                            </Pressable>
                        </View>
                    )}
                </View>
            ),
        })
    }, [navigation])

    const renderEvent = useCallback(
        (event: PackedEvent) => {
            return (
                <EventComponent event={event} theme={theme} isDark={isDark} />
            )
        },
        [theme.colors.primary, events]
    )

    const onPressPrevious = (): void => {
        calendarRef.current?.goToPrevPage()
    }

    const onPressNext = (): void => {
        calendarRef.current?.goToNextPage()
    }

    return (
        <View style={styles.page}>
            {!calendarLoaded && (
                <View style={styles.loadingContainer}>
                    <LoadingIndicator />
                </View>
            )}
            <CalendarContainer
                onLoad={() => {
                    setCalendarLoaded(true)
                }}
                allowPinchToZoom
                start={450}
                end={1290}
                ref={calendarRef}
                numberOfDays={3}
                events={events}
                theme={calendarTheme}
                onPressEvent={(event) => {
                    showEventDetails(event)
                }}
                initialDate={firstElementeDate ?? today}
                onPressDayNumber={(date) => {
                    calendarRef.current?.goToDate({ date })
                }}
                showWeekNumber
                rightEdgeSpacing={4}
                overlapEventsSpacing={1}
                minTimeIntervalHeight={55}
                scrollToNow={false}
            >
                <CalendarHeader />
                <CalendarBody renderEvent={renderEvent} />
            </CalendarContainer>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    buttons: {
        flexDirection: 'row',
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        zIndex: 1,
    },
    page: {
        flex: 1,
    },
}))
