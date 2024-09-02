import { type Colors } from '@/components/colors'
import { type AvailableRoomItem } from '@/types/thi-api'
import { formatFriendlyTime } from '@/utils/date-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

const LibrarySlotRow = ({
    colors,
    item,
    onExpand,
    index,
}: {
    colors: Colors
    item: AvailableRoomItem
    onExpand: () => void
    index: number
}): JSX.Element => {
    const { t } = useTranslation('common')
    const date = new Date()
    const availSeats = Object.values(item.resources).reduce(
        (acc, room) => acc + room.num_seats,
        0
    )

    const timespanText =
        date > item.from
            ? `${t('dates.now')} - ${formatFriendlyTime(item.to)}`
            : `${formatFriendlyTime(
                  item.from
              )} - ${formatFriendlyTime(item.to)}`

    return (
        <View style={styles.container}>
            <Pressable
                disabled={availSeats === 0}
                onPress={() => {
                    onExpand()
                }}
                style={styles.eventContainer}
            >
                <View style={styles.detailsContainer}>
                    <Text
                        style={{
                            ...styles.timespanText,
                            color: colors.text,
                        }}
                        numberOfLines={2}
                    >
                        {timespanText}
                    </Text>
                    {
                        <>
                            <Text
                                style={{
                                    ...styles.leftText1,
                                    color: colors.labelColor,
                                }}
                            >
                                {t('pages.library.available.seatsAvailable', {
                                    available: availSeats,
                                    total: Object.values(item.resources).reduce(
                                        (acc, room) => acc + room.maxnum_seats,
                                        0
                                    ),
                                })}
                            </Text>
                        </>
                    }
                </View>

                {
                    <>
                        <View style={styles.rightContainer}>
                            {availSeats !== 0 ? (
                                <PlatformIcon
                                    color={colors.primary}
                                    ios={{
                                        name: 'plus',

                                        size: 20,
                                    }}
                                    android={{
                                        name: 'expand_less',
                                        size: 26,
                                    }}
                                />
                            ) : (
                                <PlatformIcon
                                    color={colors.primary}
                                    ios={{
                                        name: 'clock.badge.xmark',
                                        size: 20,
                                    }}
                                    android={{
                                        name: 'search_off',
                                        size: 26,
                                    }}
                                />
                            )}
                        </View>
                    </>
                }
            </Pressable>
        </View>
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
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 5,
        maxWidth: '70%',
    },
    leftText1: {
        marginTop: 2,
        fontSize: 15,
        fontWeight: '500',
    },

    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 5,
    },
    timespanText: {
        fontSize: 16,
        fontWeight: '600',

        marginBottom: 1,
    },

    container: { flexDirection: 'column' },
})

export default LibrarySlotRow
