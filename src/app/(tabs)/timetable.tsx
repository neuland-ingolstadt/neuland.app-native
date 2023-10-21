import { type Colors } from '@/stores/colors'
import { isSameDay } from '@/utils/date-utils'
import {
    type FriendlyTimetableEntry,
    getFriendlyTimetable,
} from '@/utils/timetable-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import Head from 'expo-router/head'
import React, { type FC, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import WeekView from 'react-native-week-view'
import { type WeekViewEvent } from 'react-native-week-view'

export default function TimetableScreen(): JSX.Element {
    const theme = useTheme()
    const colors = theme.colors as Colors

    const eventColor = useMemo(() => {
        const textColor = Color(colors.text)
        const primaryColor = Color(colors.primary)

        return textColor.contrast(primaryColor) > 5
            ? textColor.hex()
            : textColor.negate().hex()
    }, [colors.primary])

    const [timetable, setTimetable] = useState<TimetableEvent[]>([])

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const timetable = await getFriendlyTimetable(new Date())

                setTimetable(timetableToWeekViewEvents(timetable))
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
                color: '',
                description: entry.shortName,
                location: entry.rooms.join(', '),
                eventKind: 'standard' as 'standard' | 'block',
                resolveOverlap: 'stack' as 'stack' | 'lane',
                stackKey: index.toString(),
            }
        })
    }

    const TimetableEntry: FC<TimetableEntryProps> = ({ event }) => {
        const textStyle = {
            color: eventColor,
        }

        return (
            <>
                <Text style={textStyle}>{event.title}</Text>
                <View style={styles.eventLocation}>
                    <Ionicons
                        name="location-outline"
                        size={12}
                        color={eventColor}
                    />
                    <Text style={[styles.locationText, textStyle]}>
                        {event.location}
                    </Text>
                </View>
            </>
        )
    }

    const DayHeaderComponent: FC<{ date: any; formattedDate: string }> = ({
        date,
        formattedDate,
    }) => {
        const today = isSameDay(new Date(date), new Date())
        return (
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

            <View
                style={{
                    height: '100%',
                }}
            >
                <WeekView
                    events={timetable}
                    selectedDate={new Date()}
                    numberOfDays={3}
                    timesColumnWidth={50}
                    showTitle={false}
                    beginAgendaAt={8 * 60}
                    startHour={9}
                    endAgendaAt={21 * 60}
                    hoursInDisplay={17}
                    showNowLine={true}
                    enableVerticalPinch={true}
                    formatDateHeader="ddd D"
                    EventComponent={
                        TimetableEntry as FC<{ event: WeekViewEvent }>
                    }
                    DayHeaderComponent={DayHeaderComponent}
                    eventContainerStyle={[
                        styles.eventStyle,
                        { backgroundColor: colors.primary },
                    ]}
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
    location: string
    title: string
}

interface TimetableEntryProps {
    event: TimetableEvent
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
})
