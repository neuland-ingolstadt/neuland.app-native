import { type LanguageKey } from '@/localization/i18n'
import { type Colors } from '@/stores/colors'
import { UserKindContext } from '@/stores/provider'
import { calendar } from '@/utils/calendar-utils'
import { addDays, getDayDelta, ignoreTime, isSameDay } from '@/utils/date-utils'
import {
    type FriendlyTimetableEntry,
    getFriendlyTimetable,
} from '@/utils/timetable-utils'
import { type Calendar } from '@customTypes/data'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import { useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import React, { type FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import WeekView from 'react-native-week-view'
import { type WeekViewEvent } from 'react-native-week-view'

const NUMBER_OF_DAYS = 3
const MAX_WEEKS = 3

export default function TimetableScreen(): JSX.Element {
    const today = new Date()
    const maxFutureDate = ignoreTime(addDays(today, MAX_WEEKS * 7 - 1))
    const maxPastDate = ignoreTime(addDays(today, -1 * MAX_WEEKS * 7 - 1))

    const weekViewRef = useRef<typeof WeekView>()

    const navigation = useNavigation()

    const theme = useTheme()
    const colors = theme.colors as Colors

    const [selectedDate, setSelectedDate] = useState(today)
    const { i18n } = useTranslation()

    const textColor = Color(colors.text)
    const primaryColor = Color(colors.primary)
    const { userKind } = React.useContext(UserKindContext)
    const timetableTextColor =
        textColor.contrast(primaryColor) > 5
            ? textColor.hex()
            : textColor.negate().hex()

    const calendarColor = Color(colors.primary).rotate(-100)
    const calendarTextColor =
        textColor.contrast(calendarColor) > 5
            ? textColor.hex()
            : textColor.negate().hex()

    const [timetable, setTimetable] = useState<TimetableEvent[]>([])

    function limitEntries(entries: TimetableEvent[]): TimetableEvent[] {
        return entries.filter((entry) => {
            return (
                entry.startDate.getTime() >= maxPastDate.getTime() &&
                entry.endDate.getTime() <= maxFutureDate.getTime()
            )
        })
    }

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const timetable = await getFriendlyTimetable(today)
                const timetableEntries = limitEntries(
                    timetableToWeekViewEvents(timetable)
                )
                const calendarEntries = calendarToWeekViewEvents(calendar)
                const allEvents = [...timetableEntries, ...calendarEntries]

                /**
                 * TODO:
                 * - Exams
                 * - Holidays
                 * - Maybe Events from student clubs
                 * - FIX CALENDER CORRECTLY!!!
                 */

                const allDayEvents = allEvents.filter(
                    (event) => event.allDay ?? false
                )
                const timelessToday = ignoreTime(today)
                const splitEvents = allDayEvents.flatMap((event) => {
                    const splitEvents: TimetableEvent[] = []

                    const todayDelta = getDayDelta(
                        event.startDate,
                        timelessToday
                    )

                    // add initial event (event till first calendar split)
                    const initialEndDate = addDays(
                        event.startDate,
                        (todayDelta < 0
                            ? Math.abs(todayDelta) - 1
                            : NUMBER_OF_DAYS - 1 - todayDelta) % NUMBER_OF_DAYS
                    )

                    const initialEvent: TimetableEvent = {
                        ...event,
                        startDate: event.startDate,
                        endDate: initialEndDate,
                        id: event.id,
                        originalStartDate: event.startDate,
                        originalEndDate: event.endDate,
                    }

                    splitEvents.push(initialEvent)

                    const usedEndDate =
                        event.endDate.getTime() > maxFutureDate.getTime()
                            ? maxFutureDate
                            : event.endDate

                    // add all calendar splits
                    const splits = Math.ceil(
                        getDayDelta(usedEndDate, initialEndDate) /
                            NUMBER_OF_DAYS
                    )

                    for (let i = 0; i < splits; i++) {
                        const startDate = addDays(
                            initialEndDate,
                            i * NUMBER_OF_DAYS + 1
                        )
                        const endDate = addDays(startDate, NUMBER_OF_DAYS - 1)

                        // if endDate is after event.endDate, set endDate to event.endDate
                        if (endDate.getTime() > event.endDate.getTime()) {
                            endDate.setTime(event.endDate.getTime())
                        }

                        const splitEvent: TimetableEvent = {
                            ...event,
                            startDate,
                            endDate,
                            id: event.id + i,
                            originalStartDate: event.startDate,
                            originalEndDate: event.endDate,
                        }

                        splitEvents.push(splitEvent)
                    }

                    return splitEvents
                })
                setTimetable([
                    ...allEvents.filter((event) => !(event.allDay ?? false)),
                    ...splitEvents,
                ])
            } catch (e) {
                console.log(e)
            }
        }

        load().catch(console.error)
    }, [colors.primary, userKind])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        // @ts-expect-error Property 'goToDate' does not exist on type 'ComponentType<WeekViewProps>'.
                        weekViewRef.current?.goToDate(today)
                        // @ts-expect-error Property 'scrollToTime' does not exist on type 'ComponentType<WeekViewProps>'.
                        weekViewRef.current?.scrollToTime(
                            (today.getHours() - 1) * 60
                        )
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
    ): TimetableEvent[] {
        return entries.map((entry, index) => {
            return {
                id: index,
                startDate: entry.startDate,
                endDate: entry.endDate,
                title: entry.shortName,
                color: colors.primary,
                description: entry.shortName,
                location: entry.rooms.join(', '),
                eventKind: 'standard',
                resolveOverlap: 'lane',
                stackKey: index.toString(),
                type: 'timetable',
            }
        })
    }

    function calendarToWeekViewEvents(entries: Calendar[]): TimetableEvent[] {
        return entries.map((entry, index) => {
            return {
                id: index,
                startDate: entry.begin,
                endDate: entry.end ?? entry.begin,
                title: entry.name[i18n.language as LanguageKey],
                color: calendarColor.hex(),
                description: '',
                eventKind: 'standard',
                resolveOverlap: 'lane',
                stackKey: index.toString(),
                allDay: entry.hasHours === false || !entry.hasHours,
                type: 'calendar',
            }
        })
    }

    function getEntryTextColor(event: TimetableEvent): string {
        if (event.type === 'calendar') {
            return calendarTextColor
        }

        return timetableTextColor
    }

    const TimetableEntry: FC<{ event: TimetableEvent }> = ({ event }) => {
        const hasLocation = event.location !== undefined
        const shortEvent = event.startDate.getTime() === event.endDate.getTime()

        return (
            <>
                <Text
                    numberOfLines={shortEvent && hasLocation ? 1 : 2}
                    style={{
                        color: getEntryTextColor(event),
                    }}
                >
                    {event.title}
                </Text>
                {hasLocation && (
                    <View style={styles.eventLocation}>
                        <Ionicons
                            name="location-outline"
                            size={12}
                            color={getEntryTextColor(event)}
                        />
                        <Text
                            style={[
                                styles.locationText,
                                {
                                    color: getEntryTextColor(event),
                                },
                            ]}
                        >
                            {event.location}
                        </Text>
                    </View>
                )}
            </>
        )
    }

    const AllDayEntry: FC<{ event: TimetableEvent }> = ({ event }) => {
        const expandRight =
            event.originalEndDate != null &&
            event.originalEndDate.getTime() > event.endDate.getTime()

        const expandLeft =
            event.originalStartDate != null &&
            event.originalStartDate.getTime() < event.startDate.getTime()

        return (
            <>
                {expandRight && (
                    <View
                        style={{
                            backgroundColor: event.color,
                            width: expandLeft && expandRight ? '120%' : '110%',
                            height: 16.3,
                            position: 'absolute',
                            transform: [
                                {
                                    translateX:
                                        expandLeft && expandRight ? -20 : 8,
                                },
                            ],
                        }}
                    />
                )}
                <Text
                    lineBreakMode="tail"
                    numberOfLines={1}
                    style={[
                        styles.allDayEventTitle,
                        {
                            color: getEntryTextColor(event),
                        },
                    ]}
                >
                    {event.title}
                </Text>
            </>
        )
    }

    const DayHeaderComponent: FC<{ date: any; formattedDate: string }> = ({
        date,
        formattedDate,
    }) => {
        const isToday = isSameDay(new Date(date), today)
        return (
            <TouchableOpacity
                onPress={() => {
                    // @ts-expect-error Property 'goToDate' does not exist on type 'ComponentType<WeekViewProps>'.
                    weekViewRef.current?.goToDate(date)
                }}
            >
                <View
                    style={[
                        styles.dateHeader,
                        {
                            backgroundColor: isToday
                                ? colors.labelBackground
                                : colors.card,
                        },
                    ]}
                >
                    <Text style={{ color: colors.text }}>{formattedDate}</Text>
                </View>
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
                <WeekView
                    // @ts-expect-error Property 'ref' does not exist on type 'IntrinsicAttributes & WeekViewProps
                    ref={weekViewRef}
                    events={timetable}
                    selectedDate={selectedDate}
                    numberOfDays={NUMBER_OF_DAYS}
                    timesColumnWidth={50}
                    showTitle={false}
                    beginAgendaAt={8 * 60}
                    startHour={9}
                    endAgendaAt={21 * 60}
                    hoursInDisplay={17}
                    showNowLine={true}
                    nowLineColor={colors.labelColor}
                    windowSize={MAX_WEEKS}
                    initialNumToRender={MAX_WEEKS}
                    maxToRenderPerBatch={1}
                    runOnJS={true}
                    updateCellsBatchingPeriod={0}
                    onEventPress={(event) => {
                        console.log(event)
                    }}
                    onSwipeNext={(date) => {
                        const setDate =
                            date.getTime() > maxFutureDate.getTime()
                                ? maxFutureDate
                                : date

                        setSelectedDate(setDate)
                        // @ts-expect-error Property 'goToDate' does not exist on type 'ComponentType<WeekViewProps>'.
                        weekViewRef.current?.goToDate(setDate)
                    }}
                    onSwipePrev={(date) => {
                        const setDate =
                            date.getTime() < maxPastDate.getTime()
                                ? maxPastDate
                                : date

                        setSelectedDate(setDate)
                        // @ts-expect-error Property 'goToDate' does not exist on type 'ComponentType<WeekViewProps>'.
                        weekViewRef.current?.goToDate(setDate)
                    }}
                    formatDateHeader="ddd D"
                    EventComponent={
                        TimetableEntry as FC<{ event: WeekViewEvent }>
                    }
                    AllDayEventComponent={
                        AllDayEntry as FC<{ event: WeekViewEvent }>
                    }
                    DayHeaderComponent={DayHeaderComponent}
                    allDayEventContainerStyle={styles.allDayEventContainer}
                    eventContainerStyle={styles.eventStyle}
                    hourTextStyle={{
                        color: colors.text,
                    }}
                    headerStyle={{
                        ...styles.headerStyle,

                        backgroundColor: colors.card,
                    }}
                    gridRowStyle={{
                        ...styles.gridRowStyle,
                        borderColor: colors.border,
                    }}
                    gridColumnStyle={styles.gridColumnStyle}
                    headerTextStyle={{
                        ...styles.headerTextStyle,
                        color: colors.text,
                    }}
                />
            </View>
        </>
    )
}

interface TimetableEvent extends WeekViewEvent {
    eventKind: 'standard' | 'block'
    location?: string
    title: string
    allDay?: boolean
    type: 'calendar' | 'timetable'
    originalStartDate?: Date
    originalEndDate?: Date
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
