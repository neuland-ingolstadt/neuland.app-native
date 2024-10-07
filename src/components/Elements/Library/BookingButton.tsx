import { type Colors } from '@/components/colors'
import { type AvailableRoomItem } from '@/types/thi-api'
import { useTheme } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

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
    const colors = useTheme().colors as Colors
    return (
        <View style={styles.confirmContainer}>
            <Pressable
                style={{
                    backgroundColor:
                        Platform.OS === 'ios' ? colors.cardButton : colors.card,
                    ...styles.bookButton,
                }}
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
                        <ActivityIndicator
                            size={'small'}
                            color={colors.primary}
                        />
                    ) : (
                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.text,
                            }}
                        >
                            {t('pages.library.available.book')}
                        </Text>
                    )}
                </View>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    bookButton: {
        marginTop: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 12,
        paddingHorizontal: 33,
    },
    innerButton: { width: 100, alignItems: 'center', height: 20 },
    confirmContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    leftText2: {
        fontSize: 15,
    },
})

export default BookButton
