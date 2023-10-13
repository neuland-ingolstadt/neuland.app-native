import { type Colors } from '@/stores/colors'
import {
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const EventRow = ({
    event,
    colors,
}: {
    event: any
    colors: Colors
}): JSX.Element => {
    return (
        <RowEntry
            title={event.name.en}
            colors={colors}
            leftChildren={
                <Text
                    style={{
                        fontSize: 13,
                        color: colors.labelColor,
                    }}
                    numberOfLines={2}
                >
                    {formatFriendlyDateTimeRange(
                        event.begin,
                        event.end ?? null
                    )}
                </Text>
            }
            rightChildren={
                <View style={{ justifyContent: 'flex-end', padding: 5 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '400',
                            color: colors.labelColor,
                        }}
                    >
                        {event.begin != null && (
                            <>
                                {event.end != null && event.begin < new Date()
                                    ? `ends ${formatFriendlyRelativeTime(
                                          event.end
                                      )}`
                                    : formatFriendlyRelativeTime(event.begin)}
                            </>
                        )}
                    </Text>
                </View>
            }
        />
    )
}

const ExamRow = ({
    event,
    colors,
}: {
    event: any
    colors: Colors
}): JSX.Element => {
    const navigateToPage = (): void => {
        router.push({
            pathname: '(pages)/exam',
            params: { examEntry: JSON.stringify(event) },
        })
    }

    return (
        <RowEntry
            title={event.name}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.text,
                        }}
                        numberOfLines={2}
                    >
                        {formatFriendlyDateTime(event.date)}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        Room: {event.rooms}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        Seat: {event.seat}
                    </Text>
                </>
            }
            rightChildren={
                <View style={{ justifyContent: 'flex-end', padding: 5 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '400',
                            color: colors.labelColor,
                        }}
                    >
                        {formatFriendlyRelativeTime(event.date)}
                    </Text>
                </View>
            }
            onPress={navigateToPage}
        />
    )
}

export { EventRow, ExamRow }
