import { type Colors } from '@/components/colors'
import { type Reservation } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

import PlatformIcon from '../Universal/Icon'
import RowEntry from '../Universal/RowEntry'

const LibraryReservationRow = ({
    colors,
    reservation,
    deleteReservation,
}: {
    colors: Colors
    reservation: Reservation
    deleteReservation: (id: string) => Promise<void>
}): JSX.Element => {
    const { t } = useTranslation('common')
    const [deleting, setDeleting] = useState<boolean>(false)

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
                    text: t(deleting ? '' : 'misc.delete'),
                    style: 'destructive',
                    onPress: () => {
                        setDeleting(true)

                        void deleteReservation(
                            reservation.reservation_id
                        ).finally(() => {
                            setDeleting(false)
                        })
                    },
                },
            ]
        )
    }

    return (
        <RowEntry
            title={reservation.rcategory}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                    >
                        {`${t('pages.library.reservations.seat')} ${
                            reservation.resource
                        }`}
                    </Text>
                    <Text
                        style={{
                            ...styles.leftText1,
                            color: colors.labelColor,
                        }}
                    >
                        {formatFriendlyDateTimeRange(
                            reservation.start,
                            reservation.end
                        )}
                    </Text>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText2,
                        }}
                    >
                        {`${t('pages.library.reservations.id')}: ${
                            reservation.reservation_id
                        } (${reservation.resource_id})`}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {!deleting ? (
                            <Pressable
                                onPress={() => {
                                    deleteAlert()
                                }}
                            >
                                <PlatformIcon
                                    color={colors.notification}
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
                        ) : (
                            <ActivityIndicator
                                color={colors.labelSecondaryColor}
                            />
                        )}
                    </View>
                </>
            }
            maxTitleWidth={'65%'}
        />
    )
}

const styles = StyleSheet.create({
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
    },
    leftText2: {
        marginTop: 2,
        fontSize: 14,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 5,
    },
})

export default LibraryReservationRow
