import { type Colors } from '@/components/colors'
import { type CLEvents } from '@/types/neuland-api'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { Buffer } from 'buffer'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const CLEventRow = ({
    colors,
    event,
}: {
    colors: Colors

    event: CLEvents
}): JSX.Element => {
    const { t } = useTranslation('common')
    let begin = null
    if (event.begin !== null) {
        begin = new Date(event.begin)
    }
    const end = event.end !== null ? new Date(event.end) : null

    const onPressRow = (): void => {
        const base64Event = Buffer.from(JSON.stringify(event)).toString(
            'base64'
        )
        router.push('(pages)/event')
        router.setParams({ clEventEntry: base64Event })
    }
    return (
        <RowEntry
            title={event.title}
            colors={colors}
            onPress={onPressRow}
            leftChildren={
                <>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                        numberOfLines={2}
                    >
                        {event.organizer}
                    </Text>
                    <Text
                        style={{
                            ...styles.leftText2,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {formatFriendlyDateTimeRange(begin, end)}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        <Text
                            style={{
                                ...styles.rightText,
                                color: colors.labelColor,
                            }}
                        >
                            {begin != null && (
                                <>
                                    {end != null && begin < new Date()
                                        ? `${t(
                                              'dates.ends'
                                          )} ${formatFriendlyRelativeTime(end)}`
                                        : formatFriendlyRelativeTime(begin)}
                                </>
                            )}
                        </Text>
                    </View>
                </>
            }
            maxTitleWidth={'70%'}
        />
    )
}

const styles = StyleSheet.create({
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    leftText2: {
        fontSize: 13,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: ROW_PADDING,
    },
    rightText: {
        fontSize: 14,
        fontWeight: '400',
    },
})

export default CLEventRow
