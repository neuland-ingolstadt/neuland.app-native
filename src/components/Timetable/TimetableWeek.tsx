import { TimetableMode, usePreferencesStore } from '@/hooks/usePreferencesStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type ITimetableViewProps } from '@/types/timetable'
import { Exam, type FriendlyTimetableEntry } from '@/types/utils'
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
import { HeaderRight } from './HeaderButtons'
import { MyMenu } from './Menu'
import EventComponent from './WeekEventComponent'

const timetableNumberDaysMap = {
    [TimetableMode.List]: 1,
    [TimetableMode.Timeline1]: 1,
    [TimetableMode.Timeline3]: 3,
    [TimetableMode.Timeline5]: 5,
}

export default function TimetableWeek({
    timetable,
    exams,
}: ITimetableViewProps): React.JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const today = moment().startOf('day').toDate()
    const firstElementeDate = new Date(
        timetable.find(
            (entry: FriendlyTimetableEntry) =>
                moment(entry.startDate).startOf('day').toDate() >= today
        )?.startDate ?? today
    )
    const calendarRef = useRef<CalendarKitHandle>(null)
    const setSelectedLecture = useRouteParamsStore(
        (state) => state.setSelectedLecture
    )
    const setSelectedExam = useRouteParamsStore(
        (state) => state.setSelectedExam
    )
    const [events, setEvents] = React.useState<PackedEvent[]>([])
    const [calendarLoaded, setCalendarLoaded] = React.useState(false)
    const [currentDate, setCurrentDate] = React.useState(firstElementeDate)
    const isDark = UnistylesRuntime.themeName === 'dark'
    const router = useRouter()
    const navigation = useNavigation()
    const timetableMode = usePreferencesStore((state) => state.timetableMode)

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
        } else if (entry.eventType === 'exam') {
            setSelectedExam(entry as unknown as Exam)
            router.navigate('/exam')
        }
    }

    useEffect(() => {
        if (timetable.length > 0) {
            const friendlyTimetable = timetable.map(
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
            const friendlyExams = exams.map((entry, index) => {
                const duration = Number(entry?.type?.match(/\d+/)?.[0] ?? 90)
                return {
                    ...entry,
                    eventType: 'exam',
                    id: index.toString(),
                    start: {
                        dateTime: entry.date,
                    },
                    end: {
                        dateTime: moment(entry.date)
                            .add(duration, 'minutes')
                            .toDate(),
                    },
                }
            })
            setEvents([
                ...friendlyTimetable,
                ...friendlyExams,
            ] as unknown as PackedEvent[])
        }
    }, [timetable, exams])

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
                    <MyMenu />
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

    const [timetableNumberDays, setTimetableNumberDays] = React.useState(
        timetableNumberDaysMap[timetableMode]
    )
    useEffect(() => {
        if (calendarLoaded) {
            setTimetableNumberDays(timetableNumberDaysMap[timetableMode])
            calendarRef.current?.setVisibleDate(currentDate.toISOString())
        }
    }, [timetableMode])
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
                start={420}
                end={1320}
                ref={calendarRef}
                numberOfDays={timetableNumberDays}
                events={events}
                theme={calendarTheme}
                onPressEvent={(event) => {
                    showEventDetails(event)
                }}
                onDateChanged={(date) => {
                    setCurrentDate(new Date(date))
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

const stylesheet = createStyleSheet(() => ({
    buttons: {
        flexDirection: 'row',
        gap: 4,
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
