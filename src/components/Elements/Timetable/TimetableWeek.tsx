import { type ITimetableViewProps } from '@/app/(tabs)/timetable'
import { type Colors } from '@/components/colors'
import { type CalendarEvent } from '@/types/utils'
import {
    calendar,
    convertCalendarToWeekViewEvents,
} from '@/utils/calendar-utils'
import { addDays, formatDay, ignoreTime, isSameDay } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { convertTimetableToWeekViewEvents } from '@/utils/timetable-utils'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import dayjs from 'dayjs'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useLayoutEffect, useState } from 'react'
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
    HOUR_GUIDE_WIDTH,
    type HeaderRenderer,
} from 'react-native-big-calendar'

import PlatformIcon from '../Universal/Icon'
import HeaderButtons from './HeaderButtons'

const HOUR_WIDTH = HOUR_GUIDE_WIDTH + 1
const MARGIN = 3

export default function TimetableWeek({
    friendlyTimetable,
}: ITimetableViewProps): JSX.Element {
    /**
     * Constants
     */
    const today = new Date()
    const rawTimetable = friendlyTimetable

    /**
     * Hooks
     */
    const { i18n } = useTranslation(['navigation', 'timetable'])

    const theme = useTheme()

    const router = useRouter()
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButtons
                    setToday={() => {
                        setCalendarDate(today)
                    }}
                />
            ),
        })
    }, [navigation])

    /**
     * States
     */
    const [calendarTheme, setCalendarTheme] = useState<Record<string, any>>({})
    const [calendarDate, setCalendarDate] = useState<Date>(new Date())

    const [timetable, setTimetable] = useState<CalendarEvent[]>([])

    /**
     * Colors
     */
    const colors = theme.colors as Colors

    const textColor = Color(colors.text)
    const primaryColor = Color(colors.primary)

    const timetableTextColor =
        textColor.contrast(primaryColor) > 5 ? textColor : textColor.negate()

    const calendarColor = Color(colors.labelSecondaryColor)
    const calendarTextColor =
        textColor.contrast(calendarColor) > 5 ? textColor : textColor.negate()

    /**
     * Functions
     */
    useEffect(() => {
        function fillTimetable(): void {
            const timetableEntries = convertTimetableToWeekViewEvents(
                rawTimetable,
                primaryColor.hex(),
                timetableTextColor.hex()
            )

            // university calendar
            const calendarEntries = convertCalendarToWeekViewEvents(
                calendar,
                i18n,
                calendarColor.hex(),
                calendarTextColor.hex()
            )

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

    function showEventDetails(event: CalendarEvent): void {
        if (event.entry == null) {
            return
        }

        router.push({
            pathname: '(timetable)/details',
            params: { eventParam: JSON.stringify(event.entry) },
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

        const headerStartDate = ignoreTime(header.dateRange[0].toDate())
        const headerEndDate = addDays(
            ignoreTime(header.dateRange[1].toDate()),
            rangeLength - 2
        )

        const allDayEvents = header.allDayEvents.filter(
            (event) =>
                event.start.getTime() <= headerEndDate.getTime() &&
                event.end.getTime() >= headerStartDate.getTime()
        )

        const dates = Array.from({ length: rangeLength }, (_, i) =>
            addDays(headerStartDate, i)
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
                                        setCalendarDate(date)
                                    }}
                                >
                                    <View
                                        style={{
                                            ...styles.headerDate,
                                            backgroundColor: isSameDay(
                                                today,
                                                date
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
                                            {formatDay(date)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* all day events */}
                    <View style={styles.headerEventsContainer}>
                        {allDayEvents.map((event, i) => {
                            const eventStartDate = event.start
                            const eventEndDate = event.end

                            const eventStart =
                                eventStartDate < headerStartDate
                                    ? headerStartDate
                                    : eventStartDate
                            const eventEnd = addDays(
                                eventEndDate > headerEndDate
                                    ? headerEndDate
                                    : eventEndDate,
                                1
                            )

                            const eventLength = dayjs(eventEnd).diff(
                                eventStart,
                                'd'
                            )

                            const startOffset = dayjs(eventStart).diff(
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
                        <PlatformIcon
                            color={event.textColor}
                            ios={{
                                name: 'mappin.and.ellipse',
                                size: 10,
                            }}
                            android={{
                                name: 'place',
                                size: 12,
                            }}
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

    /**
     * Renderers
     */
    return (
        // mount the calendar while data is still loading
        <Calendar
            date={calendarDate}
            onChangeDate={(range) => {
                setCalendarDate(range[0])
            }}
            mode={'3days'}
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
}

const styles = StyleSheet.create({
    loadingView: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
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
        gap: 3,
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
