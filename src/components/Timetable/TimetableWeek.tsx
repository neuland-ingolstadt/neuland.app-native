import { type ITimetableViewProps } from '@/app/(tabs)/(timetable)/timetable'
import { PreferencesContext } from '@/components/contexts'
import {
    type CalendarTimetableEntry,
    type Exam,
    type ExamTimetableEntry,
    type FriendlyTimetableEntry,
} from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor, inverseColor } from '@/utils/ui-utils'
import { Buffer } from 'buffer/'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import moment from 'moment'
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { Platform, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'
import WeekView, {
    type HeaderComponentProps,
    type WeekViewEvent,
} from 'react-native-week-view'

import { HeaderLeft, HeaderRight } from './HeaderButtons'

export default function TimetableWeek({
    // eslint-disable-next-line react/prop-types
    friendlyTimetable,
    // eslint-disable-next-line react/prop-types
    exams,
}: ITimetableViewProps): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const { selectedDate, setSelectedDate } = useContext(PreferencesContext)
    // get the first day of friendlyTimetable that is not in the past
    const today = new Date()
    const firstElementeDate = friendlyTimetable.find(
        (entry: FriendlyTimetableEntry) => new Date(entry.startDate) > today
    )?.startDate
    const [localSelectedDate, setLocalSelectedDate] =
        React.useState(selectedDate)
    const friendlyTimetableWithColor = friendlyTimetable.map(
        (entry: FriendlyTimetableEntry, index: number) => ({
            ...entry,
            eventType: 'lecture',
            color: theme.colors.primary,
            id: index,
            startDate: new Date(entry.startDate),
            endDate: new Date(entry.endDate),
        })
    )

    const examsWithColor = exams.map((exam: Exam, index: number) => ({
        ...exam,
        eventType: 'exam',
        color: inverseColor(theme.colors.primary),
        id: friendlyTimetable.length + index, // Ensure unique ID by continuing from the last timetable entry ID
        startDate: new Date(exam.date),
        endDate: new Date(new Date(exam.date).getTime() + 1000 * 60 * 60 * 1.5), // Correctly calculate the endDate
    }))

    const allEvents = [...examsWithColor, ...friendlyTimetableWithColor]

    const router = useRouter()
    const navigation = useNavigation()
    const stripTime = (date: Date): Date => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderRight
                    setToday={() => {
                        const strippedLocalSelectedDate =
                            stripTime(localSelectedDate)
                        const strippedToday = stripTime(today)

                        const targetDate =
                            strippedLocalSelectedDate.getTime() ===
                            strippedToday.getTime()
                                ? (firstElementeDate ?? today)
                                : today
                        // @ts-expect-error typescript doesn't know that goToDate exists
                        weekViewRef.current?.goToDate(new Date(targetDate))
                        setLocalSelectedDate(new Date(targetDate))
                    }}
                />
            ),
            headerLeft: () => <HeaderLeft />,
        })
    }, [navigation, localSelectedDate])

    const isDark = UnistylesRuntime.themeName === 'dark'
    const isIOS = Platform.OS === 'ios'

    const eventBackgroundColor = (color: string): string =>
        isIOS
            ? Color(color)
                  .alpha(0.73)
                  .lighten(isDark ? 0 : 0.6)
                  .darken(isDark ? 0.65 : 0)
                  .rgb()
                  .string()
            : color

    const textColor = (color: string, background: string): string => {
        let textColor = isIOS
            ? Color(color)
                  .darken(isDark ? 0 : 0.45)
                  .hex()
            : getContrastColor(background)

        const contrast = Color(background).contrast(Color(textColor))

        if (contrast < 3.5 && isIOS) {
            textColor = Color(background).isLight() ? '#000000' : '#FFFFFF'
        }
        return textColor
    }

    const lineColor = (color: string, eventBackgroundColor: string): string =>
        isIOS
            ? Color(color)
                  .darken(isDark ? 0.25 : 0)
                  .lighten(isDark ? 0 : 0.25)
                  .hex()
            : eventBackgroundColor

    const TimetableEvent = ({
        event,
    }: {
        event: CalendarTimetableEntry
    }): JSX.Element => {
        const begin = new Date(event.startDate)
        const end = new Date(event.endDate)
        const duration = end.getTime() - begin.getTime()
        const isOverflowing = duration < 1000 * 60 * 60
        const nameParts = event.shortName.split('_').slice(1)
        const background = eventBackgroundColor(event.color)
        const fontColor = textColor(event.color, background)
        const { styles } = useStyles(stylesheet)
        const eventName = event.name ?? ''
        const nameToDisplay =
            eventName.length > 20
                ? nameParts.join('_') !== ''
                    ? nameParts.join('_')
                    : event.shortName
                : eventName
        return (
            <View
                style={{
                    ...styles.eventContainer,
                    backgroundColor: background,
                }}
            >
                <LinearGradient
                    colors={[event.color, lineColor(event.color, background)]}
                    start={[0, 0.2]}
                    end={[1, 0.8]}
                    style={{
                        ...styles.eventLine,
                    }}
                />
                <View style={styles.eventText}>
                    <View style={{}}>
                        <Text
                            style={{
                                ...styles.eventTitle,
                                color: fontColor,
                            }}
                            numberOfLines={2}
                        >
                            {nameToDisplay}
                        </Text>

                        {isOverflowing ? null : (
                            <Text
                                style={{
                                    ...styles.eventTime,
                                    color: fontColor,
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
                                    color: fontColor,
                                }}
                            >
                                {event.rooms.join(', ')}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        )
    }
    const ExamEvent = ({
        event,
    }: {
        event: ExamTimetableEntry
    }): JSX.Element => {
        const begin = new Date(event.date)
        const background = eventBackgroundColor(event.color)
        const fontColor = textColor(event.color, background)
        const { styles } = useStyles(stylesheet)
        return (
            <View
                style={{
                    ...styles.eventContainer,
                    backgroundColor: background,
                }}
            >
                <LinearGradient
                    colors={[event.color, lineColor(event.color, background)]}
                    start={[0, 0.2]}
                    end={[1, 0.8]}
                    style={{
                        ...styles.eventLine,
                    }}
                />
                <View style={styles.eventText}>
                    <View style={{}}>
                        <Text
                            style={{
                                ...styles.eventTitle,
                                color: fontColor,
                            }}
                            numberOfLines={2}
                        >
                            {event.name}
                        </Text>

                        <Text
                            style={{
                                ...styles.eventTime,
                                color: fontColor,
                                fontVariant: ['tabular-nums'],
                            }}
                        >
                            {formatFriendlyTime(begin)}
                        </Text>
                    </View>
                    <View style={styles.roomRow}>
                        <Text
                            numberOfLines={1} // Limiting to 1 line
                            ellipsizeMode="tail" // Truncate text with '...' at the end
                            style={{
                                ...styles.eventLocation,
                                color: fontColor,
                            }}
                        >
                            {event.seat ?? event.rooms}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    const Event = ({
        event,
    }: {
        event: CalendarTimetableEntry | ExamTimetableEntry
    }): JSX.Element => {
        return event.eventType === 'exam' ? (
            <ExamEvent event={event as ExamTimetableEntry} />
        ) : (
            <TimetableEvent event={event as CalendarTimetableEntry} />
        )
    }

    const weekViewRef = React.useRef<typeof WeekView>(null)
    const isMountedRef = React.useRef(false)

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
        const { styles } = useStyles(stylesheet)
        return (
            <View style={styles.dayCointainer}>
                <Text style={styles.dayHeaderText(isToday)}>
                    {eventDate.format('dd DD.MM')}
                </Text>
            </View>
        )
    }

    function showEventDetails(entry: WeekViewEvent): void {
        const base64Event = Buffer.from(JSON.stringify(entry)).toString(
            'base64'
        )
        if (entry.eventType === 'exam') {
            const navigateToPage = (): void => {
                router.navigate({
                    pathname: 'exam',
                    params: { examEntry: base64Event },
                })
            }
            navigateToPage()
        } else if (entry.eventType === 'lecture') {
            router.navigate({
                pathname: 'lecture',
                params: {
                    lecture: base64Event,
                },
            })
        }
    }

    return (
        <WeekView
            ref={weekViewRef}
            events={allEvents as unknown as WeekViewEvent[]}
            selectedDate={selectedDate}
            numberOfDays={3}
            hoursInDisplay={14}
            showNowLine={true}
            showTitle={false}
            locale="de"
            timesColumnWidth={0.15}
            nowLineColor={styles.nowLine(isIOS).color}
            headerStyle={styles.headerStyle}
            headerTextStyle={styles.text}
            hourTextStyle={styles.text}
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
            gridRowStyle={styles.grid}
            gridColumnStyle={styles.grid}
            DayHeaderComponent={DayHeaderComponent}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    dayCointainer: {
        backgroundColor: Color(theme.colors.card)
            .darken(UnistylesRuntime.themeName === 'dark' ? 0 : 0.13)
            .lighten(UnistylesRuntime.themeName === 'dark' ? 0.23 : 0)
            .rgb()
            .string(),
        borderRadius: theme.radius.md,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    dayHeaderText: (isToday: boolean) => ({
        color: isToday
            ? Color(theme.colors.primary)
                  .darken(UnistylesRuntime.themeName === 'dark' ? 0 : 0.2)
                  .hex()
            : theme.colors.text,
        fontSize: 14,
        fontWeight: isToday ? 'bold' : 'normal',
    }),
    eventContainer: {
        borderRadius: 5,
        flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    eventLine: {
        borderBottomStartRadius: 5,

        borderTopStartRadius: 5,
        width: 4,
    },
    eventLocation: {
        fontSize: 14,
    },
    eventText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingLeft: 3,
        paddingRight: 2,
        paddingVertical: 3,
    },
    eventTime: {
        fontSize: 14,
        fontWeight: '500',
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: 'bold',

        marginBottom: 1,
    },
    grid: {
        borderColor: theme.colors.border,
    },
    headerStyle: {
        backgroundColor: theme.colors.background,
        borderBottomWidth: 0.2,
        borderColor: theme.colors.border,
    },

    nowLine: (isIOS: boolean) => ({
        color: isIOS ? theme.colors.primary : theme.colors.notification,
    }),

    roomRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    text: {
        color: theme.colors.text,
    },
}))
