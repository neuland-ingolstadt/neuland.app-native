import { formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { type PackedEvent } from '@howljs/calendar-kit'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Platform, Text, View } from 'react-native'
import {
    type UnistylesTheme,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

const isIOS = Platform.OS === 'ios'
const EventComponent = ({
    event,
    theme,
    isDark,
}: {
    event: PackedEvent
    theme: UnistylesTheme
    isDark: boolean
}): JSX.Element | null => {
    const { styles } = useStyles(stylesheet)
    if (
        event.start.dateTime === undefined ||
        event.end.dateTime === undefined
    ) {
        return null
    }

    const begin = new Date(event.start.dateTime)
    const end = new Date(event.end.dateTime)
    const duration = end.getTime() - begin.getTime()
    const isOverflowing = duration < 1000 * 60 * 60
    const nameParts = event.shortName?.split('_')?.slice(1)
    const background = eventBackgroundColor(theme.colors.primary, isDark)
    const fontColor = textColor(theme.colors.primary, background, isDark)
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
            {isIOS && (
                <LinearGradient
                    colors={[
                        theme.colors.primary,
                        lineColor(theme.colors.primary, background, isDark),
                    ]}
                    start={[0, 0.2]}
                    end={[1, 0.8]}
                    style={{
                        ...styles.eventLine,
                    }}
                />
            )}
            <View style={styles.eventText}>
                <View>
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
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                                ...styles.eventLocation,
                                color: fontColor,
                            }}
                        >
                            {event.rooms?.join(', ')}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    )
}

const eventBackgroundColor = (color: string, isDark: boolean): string =>
    isIOS
        ? Color(color)
              .alpha(0.73)
              .lighten(isDark ? 0 : 0.6)
              .darken(isDark ? 0.65 : 0)
              .rgb()
              .string()
        : color

const textColor = (
    color: string,
    background: string,
    isDark: boolean
): string => {
    let textColor = isIOS
        ? Color(color)
              .darken(isDark ? 0 : 0.5)
              .lighten(isDark ? 0.65 : 0)
              .saturate(0.5)
              .hex()
        : getContrastColor(background)

    const contrast = Color(background).contrast(Color(textColor))

    if (contrast < 3.5 && isIOS) {
        textColor = Color(background).isLight() ? '#000000' : '#FFFFFF'
    }
    return textColor
}

const lineColor = (
    color: string,
    eventBackgroundColor: string,
    isDark: boolean
): string =>
    isIOS
        ? Color(color)
              .darken(isDark ? 0.2 : 0)
              .lighten(isDark ? 0 : 0.2)
              .hex()
        : eventBackgroundColor

const stylesheet = createStyleSheet((theme) => ({
    eventContainer: {
        borderRadius: 0,
        flex: 1,
        flexDirection: 'row',
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
        paddingLeft: isIOS ? 3 : 4,
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
    roomRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
}))

export default EventComponent
