import { type Reservation } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import RowEntry from '../Universal/RowEntry'

const LibraryReservationRow = ({
    reservation,
    deleteReservation,
}: {
    reservation: Reservation
    deleteReservation: (id: string) => Promise<void>
}): JSX.Element => {
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    const deleteAlert = (): void => {
        Alert.alert(
            t('pages.library.reservations.alert.title'),
            t('pages.library.reservations.alert.message'),
            [
                {
                    text: t('misc.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('misc.delete'),
                    style: 'destructive',
                    onPress: () => {
                        void deleteReservation(reservation.reservation_id)
                    },
                },
            ]
        )
    }

    return (
        <RowEntry
            title={reservation.rcategory}
            leftChildren={
                <>
                    <Text style={styles.leftText1}>
                        {`${t('pages.library.reservations.seat')} ${
                            reservation.resource
                        }`}
                    </Text>
                    <Text style={styles.leftText1}>
                        {formatFriendlyDateTimeRange(
                            new Date(reservation.start),
                            new Date(reservation.end)
                        )}
                    </Text>
                    <Text style={styles.leftText2}>
                        {`${t('pages.library.reservations.id')}: ${
                            reservation.reservation_id
                        }`}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {
                            <Pressable
                                onPress={() => {
                                    deleteAlert()
                                }}
                            >
                                <PlatformIcon
                                    style={styles.notification}
                                    ios={{
                                        name: 'trash',
                                        size: 18,
                                    }}
                                    android={{
                                        name: 'delete',
                                        size: 24,
                                    }}
                                />
                            </Pressable>
                        }
                    </View>
                </>
            }
            maxTitleWidth={'75%'}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.labelColor,
    },
    leftText2: {
        marginTop: 2,
        fontSize: 14,
        color: theme.colors.labelColor,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 5,
    },
    notification: {
        color: theme.colors.notification,
    },
}))

export default LibraryReservationRow
