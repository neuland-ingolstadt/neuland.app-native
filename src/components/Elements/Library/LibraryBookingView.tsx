import Dropdown from '@/components/Elements/Universal/Dropdown'
import { type AvailableRoomItem } from '@/types/thi-api'
import { getAvailableRooms } from '@/utils/library-utils'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import BookButton from './BookingButton'
import BookingFrame from './BookingFrame'

const LibraryBookingView = ({
    item,
    addReservation,
}: {
    item: AvailableRoomItem
    addReservation: (
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ) => Promise<void>
}): JSX.Element => {
    const { styles } = useStyles(stylesheet)
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
        // if the new room has not the selected seat available, select the first seat
        if (!seatsArray.includes(seat)) {
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
                    <Text style={styles.leftText2}>
                        {`${t('pages.library.available.room')}:`}
                    </Text>

                    <Dropdown
                        data={uniqueRoomNames}
                        defaultValue={uniqueRoomNames[0]}
                        onSelect={updateRoom}
                        width={200}
                    />
                </View>
                <Divider width={'100%'} />
                <View style={styles.dropdownContainer}>
                    <Text style={styles.leftText2}>
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

const stylesheet = createStyleSheet((theme) => ({
    dropdownContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        width: '100%',
    },
    leftText2: {
        color: theme.colors.text,
        fontSize: 15,
    },
}))

export default LibraryBookingView
