import { type AvailableRoomItem } from '@/types/thi-api'
import { formatFriendlyTime } from '@/utils/date-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

const LibrarySlotRow = ({
    item,
    onExpand,
}: {
    item: AvailableRoomItem
    onExpand: () => void
}): JSX.Element => {
    const { t } = useTranslation('common')
    const date = new Date()
    const { styles } = useStyles(stylesheet)
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
                    <Text style={styles.timespanText} numberOfLines={2}>
                        {timespanText}
                    </Text>
                    {
                        <>
                            <Text style={styles.leftText1}>
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
                                    ios={{
                                        name: 'plus',

                                        size: 20,
                                    }}
                                    android={{
                                        name: 'add',
                                        size: 26,
                                    }}
                                />
                            ) : (
                                <PlatformIcon
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

const stylesheet = createStyleSheet((theme) => ({
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
        color: theme.colors.labelColor,
    },

    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 5,
    },
    timespanText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 1,
    },

    container: { flexDirection: 'column' },
}))

export default LibrarySlotRow
