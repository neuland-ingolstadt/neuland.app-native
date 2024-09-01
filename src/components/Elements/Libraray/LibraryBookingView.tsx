import Dropdown from '@/components/Elements/Universal/Dropdown'
import { type Colors } from '@/components/colors'
import { type AvailableRoom, type AvailableRoomItem } from '@/types/thi-api'
import {
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
    formatFriendlyTime,
} from '@/utils/date-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { use } from 'i18next'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    HStack,
    Picker,
    Spacer,
    Text as SwiftText,
    VStack,
    useBinding,
} from 'swiftui-react-native'

import Divider from '../Universal/Divider'
import SectionView from '../Universal/SectionsView'

const LibraryBookinView = ({
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
    const allRooms = [
        'Nord (alte Bibliothek)',
        'Süd (neue Bibliothek)',
        'Galerie',
    ]
    const uniqueRoomNames = [...new Set(rooms.map((item) => item[1].room_name))]
    const { t } = useTranslation('common')
    const [room, setRoom] = useState<string>(uniqueRoomNames[0])
    const [seat, setSeat] = useState(
        Array.isArray(rooms?.[0]?.[1]?.seats) ? rooms[0][1].seats[0] : ''
    )
    const [seats, setSeats] = useState<string[]>([])
    const [reserve, setReserve] = useState(false)
    console.log('roomwrwrgs', rooms?.[0]?.[0])
    const roomBindung = useBinding(uniqueRoomNames[0])
    const seatBindung = useBinding(seat)
    useEffect(() => {
        // get the key of the room by reverse lookup in uniqueRoomNames
        const room =
            Object.keys(item.resources)?.find((key) =>
                item.resources[key].room_name.includes(roomBindung.value)
            ) ?? ''
        console.log('asgdfgsdfgh', room)
        const seatsArray =
            item.resources[room]?.seats != null
                ? Object.values(item.resources[room].seats).map((seat) => seat)
                : []
        console.log('seatsArray', seatsArray)
        setSeats(seatsArray)
        // seatBindung.setValue(seatsArray[0])
    }, [roomBindung.value])

    function updateRoom(value: string): void {
        const room = Object.keys(item.resources)?.find((key) =>
            item.resources[key].room_name.includes(value)
        )
        roomBindung.setValue(room)
    }

    const availSeats = Object.values(item.resources).reduce(
        (acc, room) => acc + room.num_seats,
        0
    )

    return (
        <>
            <SectionView footer={t('pages.library.available.footer')}>
                <View style={styles.reserveContainer}>
                    <View style={styles.dropdownContainer}>
                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.text,
                            }}
                        >
                            {`${t('pages.library.timeSlot')}`}
                        </Text>

                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.labelColor,
                                width: '70%',
                                textAlign: 'right',
                            }}
                        >
                            {`${formatFriendlyDateTimeRange(
                                item.from,
                                item.to
                            )}`}
                        </Text>
                    </View>
                    <Divider
                        color={colors.labelTertiaryColor}
                        iosPaddingLeft={16}
                    />
                    <View style={styles.dropdownContainer}>
                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.text,
                            }}
                        >
                            Available
                        </Text>

                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.labelColor,
                                width: '70%',
                                textAlign: 'right',
                            }}
                        >
                            {t('pages.library.available.seatsAvailable', {
                                available: availSeats,
                                total: Object.values(item.resources).reduce(
                                    (acc, room) => acc + room.maxnum_seats,
                                    0
                                ),
                            })}
                        </Text>
                    </View>
                    <Divider
                        color={colors.labelTertiaryColor}
                        iosPaddingLeft={16}
                    />
                    <View style={styles.dropdownContainer}>
                        {/* <Dropdown
                data={uniqueRoomNames}
                defaultValue={uniqueRoomNames[0]}
                defaultText={uniqueRoomNames[0].toString()}
                onSelect={updateRoom}
                selected={allRooms[Number(room) - 1]}
                width={200}
            /> */}

                        <Picker
                            selection={roomBindung}
                            pickerStyle="wheel"
                            tint={colors.primary}
                            style={{
                                width: '75%',
                            }}
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
                            style={{
                                width: '25%',
                            }}
                            scaleEffect={0.9}
                        >
                            {seats.map((option) => (
                                <Text key={option}>{option}</Text>
                            ))}
                        </Picker>
                    </View>
                </View>
            </SectionView>
            <View style={styles.confirmContainer}>
                <Pressable
                    style={{
                        backgroundColor: colors.cardButton,
                        ...styles.bookButton,
                    }}
                    onPress={() => {
                        setReserve(true)
                        void addReservation(
                            Object.keys(item.resources)?.find((key) =>
                                item.resources[key].room_name.includes(
                                    roomBindung.value
                                )
                            ) ?? '',
                            {
                                from: item.from,
                                to: item.to,
                            },
                            seatBindung.value
                        )
                    }}
                    disabled={reserve}
                >
                    <View
                        style={{ width: 100, alignItems: 'center', height: 20 }}
                    >
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
        </>
    )
}

const styles = StyleSheet.create({
    confirmContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    reserveContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
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
    },
    leftText2: {
        fontSize: 15,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 5,
    },
    timespanText: {
        fontSize: 16,
        fontWeight: '600',

        marginBottom: 1,
    },
    bookButton: {
        marginTop: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 12,
        paddingHorizontal: 33,
    },
    footerText: {
        alignSelf: 'flex-start',
        marginTop: 6,
        width: '100%',
    },
    container: {
        flexDirection: 'column',
        marginHorizontal: 5,
        borderRadius: 8,
    },
})

export default LibraryBookinView
