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
import { useNavigation } from 'expo-router'
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
} from 'react-native-big-calendar'

interface CalendarEvent extends ICalendarEventBase {
    textColor: string
    color: string
    location?: string
}

export default function TimetableScreen(): JSX.Element {
    const [calendarTheme, setCalendarTheme] = useState<Record<string, any>>({})

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
                const timetable = await getFriendlyTimetable(today)
                const timetableEntries = timetableToWeekViewEvents(timetable)

                // university calendar
                const calendarEntries = calendarToWeekViewEvents(calendar)
                // const calendarEntries: ICalendarEventBase[] = []

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
                <TouchableOpacity
                    onPress={() => {
                        // goto today
                    }}
                    style={styles.headerIcon}
                >
                    <Ionicons name="today" size={22} color={colors.text} />
                </TouchableOpacity>
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
        const EVENT_HEIGHT = 20
        const PADDING = 2
        const MARGIN = 4

        const windowWidth = Dimensions.get('window').width

        const headerStartDate = ignoreTime(header.dateRange[0])
        const headerEndDate = ignoreTime(header.dateRange[1])

        const allDayEvents = header.allDayEvents.filter(
            (event) =>
                event.start.getTime() <=
                    headerEndDate.add(1, 'd').toDate().getTime() &&
                event.end.getTime() >= headerStartDate.toDate().getTime()
        )

        const rangeLength = headerEndDate.diff(headerStartDate, 'd')

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
                        height:
                            allDayEvents.length * EVENT_HEIGHT +
                            (allDayEvents.length - 1) * PADDING +
                            MARGIN * 2,
                        padding: 0,
                        flexGrow: 1,
                        justifyContent: 'center',
                    }}
                >
                    {allDayEvents.map((event, i) => {
                        const eventStartDate = dayjs(event.start)
                        const eventEndDate = dayjs(event.end)

                        const eventStart =
                            eventStartDate < headerStartDate
                                ? headerStartDate
                                : eventStartDate
                        const eventEnd =
                            eventEndDate > headerEndDate
                                ? headerEndDate
                                : eventEndDate

                        const eventLength = eventEnd.diff(eventStart, 'd')

                        const startOffset = eventStart.diff(
                            headerStartDate,
                            'd'
                        )

                        console.log('length', eventLength)

                        console.log('event', eventStart.toLocaleString())
                        console.log('header', headerStartDate.toLocaleString())
                        console.log(startOffset)

                        return (
                            <View
                                key={i}
                                style={{
                                    backgroundColor: event.color,
                                    paddingVertical: 1,
                                    paddingHorizontal: 4,
                                    borderRadius: 4,
                                    height: EVENT_HEIGHT,
                                    marginBottom:
                                        i !== allDayEvents.length - 1
                                            ? PADDING
                                            : 0,
                                    justifyContent: 'center',
                                    width: `${
                                        (100 * eventLength) / rangeLength
                                    }%`,
                                    transform: [
                                        {
                                            translateX:
                                                ((windowWidth - HOUR_WIDTH) *
                                                    startOffset) /
                                                rangeLength,
                                        },
                                    ],
                                }}
                            >
                                <Text
                                    style={{
                                        color: event.textColor,
                                        fontSize: 12,
                                    }}
                                >
                                    {event.title}
                                </Text>
                            </View>
                        )
                    })}
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
                    mode="3days"
                    events={timetable}
                    height={-1}
                    showAllDayEventCell={true}
                    renderEvent={renderEvent}
                    renderHeader={renderHeader}
                    onPressEvent={(event) => {
                        console.log(event)
                    }}
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
