import { type Colors } from '@/stores/colors'
import { calendar } from '@/utils/calendar-utils'
import { getDateRange, isSameDay } from '@/utils/date-utils'
import {
    type FriendlyTimetableEntry,
    getFriendlyTimetable,
} from '@/utils/timetable-utils'
import { type Calendar } from '@customTypes/data'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import Head from 'expo-router/head'
import React, { type FC, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import WeekView from 'react-native-week-view'
import { type WeekViewEvent } from 'react-native-week-view'

export default function TimetableScreen(): JSX.Element {
    const weekViewRef = useRef<typeof WeekView>()

    const theme = useTheme()
    const colors = theme.colors as Colors

    const [selectedDate, setSelectedDate] = useState(new Date())

    const textColor = Color(colors.text)
    const primaryColor = Color(colors.primary)

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

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const timetable = await getFriendlyTimetable(new Date())

                const timetableEntries = timetableToWeekViewEvents(timetable)
                const calendarEntries = calendarToWeekViewEvents(calendar)

                /**
                 * TODO:
                 * - Exams
                 * - Holidays
                 * - Maybe Events from student clubs
                 */

                setTimetable([...timetableEntries, ...calendarEntries])
            } catch (e) {
                console.error(e)
            }
        }

        load().catch(console.error)
    }, [colors.primary])

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
                eventKind: 'standard' as 'standard' | 'block',
                resolveOverlap: 'stack' as 'stack' | 'lane',
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
                title: entry.name.en,
                color: calendarColor.hex(),
                description: '',
                eventKind: 'standard' as 'standard' | 'block',
                resolveOverlap: 'stack' as 'stack' | 'lane',
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
        return (
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
        )
    }

    const DayHeaderComponent: FC<{ date: any; formattedDate: string }> = ({
        date,
        formattedDate,
    }) => {
        const today = isSameDay(new Date(date), new Date())
        return (
            <TouchableOpacity
                onPress={() => {
                    weekViewRef.current?.goToDate(date)
                }}
            >
                <View
                    style={[
                        styles.dateHeader,
                        {
                            backgroundColor: today
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function getTimetable(): TimetableEvent[] {
        const calendarRange = getDateRange(selectedDate, 3)

        const filteredTimetable = timetable.filter((entry) => {
            return calendarRange.some((date) => {
                return isSameDay(date, entry.startDate)
            })
        })

        return filteredTimetable
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
                    ref={weekViewRef}
                    events={timetable}
                    selectedDate={selectedDate}
                    numberOfDays={3}
                    timesColumnWidth={50}
                    showTitle={false}
                    beginAgendaAt={8 * 60}
                    startHour={9}
                    endAgendaAt={21 * 60}
                    hoursInDisplay={17}
                    showNowLine={true}
                    nowLineColor={colors.labelColor}
                    onEventPress={(event) => {
                        console.log(event)
                    }}
                    onSwipeNext={(date) => {
                        setSelectedDate(date)
                    }}
                    onSwipePrev={(date) => {
                        setSelectedDate(date)
                    }}
                    enableVerticalPinch={true}
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
                    headerStyle={[
                        styles.headerStyle,
                        {
                            backgroundColor: colors.card,
                        },
                    ]}
                    gridRowStyle={[
                        styles.gridRowStyle,
                        { borderColor: colors.border },
                    ]}
                    gridColumnStyle={styles.gridColumnStyle}
                    headerTextStyle={[
                        styles.headerTextStyle,
                        { color: colors.text },
                    ]}
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
})
