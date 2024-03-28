import { type ITimetableViewProps } from '@/app/(tabs)/timetable'
import { type Colors } from '@/components/colors'
import {
    NotificationContext,
    RouteParamsContext,
    TimetableContext,
} from '@/components/contexts'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import moment from 'moment'
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import WeekView, {
    type HeaderComponentProps,
    type WeekViewEvent,
} from 'react-native-week-view'

import PlatformIcon from '../Universal/Icon'
import { HeaderLeft, HeaderRight } from './HeaderButtons'

// Import HeaderComponentProps

export default function TimetableWeek({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
}: ITimetableViewProps): JSX.Element {
    const theme = useTheme()
    const colors = theme.colors as Colors
    const { selectedDate, setSelectedDate } = useContext(TimetableContext)
    const { timetableNotifications } = useContext(NotificationContext)
    // get the first day of friendlyTimetable that is not in the past
    const today = new Date()

    const friendlyTimetableWithColor = friendlyTimetable.map(
        (entry: FriendlyTimetableEntry, index: number) => ({
            ...entry,
            color: colors.background,
            id: index,
        })
    )

    const router = useRouter()
    const navigation = useNavigation()
    const { updateLecture } = useContext(RouteParamsContext)

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderRight
                    setToday={() => {
                        // @ts-expect-error typescript doesn't know that goToDate exists
                        weekViewRef.current?.goToDate(today)
                        setLocalSelectedDate(today)
                    }}
                />
            ),
            headerLeft: () => <HeaderLeft />,
        })
    }, [navigation])

    const isDark = theme.dark
    const eventBackgroundColor = Color(colors.primary)
        .alpha(0.73)
        .lighten(isDark ? 0 : 0.6)
        .darken(isDark ? 0.65 : 0)
        .rgb()
        .string()

    const dayBackgroundColor = Color(colors.card)
        .darken(isDark ? 0 : 0.13)
        .lighten(isDark ? 0.23 : 0)
        .rgb()
        .string()
    const dayTextColor = Color(colors.primary)
        .darken(isDark ? 0 : 0.2)
        .hex()
    const textColor = Color(colors.primary)
        .darken(isDark ? 0 : 0.42)
        .hex()
    const lineColor = Color(colors.primary)
        .darken(isDark ? 0.25 : 0)
        .lighten(isDark ? 0 : 0.25)
        .hex()
    const Event = ({
        event,
    }: {
        event: FriendlyTimetableEntry
    }): JSX.Element => {
        const begin = new Date(event.startDate)
        const end = new Date(event.endDate)
        const duration = end.getTime() - begin.getTime()
        const isOverflowing = duration < 1000 * 60 * 60
        const nameParts = event.shortName.split('_').slice(1)

        const nameToDisplay =
            event.name.length > 20
                ? nameParts.join('_') !== ''
                    ? nameParts.join('_')
                    : event.shortName
                : event.name
        return (
            <View
                style={{
                    ...styles.eventContainer,
                    backgroundColor: eventBackgroundColor,
                }}
            >
                <LinearGradient
                    colors={[colors.primary, lineColor]}
                    start={[0, 0.2]}
                    end={[1, 0.8]}
                    style={{
                        ...styles.eventLine,
                        // backgroundColor: colors.primary,
                    }}
                />
                <View style={styles.eventText}>
                    <View style={{}}>
                        <Text
                            style={{
                                ...styles.eventTitle,
                                color: textColor,
                            }}
                            numberOfLines={2}
                        >
                            {nameToDisplay}
                        </Text>

                        {isOverflowing ? null : (
                            <Text
                                style={{
                                    ...styles.eventTime,
                                    color: textColor,
                                    fontVariant: ['tabular-nums'],
                                }}
                            >
                                {formatFriendlyTime(begin) +
                                    ' - ' +
                                    formatFriendlyTime(end)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.roomRow}>
                        {isOverflowing ? null : (
                            <Text
                                numberOfLines={1} // Limiting to 1 line
                                ellipsizeMode="tail" // Truncate text with '...' at the end
                                style={{
                                    ...styles.eventLocation,
                                    color: textColor,
                                }}
                            >
                                {event.rooms.join(', ')}
                            </Text>
                        )}
                        {timetableNotifications[event.shortName] !==
                            undefined &&
                            !isOverflowing && (
                                <PlatformIcon
                                    color={textColor}
                                    ios={{
                                        name: 'bell',
                                        size: 10,
                                    }}
                                    android={{
                                        name: 'notifications',
                                        size: 12,
                                    }}
                                />
                            )}
                    </View>
                </View>
            </View>
        )
    }

    const weekViewRef = React.useRef<typeof WeekView>(null)
    const isMountedRef = React.useRef(false)

    const [localSelectedDate, setLocalSelectedDate] =
        React.useState(selectedDate)

    useEffect(() => {
        if (weekViewRef.current != null) {
            if (
                selectedDate.getDay() !== today.getDay() &&
                weekViewRef.current != null &&
                isMountedRef.current
            ) {
                // @ts-expect-error typescript doesn't know that goToDate exists
                weekViewRef.current.goToDate(selectedDate)
            }
        } else {
            // This is the first render, update the ref so subsequent renders can lead to `goToDate`
            isMountedRef.current = true
        }
    }, [selectedDate])
    const localSelectedDateRef = useRef(localSelectedDate)

    // Update the ref whenever localSelectedDate changes
    useEffect(() => {
        localSelectedDateRef.current = localSelectedDate
    }, [localSelectedDate])

    useFocusEffect(
        React.useCallback(() => {
            // This function runs when the screen comes into focus

            return () => {
                // This function runs when the screen is exited

                setSelectedDate(localSelectedDateRef.current)
            }
        }, []) // No dependencies here
    )
    /**
     * Functions
     */

    const DayHeaderComponent = ({
        date,
        isToday,
    }: HeaderComponentProps): JSX.Element => {
        const eventDate = moment(date)
        return (
            <View
                style={{
                    backgroundColor: dayBackgroundColor,
                    ...styles.dayCointainer,
                }}
            >
                <Text
                    style={{
                        color: isToday ? dayTextColor : colors.text,
                        ...(isToday
                            ? styles.dayTextBold
                            : styles.dayTextNormal),
                    }}
                >
                    {eventDate.format('dd DD.MM')}
                </Text>
            </View>
        )
    }

    function showEventDetails(entry: WeekViewEvent): void {
        updateLecture(entry as unknown as FriendlyTimetableEntry)
        router.push({
            pathname: '(timetable)/details',
        })
    }

    return (
        <WeekView
            /// <reference path="" />
            ref={weekViewRef}
            events={friendlyTimetableWithColor}
            selectedDate={selectedDate}
            numberOfDays={3}
            hoursInDisplay={14}
            showNowLine
            showTitle={false}
            locale="de"
            timesColumnWidth={0.15}
            nowLineColor={colors.primary}
            headerStyle={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                ...styles.headerStyle,
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
                setLocalSelectedDate(new Date(event))
            }}
            onSwipePrev={(event) => {
                setLocalSelectedDate(new Date(event))
            }}
            gridRowStyle={{ borderColor: colors.border }}
            gridColumnStyle={{ borderColor: colors.border }}
            DayHeaderComponent={DayHeaderComponent}
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
        justifyContent: 'space-between',
    },
    eventTitle: {
        fontWeight: 'bold',
        marginBottom: 1,

        fontSize: 15,
    },
    eventTime: {
        fontWeight: '500',
        fontSize: 14,
    },
    eventLocation: {
        fontSize: 14,
    },
    dayCointainer: {
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dayTextNormal: {
        fontSize: 14,
    },
    dayTextBold: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerStyle: {
        borderBottomWidth: 0.2,
    },
    roomRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
})
