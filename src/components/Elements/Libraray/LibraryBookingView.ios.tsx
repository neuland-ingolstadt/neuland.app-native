import { type Colors } from '@/components/colors'
import { type AvailableRoom, type AvailableRoomItem } from '@/types/thi-api'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Picker, useBinding } from 'swiftui-react-native'

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
    const rooms = getAvailableRooms()
    const colors = useTheme().colors as Colors
    const uniqueRoomNames = [...new Set(rooms.map((item) => item[1].room_name))]
    const [seats, setSeats] = useState<string[]>([])
    const roomBindung = useBinding(uniqueRoomNames[0])
    const seatBindung = useBinding(
        Array.isArray(rooms?.[0]?.[1]?.seats) ? rooms[0][1].seats[0] : ''
    )
    useEffect(() => {
        // get the key of the room by reverse lookup in uniqueRoomNames
        const room =
            Object.keys(item.resources)?.find((key) =>
                item.resources[key].room_name.includes(roomBindung.value)
            ) ?? ''
        const seatsArray =
            item.resources[room]?.seats != null
                ? Object.values(item.resources[room].seats).map((seat) => seat)
                : []
        setSeats(seatsArray)
        // if the new room has not the selected seat available, select the first seat
        if (!seatsArray.includes(seatBindung.value)) {
            seatBindung.value = seatsArray[0]
        }
    }, [roomBindung.value])

    return (
        <>
            <BookingFrame item={item}>
                <View style={styles.dropdownContainer}>
                    <Picker
                        selection={roomBindung}
                        pickerStyle="wheel"
                        tint={colors.primary}
                        style={styles.locationPicker}
                        lineLimit={1}
                        scaleEffect={0.9}
                    >
                        {uniqueRoomNames.map((option) => (
                            <Text key={option}>{option}</Text>
                        ))}
                    </Picker>
                    <Picker
                        selection={seatBindung}
                        tint={colors.primary}
                        pickerStyle="wheel"
                        style={styles.seatPicker}
                        scaleEffect={0.9}
                    >
                        {seats.map((option) => (
                            <Text key={option}>{option}</Text>
                        ))}
                    </Picker>
                </View>
            </BookingFrame>
            <BookButton
                addReservation={addReservation}
                item={item}
                room={roomBindung.value}
                seat={seatBindung.value}
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
    locationPicker: {
        width: '75%',
    },
    seatPicker: {
        width: '25%',
    },
})

export default LibraryBookingView
