import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { UserKindContext } from '@/stores/provider'
import { calendar } from '@/utils/calendar-utils'
import { ignoreTime } from '@/utils/date-utils'
import {
    type FriendlyTimetableEntry,
    getFriendlyTimetable,
} from '@/utils/timetable-utils'
import { type Calendar as CalendarType } from '@customTypes/data'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import dayjs from 'dayjs'
import { useNavigation, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    Calendar,
    type CalendarTouchableOpacityProps,
    type HeaderRenderer,
    type ICalendarEventBase,
    type Mode,
} from 'react-native-big-calendar'

interface CalendarEvent extends ICalendarEventBase {
    textColor: string
    color: string
    location?: string
    entry?: FriendlyTimetableEntry
}

export default function TimetableScreen(): JSX.Element {
    const router = useRouter()

    const [calendarTheme, setCalendarTheme] = useState<Record<string, any>>({})
    const [calendarDate, setCalendarDate] = useState<Date>(new Date())
    const [mode, setMode] = useState<Mode>('3days')

    const today = new Date()

    const navigation = useNavigation()

    const theme = useTheme()
    const colors = theme.colors as Colors

    const { i18n } = useTranslation()

    const textColor = Color(colors.text)
    const primaryColor = Color(colors.primary)
    const { userKind } = React.useContext(UserKindContext)

    const timetableTextColor =
        textColor.contrast(primaryColor) > 5 ? textColor : textColor.negate()

    const calendarColor = Color(colors.primary).rotate(-100)
    const calendarTextColor =
        textColor.contrast(calendarColor) > 5 ? textColor : textColor.negate()

    const [timetable, setTimetable] = useState<CalendarEvent[]>([])

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                // timetable
                const timetable = await getFriendlyTimetable(today, true)
                const timetableEntries = timetableToWeekViewEvents(timetable)

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
            } catch (e) {
                console.log(e)
            }
        }

        load().catch(console.error)
    }, [colors.primary, userKind])

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

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 4,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            setMode((oldMode) => {
                                return oldMode === '3days'
                                    ? 'schedule'
                                    : '3days'
                            })
                        }}
                        style={styles.headerIcon}
                    >
                        <Ionicons name="list" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setCalendarDate(new Date())
                        }}
                        style={styles.headerIcon}
                    >
                        <Ionicons name="today" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            ),
        })
    }, [navigation, colors])

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
        const HOUR_WIDTH = 51
        const MARGIN = 4

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
                    display: 'flex',
                    flexDirection: 'row',
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                }}
            >
                <View
                    style={{
                        width: HOUR_WIDTH,
                        borderRightColor: colors.border,
                        borderRightWidth: 1,
                    }}
                />
                <View
                    style={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingBottom: MARGIN,
                    }}
                >
                    {/* dates */}
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}
                    >
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
                                            backgroundColor: date.isSame(
                                                today,
                                                'day'
                                            )
                                                ? colors.labelBackground
                                                : Color(colors.labelBackground)
                                                      .darken(0.5)
                                                      .hex(),
                                            paddingVertical: 4,
                                            paddingHorizontal: 16,
                                            borderRadius: 9999,
                                            marginVertical: 6,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.text,
                                            }}
                                        >
                                            {date.format('DD')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* all day events */}
                    <View
                        style={{
                            display: 'flex',
                            gap: 3,
                        }}
                    >
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
                                    onPress={() => {
                                        showEventDetails(event)
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: event.color,
                                            paddingVertical: 1,
                                            paddingLeft: extendsLeft ? 4 : 8,
                                            paddingRight: extendsRight ? 4 : 8,
                                            marginHorizontal: MARGIN,
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
                                            justifyContent: 'center',
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
                                                color: event.textColor,
                                                fontSize: 12,
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

    return (
        <>
            <Head>
                <title>Timetable</title>
                <meta name="Timetable" content="Personal Timetable" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

            <View style={styles.wrapper}>
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
                    dayHeaderStyle={{
                        backgroundColor: 'transparent',
                        paddingBottom: 5,
                    }}
                    dayHeaderHighlightColor={colors.primary}
                    theme={calendarTheme}
                    scrollOffsetMinutes={480}
                    weekStartsOn={1}
                    weekEndsOn={6}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    headerStyle: {
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    gridRowStyle: {
        borderTopWidth: 1,
    },
    gridColumnStyle: {
        borderLeftWidth: 0,
    },
    headerTextStyle: {
        borderRightWidth: 0,
    },
    eventStyle: {
        borderRadius: 6,
        elevation: 1,
        alignItems: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        minHeight: 43,
    },
    eventLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    locationText: {
        fontSize: 12,
    },
    todayDateHeader: {
        borderRadius: 9999,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    dateHeader: {
        borderRadius: 9999,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    allDayEventContainer: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 1,
    },
    wrapper: {
        height: '100%',
    },
    allDayEventTitle: {
        fontSize: 12,
    },
    headerIcon: {
        marginRight: 12,
    },
})
