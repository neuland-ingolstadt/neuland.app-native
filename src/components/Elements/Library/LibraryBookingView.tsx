import Dropdown from '@/components/Elements/Universal/Dropdown'
import { type Colors } from '@/components/colors'
import { type AvailableRoomItem } from '@/types/thi-api'
import { getAvailableRooms } from '@/utils/library-utils'
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
    const colors = useTheme().colors as Colors
    const rooms = getAvailableRooms(item)
    const uniqueRoomNames = [
        ...new Set(
            rooms.map((item) => item[1].room_name.replace('Lesesaal ', ''))
        ),
    ]
    const { t } = useTranslation('common')
    const [room, setRoom] = useState<string>(uniqueRoomNames[0])
    const [seat, setSeat] = useState(
        Array.isArray(rooms?.[0]?.[1]?.seats) ? rooms[0][1].seats[0] : ''
    )
    const [seats, setSeats] = useState<string[]>([])
    const [reset, setReset] = useState(false)

    useEffect(() => {
        // get the key of the room by reverse lookup in uniqueRoomNames
        const roomElement =
            Object.keys(item.resources)?.find((key) =>
                item.resources[key].room_name.includes(room)
            ) ?? ''
        const seatsArray =
            item.resources[roomElement]?.seats != null
                ? Object.values(item.resources[roomElement].seats).map(
                      (seat) => seat
                  )
                : []
        setSeats(seatsArray)
        console.log('seatsArray', seatsArray)
        console.log('seat', seat)
        // if the new room has not the selected seat available, select the first seat
        if (!seatsArray.includes(seat)) {
            alert('seat not available')
            setReset(true)
        } else {
            setReset(false)
        }
    }, [room])

    function updateRoom(value: string): void {
        setRoom(value)
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
                        onSelect={updateRoom}
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
                        onSelect={setSeat}
                        reset={reset}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    leftText2: {
        fontSize: 15,
    },
})

export default LibraryBookingView
