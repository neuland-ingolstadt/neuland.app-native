import { ErrorPage } from '@/components/Elements/Universal/ErrorPage'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { type LanguageKey } from '@/localization/i18n'
import { type Calendar as CalendarType } from '@/types/data'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { calendar } from '@/utils/calendar-utils'
import { ignoreTime } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import dayjs from 'dayjs'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    Calendar,
    type CalendarTouchableOpacityProps,
    HOUR_GUIDE_WIDTH,
    type HeaderRenderer,
    type ICalendarEventBase,
    type Mode,
} from 'react-native-big-calendar'

const HOUR_WIDTH = HOUR_GUIDE_WIDTH + 1
const MARGIN = 4

interface CalendarEvent extends ICalendarEventBase {
    textColor: string
    color: string
    location?: string
    entry?: FriendlyTimetableEntry
}

export default function TimetableScreen(): JSX.Element {
    const router = useRouter()

    const { t, i18n } = useTranslation(['navigation', 'timetable'])

    const [calendarTheme, setCalendarTheme] = useState<Record<string, any>>({})
    const [calendarDate, setCalendarDate] = useState<Date>(new Date())
    const [mode] = useState<Mode>('3days')

    const today = new Date()

    const theme = useTheme()
    const colors = theme.colors as Colors

    const textColor = Color(colors.text)
    const primaryColor = Color(colors.primary)

    const timetableTextColor =
        textColor.contrast(primaryColor) > 5 ? textColor : textColor.negate()

    const calendarColor = Color(colors.primary).rotate(-100)
    const calendarTextColor =
        textColor.contrast(calendarColor) > 5 ? textColor : textColor.negate()

    const [rawTimetable, setRawTimetable] = useState<FriendlyTimetableEntry[]>(
        []
    )
    const [timetable, setTimetable] = useState<CalendarEvent[]>([])

    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)

    async function load(): Promise<void> {
        try {
            const timetable = await getFriendlyTimetable(today, true)
            setRawTimetable(timetable)
            setLoadingState(LoadingState.LOADED)
        } catch (e) {
            setLoadingState(LoadingState.ERROR)
            console.log(e)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    useEffect(() => {
        function fillTimetable(): void {
            const timetableEntries = timetableToWeekViewEvents(rawTimetable)

            // university calendar
            const calendarEntries = calendarToWeekViewEvents(calendar)

            // combine all events
            const allEvents = [...timetableEntries, ...calendarEntries]

            /**
             * TODO:
             * - Exams
             * - Holidays (not just the ones from the university calendar)
             * - Maybe Events from student clubs
             */

            setTimetable(allEvents)
        }

        fillTimetable()
    }, [rawTimetable, colors])

    useEffect(() => {
        const theme = {
            palette: {
                nowIndicator: colors.labelColor,
                primary: {
                    main: colors.primary,
                    contrastText: colors.text,
                },
                gray: {
                    '200': colors.border, // grid line color
                    '500': colors.labelColor, // time and date day header text color
                    '800': colors.text, // header date number color
                },
            },
        }

        setCalendarTheme(theme)
    }, [colors])

    function onRefresh(): void {
        setLoadingState(LoadingState.REFRESHING)
        void load()
    }

    function timetableToWeekViewEvents(
        entries: FriendlyTimetableEntry[]
    ): CalendarEvent[] {
        return entries.map((entry, index) => {
            return {
                start: entry.startDate,
                end: entry.endDate,
                title: entry.shortName,
                color: colors.primary,
                textColor: timetableTextColor.hex(),
                location: entry.rooms.length > 0 ? entry.rooms[0] : undefined,
                entry,
            }
        })
    }

    function calendarToWeekViewEvents(
        entries: CalendarType[]
    ): CalendarEvent[] {
        return entries.map((entry) => {
            const allDay = entry.hasHours === false || !entry.hasHours
            const endDate = entry.end ?? entry.begin

            return {
                start: allDay
                    ? ignoreTime(dayjs(entry.begin)).toDate()
                    : entry.begin,
                end: allDay ? ignoreTime(dayjs(endDate)).toDate() : endDate,
                title: entry.name[i18n.language as LanguageKey],
                color: calendarColor.hex(),
                textColor: calendarTextColor.hex(),
            }
        })
    }

    const renderHeader: HeaderRenderer<CalendarEvent> = (header) => {
        const windowWidth = Dimensions.get('window').width

        const rangeLength = (() => {
            switch (header.mode) {
                case 'week':
                    return 7
                case 'day':
                    return 1
                case '3days':
                    return 3
                default:
                    throw new Error('Invalid mode')
            }
        })()

        const headerStartDate = ignoreTime(header.dateRange[0])
        const headerEndDate = ignoreTime(header.dateRange[1]).add(
            rangeLength - 2,
            'd'
        )

        const allDayEvents = header.allDayEvents.filter(
            (event) =>
                event.start.getTime() <= headerEndDate.toDate().getTime() &&
                event.end.getTime() >= headerStartDate.toDate().getTime()
        )

        const dates = Array.from({ length: rangeLength }, (_, i) =>
            headerStartDate.add(i, 'd')
        )

        return (
            <View
                style={{
                    ...styles.headerWrapper,
                    borderBottomColor: colors.border,
                }}
            >
                <View
                    style={{
                        ...styles.headerHourSpacer,
                        borderRightColor: colors.border,
                    }}
                />
                <View style={styles.headerMainContainer}>
                    {/* dates */}
                    <View style={styles.headerDateContainer}>
                        {dates.map((date, i) => {
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        setCalendarDate(date.toDate())
                                    }}
                                >
                                    <View
                                        style={{
                                            ...styles.headerDate,
                                            backgroundColor: date.isSame(
                                                today,
                                                'day'
                                            )
                                                ? colors.labelBackground
                                                : undefined,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.text,
                                            }}
                                        >
                                            {date.format('ddd DD')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* all day events */}
                    <View style={styles.headerEventsContainer}>
                        {allDayEvents.map((event, i) => {
                            const eventStartDate = dayjs(event.start)
                            const eventEndDate = dayjs(event.end)

                            const eventStart =
                                eventStartDate < headerStartDate
                                    ? headerStartDate
                                    : eventStartDate
                            const eventEnd = (
                                eventEndDate > headerEndDate
                                    ? headerEndDate
                                    : eventEndDate
                            ).add(1, 'd')

                            const eventLength = eventEnd.diff(eventStart, 'd')

                            const startOffset = eventStart.diff(
                                headerStartDate,
                                'd',
                                true
                            )

                            const extendsLeft = eventStartDate < headerStartDate
                            const extendsRight = eventEndDate > headerEndDate

                            return (
                                <TouchableOpacity
                                    key={i}
                                    disabled={event.entry == null}
                                    onPress={() => {
                                        showEventDetails(event)
                                    }}
                                >
                                    <View
                                        style={{
                                            ...styles.allDayEvent,
                                            backgroundColor: event.color,
                                            paddingLeft: extendsLeft ? 4 : 8,
                                            paddingRight: extendsRight ? 4 : 8,
                                            borderTopStartRadius: extendsLeft
                                                ? 0
                                                : 4,
                                            borderBottomStartRadius: extendsLeft
                                                ? 0
                                                : 4,
                                            borderTopEndRadius: extendsRight
                                                ? 0
                                                : 4,
                                            borderBottomEndRadius: extendsRight
                                                ? 0
                                                : 4,
                                            borderLeftWidth: extendsLeft
                                                ? 4
                                                : 0,
                                            borderRightWidth: extendsRight
                                                ? 4
                                                : 0,
                                            borderLeftColor: Color(event.color)
                                                .darken(0.2)
                                                .hex(),
                                            borderRightColor: Color(event.color)
                                                .darken(0.2)
                                                .hex(),
                                            width:
                                                ((windowWidth - HOUR_WIDTH) *
                                                    eventLength) /
                                                    rangeLength -
                                                2 * MARGIN,
                                            transform: [
                                                {
                                                    translateX:
                                                        ((windowWidth -
                                                            HOUR_WIDTH) *
                                                            startOffset) /
                                                        rangeLength,
                                                },
                                            ],
                                        }}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                ...styles.allDayEventText,
                                                color: event.textColor,
                                            }}
                                        >
                                            {event.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </View>
        )
    }

    function renderEvent(
        event: CalendarEvent,
        touchableOpacityProps: CalendarTouchableOpacityProps
    ): JSX.Element {
        touchableOpacityProps.style = [
            touchableOpacityProps.style,
            {
                backgroundColor: event.color,
            },
        ]

        const hasLocation = event.location !== undefined
        return (
            <TouchableOpacity {...touchableOpacityProps}>
                <Text
                    style={{
                        color: event.textColor,
                    }}
                >
                    {event.title}
                </Text>
                {hasLocation && (
                    <View style={styles.eventLocation}>
                        <Ionicons
                            name="location-outline"
                            size={12}
                            color={event.textColor}
                        />
                        <Text
                            style={{
                                color: event.textColor,
                            }}
                        >
                            {event.location}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    }

    function showEventDetails(event: CalendarEvent): void {
        if (event.entry == null) {
            return
        }

        router.push({
            pathname: '(timetable)/details',
            params: { eventParam: JSON.stringify(event.entry) },
        })
    }

    const LoadingView = (): JSX.Element => {
        return (
            <View style={styles.loadingView}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        )
    }
    const Timetable = (): JSX.Element => {
        if (loadingState === LoadingState.LOADING) {
            return <LoadingView />
        } else if (
            loadingState === LoadingState.ERROR ||
            loadingState === LoadingState.REFRESHING
        ) {
            return (
                <ErrorPage
                    onRefresh={onRefresh}
                    message={t('error.unknown', {
                        ns: 'timetable',
                    })}
                    refreshing={loadingState === LoadingState.REFRESHING}
                />
            )
        } else if (loadingState === LoadingState.LOADED) {
            return (
                <Calendar
                    date={calendarDate}
                    onChangeDate={(range) => {
                        setCalendarDate(range[0])
                    }}
                    mode={mode}
                    events={timetable}
                    height={-1}
                    showAllDayEventCell={true}
                    renderEvent={renderEvent}
                    renderHeader={renderHeader}
                    onPressEvent={showEventDetails}
                    dayHeaderHighlightColor={colors.primary}
                    theme={calendarTheme}
                    scrollOffsetMinutes={480}
                    weekStartsOn={1}
                    weekEndsOn={6}
                />
            )
        } else {
            return <></>
        }
    }

    return (
        <WorkaroundStack
            name={t('navigation.timetable')}
            titleKey={t('navigation.timetable')}
            component={Timetable}
            headerRightElement={() => (
                <TouchableOpacity
                    onPress={() => {
                        setCalendarDate(new Date())
                    }}
                >
                    <Ionicons name="today" size={24} color={colors.text} />
                </TouchableOpacity>
            )}
        />
    )
}

const styles = StyleSheet.create({
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorView: {},
    navRight: {
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        marginRight: 12,
    },
    eventLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    headerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    headerHourSpacer: {
        width: HOUR_WIDTH,
        borderRightWidth: 1,
    },
    headerMainContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: MARGIN,
    },
    headerDateContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    headerDate: {
        paddingVertical: 4,
        paddingHorizontal: PAGE_PADDING,
        borderRadius: 9999,
        marginVertical: 6,
    },
    headerEventsContainer: {
        display: 'flex',
        gap: 3,
    },
    allDayEvent: {
        paddingVertical: 1,
        marginHorizontal: MARGIN,
        borderRadius: 4,
        justifyContent: 'center',
    },
    allDayEventText: {
        fontSize: 12,
    },
})
