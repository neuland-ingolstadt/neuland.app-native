import Dropdown from '@/components/Elements/Universal/Dropdown'
import { type Colors } from '@/components/colors'
import { type AvailableRoom, type AvailableRoomItem } from '@/types/thi-api'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import Divider from '../Universal/Divider'
import BookButton from './BookingButton'
import BookingFrame from './BookingFrame'

const LibraryBookingView = ({
    item,
    addReservation,
}: {
    colors: Colors
    item: AvailableRoomItem
    addReservation: (
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ) => Promise<void>
}): JSX.Element => {
    function getAvailableRooms(): Array<[string, AvailableRoom, number]> {
        return Object.entries(item.resources)
            .map(
                ([roomId, room], idx) =>
                    [roomId, room, idx] as [string, AvailableRoom, number]
            )
            .filter(
                ([, room]: [string, AvailableRoom, number]) =>
                    room.num_seats > 0
            )
    }
    const colors = useTheme().colors as Colors
    const rooms = getAvailableRooms()
    const allRooms = [
        'Nord (alte Bibliothek)',
        'Süd (neue Bibliothek)',
        'Galerie',
    ]
    const uniqueRoomNames = [
        ...new Set(
            rooms.map((item) => item[1].room_name.replace('Lesesaal ', ''))
        ),
    ]
    const { t } = useTranslation('common')
    const [room, setRoom] = useState<string>(rooms?.[0]?.[0] ?? '')
    const [seat, setSeat] = useState(
        Array.isArray(rooms?.[0]?.[1]?.seats) ? rooms[0][1].seats[0] : ''
    )
    const [seats, setSeats] = useState<string[]>([])

    useEffect(() => {
        const seatsArray =
            item.resources[room]?.seats != null
                ? Object.values(item.resources[room].seats).map((seat) => seat)
                : []
        setSeats(seatsArray)
        setSeat(seatsArray[0])
    }, [room])

    function updateRoom(value: string): void {
        const room = Object.keys(item.resources)?.find((key) =>
            item.resources[key].room_name.includes(value)
        )
        setRoom(room ?? '')
    }

    return (
        <>
            <BookingFrame item={item}>
                <View style={styles.dropdownContainer}>
                    <Text
                        style={{
                            ...styles.leftText2,
                            color: colors.text,
                        }}
                    >
                        {`${t('pages.library.available.room')}:`}
                    </Text>

                    <Dropdown
                        data={uniqueRoomNames}
                        defaultValue={uniqueRoomNames[0]}
                        defaultText={uniqueRoomNames[0].toString()}
                        onSelect={updateRoom}
                        selected={allRooms[Number(room) - 1]}
                        width={200}
                    />
                </View>
                <Divider width={'100%'} color={colors.labelTertiaryColor} />
                <View style={styles.dropdownContainer}>
                    <Text
                        style={{
                            ...styles.leftText2,
                            color: colors.text,
                        }}
                    >
                        {`${t('pages.library.reservations.seat')}:`}
                    </Text>

                    <Dropdown
                        data={seats}
                        defaultValue={seats[0]}
                        defaultText={seats[0]}
                        onSelect={setSeat}
                        selected={seat}
                        width={200}
                    />
                </View>
            </BookingFrame>
            <BookButton
                addReservation={addReservation}
                item={item}
                room={room}
                seat={seat}
            />
        </>
    )
}

const styles = StyleSheet.create({
    dropdownContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftText2: {
        fontSize: 15,
    },
})

export default LibraryBookingView
