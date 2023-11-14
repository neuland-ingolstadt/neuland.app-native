import { type Colors } from '@/components/colors'
import { formatFriendlyTime, formatRelativeMinutes } from '@/utils/date-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

// Work in progress
const MobilityRow = ({
    kind,
    item,
    colors,
    onPress,
    detailed,
}: {
    kind: string
    item: any // TODO: Add correct type
    colors: Colors
    detailed: boolean

    onPress?: () => void
}): JSX.Element => {
    /**
     * Formats the time difference between the current time and the given time.
     * @param {string} time - The time to format.
     * @param {number} cardMin - The number of minutes to show relative time for on the card.
     * @param {number} detailedMin - The number of minutes to relative time for in the detailed view.
     * @param {boolean} detailed - Whether to return a detailed time string (card vs page)
     * @returns {string} The formatted time string.
     */
    function formatTimes(
        time: string | number | Date,
        cardMin: number,
        detailedMin: number
    ): string {
        const cardMs = cardMin * 60 * 1000
        const detailedMs = detailedMin * 60 * 1000
        const actualTime = new Date(time)
        const timeDifference = Number(actualTime) - Number(new Date())
        let timeString

        if (detailed) {
            timeString = `${formatFriendlyTime(actualTime)} ${
                timeDifference < detailedMs
                    ? `- ${formatRelativeMinutes(actualTime)}`
                    : ''
            }`
        } else {
            if (timeDifference > cardMs) {
                timeString = formatFriendlyTime(actualTime)
            } else {
                timeString = `in ${formatRelativeMinutes(actualTime)}`
            }
        }
        return timeString
    }

    if (kind === 'bus') {
        const timeString = formatTimes(item.time, 30, 30)
        return (
            <Pressable onPress={onPress}>
                <View style={styles.eventContainer}>
                    <View style={styles.detailsContainer}>
                        <View
                            style={{
                                backgroundColor: colors.labelBackground,
                                borderRadius: 5,
                                padding: ROW_PADDING,
                                marginRight: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: colors.text,
                                    marginBottom: 1,
                                    textAlign: 'center',
                                }}
                                numberOfLines={2}
                                textBreakStrategy="highQuality"
                            >
                                {item.route}
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 16,
                                color: colors.text,
                            }}
                            numberOfLines={2}
                        >
                            {item.destination}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            padding: ROW_PADDING,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: colors.labelColor,
                                marginBottom: 1,
                            }}
                            numberOfLines={2}
                            textBreakStrategy="highQuality"
                        >
                            {timeString}
                        </Text>
                    </View>
                </View>
            </Pressable>
        )
    } else {
        // TODO: Add other mobility types
        return <></>
    }
}

const styles = StyleSheet.create({
    eventContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    detailsContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '60%',
    },
})

export default MobilityRow
