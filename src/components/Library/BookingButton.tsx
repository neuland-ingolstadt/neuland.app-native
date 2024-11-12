import { type AvailableRoomItem } from '@/types/thi-api'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LoadingIndicator from '../Universal/LoadingIndicator'

interface BookingButtonProps {
    addReservation: (
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ) => Promise<void>
    item: AvailableRoomItem
    room: string
    seat: string
}

const BookButton: React.FC<BookingButtonProps> = ({
    addReservation,
    item,
    room,
    seat,
}): JSX.Element => {
    const [reserve, setReserve] = useState(false)
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    return (
        <View style={styles.confirmContainer}>
            <Pressable
                style={styles.bookButton}
                onPress={() => {
                    setReserve(true)
                    void addReservation(
                        Object.keys(item.resources)?.find((key) =>
                            item.resources[key].room_name.includes(room)
                        ) ?? '',
                        {
                            from: item.from,
                            to: item.to,
                        },
                        seat
                    )
                }}
                disabled={reserve}
            >
                <View style={styles.innerButton}>
                    {reserve ? (
                        <LoadingIndicator />
                    ) : (
                        <Text style={styles.leftText2}>
                            {t('pages.library.available.book')}
                        </Text>
                    )}
                </View>
            </Pressable>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    bookButton: {
        alignItems: 'center',
        backgroundColor:
            Platform.OS === 'ios' ? theme.colors.cardButton : theme.colors.card,
        borderRadius: theme.radius.md,
        gap: 5,
        justifyContent: 'center',
        marginTop: 14,
        paddingHorizontal: 33,
        paddingVertical: 12,
    },
    confirmContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    innerButton: { alignItems: 'center', height: 20, width: 100 },
    leftText2: {
        color: theme.colors.text,
        fontSize: 15,
    },
}))

export default BookButton
