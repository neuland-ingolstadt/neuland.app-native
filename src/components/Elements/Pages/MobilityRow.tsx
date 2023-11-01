import { type Colors } from '@/stores/colors'
import { formatFriendlyTime, formatRelativeMinutes } from '@/utils/date-utils'
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
    const infoString = item.name
    const parkingString = item.available + ' available'
    const chargingString = item.available + ' of ' + item.total + ' available'
    const timeString = formatTimes(
        kind === 'bus' ? item.time : item.actualTime,
        30,
        30
    )
    return (
        <Pressable onPress={onPress}>
            <View style={styles.eventContainer}>
                {(kind === 'bus' || kind === 'train') && (
                    <View style={styles.detailsContainer}>
                        <View
                            style={{
                                backgroundColor: colors.labelBackground,
                                borderRadius: 5,
                                padding: 5,
                                marginRight: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: colors.text,
                                    marginBottom: 1,
                                }}
                                numberOfLines={2}
                                textBreakStrategy="highQuality"
                            >
                                {kind === 'bus' ? item.route : item.name}
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 16,
                                color: colors.text,
                                textDecorationLine:
                                    item.canceled === true
                                        ? 'line-through'
                                        : 'none',
                            }}
                            numberOfLines={2}
                        >
                            {item.destination}
                        </Text>
                    </View>
                )}
                <View
                    style={{
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        padding: 5,
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
                        {kind === 'bus' || kind === 'train'
                            ? timeString
                            : infoString}
                    </Text>
                </View>
                {(kind === 'car' || kind === 'ev') && (
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.labelColor,
                            marginBottom: 0,
                            textAlign: 'right',
                        }}
                        numberOfLines={2}
                        textBreakStrategy="highQuality"
                    >
                        {kind === 'car' ? parkingString : chargingString}
                    </Text>
                )}
            </View>
        </Pressable>
    )
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
