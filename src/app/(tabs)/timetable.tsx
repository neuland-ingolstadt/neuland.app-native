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
// import Color from 'color'
import { useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
    Calendar,
    type CalendarTouchableOpacityProps,
    type ICalendarEventBase,
} from 'react-native-big-calendar'

// const NUMBER_OF_DAYS = 3
// const MAX_WEEKS = 3

interface CalendarEvent extends ICalendarEventBase {
    textColor: string
    color: string
}

export default function TimetableScreen(): JSX.Element {
    const today = new Date()

    const navigation = useNavigation()

    const theme = useTheme()
    const colors = theme.colors as Colors

    const { i18n } = useTranslation()

    // const textColor = Color(colors.text)
    // const primaryColor = Color(colors.primary)
    const { userKind } = React.useContext(UserKindContext)

    // const timetableTextColor =
    //     textColor.contrast(primaryColor) > 5
    //         ? textColor.hex()
    //         : textColor.negate().hex()

    // const calendarColor = Color(colors.primary).rotate(-100)
    // const calendarTextColor =
    //     textColor.contrast(calendarColor) > 5
    //         ? textColor.hex()
    //         : textColor.negate().hex()

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
    ): CalendarEvent[] {
        return entries.map((entry, index) => {
            return {
                start: entry.startDate,
                end: entry.endDate,
                title: entry.shortName,
                color: colors.primary,
                textColor: colors.text,
            }
        })
    }

    function calendarToWeekViewEvents(
        entries: CalendarType[]
    ): CalendarEvent[] {
        return entries.map((entry, index) => {
            const allDay = entry.hasHours === false || !entry.hasHours
            const endDate = entry.end ?? entry.begin

            return {
                start: allDay ? ignoreTime(entry.begin) : entry.begin,
                end: allDay ? ignoreTime(endDate) : endDate,
                title: entry.name[i18n.language as LanguageKey],
                color: colors.primary,
                textColor: colors.text,
            }
        })
    }

    function renderEvent(
        event: CalendarEvent,
        touchableOpacityProps: CalendarTouchableOpacityProps
    ): JSX.Element {
        touchableOpacityProps.onPress = () => {
            console.log(event)
        }

        return (
            <TouchableOpacity
                {...touchableOpacityProps}
                onPress={() => {
                    console.log(event)
                }}
                // add rest of the props without overwriting onPress
            >
                <Text>{`My custom event: ${event.title} with a color: ${event.color}`}</Text>
            </TouchableOpacity>
        )
    }

    // function getEntryTextColor(event: TimetableEvent): string {
    //     if (event.type === 'calendar') {
    //         return calendarTextColor
    //     }

    //     return timetableTextColor
    // }

    // const TimetableEntry: FC<{ event: TimetableEvent }> = ({ event }) => {
    //     const hasLocation = event.location !== undefined
    //     const shortEvent = event.startDate.getTime() === event.endDate.getTime()

    //     return (
    //         <>
    //             <Text
    //                 numberOfLines={shortEvent && hasLocation ? 1 : 2}
    //                 style={{
    //                     color: getEntryTextColor(event),
    //                 }}
    //             >
    //                 {event.title}
    //             </Text>
    //             {hasLocation && (
    //                 <View style={styles.eventLocation}>
    //                     <Ionicons
    //                         name="location-outline"
    //                         size={12}
    //                         color={getEntryTextColor(event)}
    //                     />
    //                     <Text
    //                         style={[
    //                             styles.locationText,
    //                             {
    //                                 color: getEntryTextColor(event),
    //                             },
    //                         ]}
    //                     >
    //                         {event.location}
    //                     </Text>
    //                 </View>
    //             )}
    //         </>
    //     )
    // }

    // const AllDayEntry: FC<{ event: TimetableEvent }> = ({ event }) => {
    //     const expandRight =
    //         event.originalEndDate != null &&
    //         event.originalEndDate.getTime() > event.endDate.getTime()

    //     const expandLeft =
    //         event.originalStartDate != null &&
    //         event.originalStartDate.getTime() < event.startDate.getTime()

    //     return (
    //         <>
    //             {expandRight && (
    //                 <View
    //                     style={{
    //                         backgroundColor: event.color,
    //                         width: expandLeft && expandRight ? '120%' : '110%',
    //                         height: 16.3,
    //                         position: 'absolute',
    //                         transform: [
    //                             {
    //                                 translateX:
    //                                     expandLeft && expandRight ? -20 : 8,
    //                             },
    //                         ],
    //                     }}
    //                 />
    //             )}
    //             <Text
    //                 lineBreakMode="tail"
    //                 numberOfLines={1}
    //                 style={[
    //                     styles.allDayEventTitle,
    //                     {
    //                         color: getEntryTextColor(event),
    //                     },
    //                 ]}
    //             >
    //                 {event.title}
    //             </Text>
    //         </>
    //     )
    // }

    // const DayHeaderComponent: FC<{ date: any; formattedDate: string }> = ({
    //     date,
    //     formattedDate,
    // }) => {
    //     const isToday = isSameDay(new Date(date), today)
    //     return (
    //         <TouchableOpacity
    //             onPress={() => {
    //                 // @ts-expect-error Property 'goToDate' does not exist on type 'ComponentType<WeekViewProps>'.
    //                 weekViewRef.current?.goToDate(date)
    //             }}
    //         >
    //             <View
    //                 style={[
    //                     styles.dateHeader,
    //                     {
    //                         backgroundColor: isToday
    //                             ? colors.labelBackground
    //                             : colors.card,
    //                     },
    //                 ]}
    //             >
    //                 <Text style={{ color: colors.text }}>{formattedDate}</Text>
    //             </View>
    //         </TouchableOpacity>
    //     )
    // }

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
