import { type ITimetableViewProps } from '@/app/(tabs)/timetable'
import { type Colors } from '@/components/colors'
import { TimetableContext } from '@/components/provider'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import { useNavigation, useRouter } from 'expo-router'
import React, { useContext, useEffect, useLayoutEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import WeekView, { type WeekViewEvent } from 'react-native-week-view'

import { HeaderLeft, HeaderRight } from './HeaderButtons'

export default function TimetableWeek({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
}: ITimetableViewProps): JSX.Element {
    const theme = useTheme()
    const colors = theme.colors as Colors
    const { selectedDate, setSelectedDate } = useContext(TimetableContext)

    // get the first day of friendlyTimetable that is not in the past
    // const today = new Date()
    // const firstDay = friendlyTimetable.find(
    //     (entry: FriendlyTimetableEntry) =>
    //         entry.startDate.getTime() >= today.getTime()
    // )?.startDate

    const friendlyTimetableWithColor = friendlyTimetable.map(
        (entry: FriendlyTimetableEntry, index: number) => ({
            ...entry,
            color: colors.background,
            id: index,
        })
    )

    const router = useRouter()
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderRight
                    setToday={() => {
                        setSelectedDate(new Date())
                    }}
                />
            ),
            headerLeft: () => <HeaderLeft />,
        })
    }, [navigation])

    const Event = ({
        event,
    }: {
        event: FriendlyTimetableEntry
    }): JSX.Element => {
        const duration = event.endDate.getTime() - event.startDate.getTime()
        const isOverflowing = duration < 1000 * 60 * 60

        return (
            <View
                style={{
                    ...styles.eventContainer,
                    backgroundColor: Color(colors.primary)
                        .alpha(0.5)
                        .rgb()
                        .string(),
                }}
            >
                <View
                    style={{
                        ...styles.eventLine,
                        backgroundColor: Color(colors.primary)
                            .darken(0.1)
                            .hex(),
                    }}
                />
                <View style={styles.eventText}>
                    <Text
                        style={{
                            ...styles.eventTitle,
                            color: colors.text,
                        }}
                    >
                        {event.shortName}
                    </Text>
                    {isOverflowing ? null : (
                        <Text
                            style={{
                                ...styles.eventTime,
                                color: colors.text,
                            }}
                        >
                            {formatFriendlyTime(event.startDate)}
                        </Text>
                    )}

                    {isOverflowing ? null : (
                        <Text
                            numberOfLines={1} // Limiting to 1 line
                            ellipsizeMode="tail" // Truncate text with '...' at the end
                            style={{
                                ...styles.eventLocation,
                                color: colors.text,
                            }}
                        >
                            {event.rooms.join(', ')}
                        </Text>
                    )}
                </View>
            </View>
        )
    }

    const weekViewRef = React.useRef<typeof WeekView>(null)
    const isMountedRef = React.useRef(false)

    useEffect(() => {
        if (isMountedRef.current && weekViewRef.current != null) {
            // @ts-expect-error missing type
            weekViewRef.current.goToDate(selectedDate)
        } else {
            // This is the first render, update the ref so subsequent renders can lead to `goToDate`
            isMountedRef.current = true
        }
    }, [])

    /**
     * Functions
     */
    function showEventDetails(entry: WeekViewEvent): void {
        router.push({
            pathname: '(timetable)/details',
            params: { eventParam: JSON.stringify(entry) },
        })
    }

    return (
        <WeekView
            /// <reference path="" />
            ref={weekViewRef}
            // @ts-expect-error wrong type
            events={friendlyTimetableWithColor}
            selectedDate={selectedDate}
            numberOfDays={3}
            allowScrollByDay
            hoursInDisplay={14}
            showNowLine
            showTitle={false}
            locale="de"
            timesColumnWidth={0.15}
            nowLineColor={colors.primary}
            headerStyle={{
                backgroundColor: colors.background,
                borderColor: colors.border,
            }}
            headerTextStyle={{
                color: colors.text,
            }}
            hourTextStyle={{
                color: colors.text,
            }}
            startHour={8}
            // @ts-expect-error wrong type
            EventComponent={Event}
            onEventPress={(event) => {
                showEventDetails(event)
            }}
            onSwipeNext={(event) => {
                setSelectedDate(new Date(event))
            }}
            gridRowStyle={{ borderColor: colors.border }}
            gridColumnStyle={{ borderColor: colors.border }}
            formatDateHeader="dd DD.MM"
        />
    )
}

const styles = StyleSheet.create({
    eventContainer: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 5,
        overflow: 'hidden',
    },
    eventLine: {
        width: 4,

        borderTopStartRadius: 5,
        borderBottomStartRadius: 5,
    },
    eventText: {
        flex: 1,
        flexDirection: 'column',
        paddingLeft: 3,
        paddingRight: 2,
        paddingVertical: 3,
    },
    eventTitle: {
        fontWeight: 'bold',

        fontSize: 14,
        marginBottom: 3,
    },
    eventTime: {
        fontWeight: '500',
        fontSize: 14,
        marginBottom: 3,
    },
    eventLocation: {
        fontSize: 15,
    },
})
