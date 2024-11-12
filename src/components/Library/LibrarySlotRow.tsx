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
    container: { flexDirection: 'column' },
    detailsContainer: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        maxWidth: '70%',
        padding: 5,
    },
    eventContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    leftText1: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontWeight: '500',
        marginTop: 2,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 5,
    },

    timespanText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 1,
    },
}))

export default LibrarySlotRow
