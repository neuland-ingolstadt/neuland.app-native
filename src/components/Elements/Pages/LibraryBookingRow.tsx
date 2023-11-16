import Dropdown from '@/components/Elements/Universal/Dropdown'
import { type Colors } from '@/components/colors'
import { type AvailableRoom, type AvailableRoomItem } from '@/types/thi-api'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'

import Divider from '../Universal/Divider'

const LibraryBookingRow = ({
    colors,
    item,
    addReservation,
    isExpanded,
    onToggle,
}: {
    colors: Colors
    item: AvailableRoomItem
    addReservation: (
        reservationRoom: string,
        reservationTime: { from: Date; to: Date },
        reservationSeat: string
    ) => Promise<void>
    isExpanded: boolean
    onToggle: () => void
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
    const uniqueRoomNames = [
        ...new Set(
            rooms.map((item) => item[1].room_name.replace('Lesesaal ', ''))
        ),
    ]
    const { t } = useTranslation('common')
    const [collapsed, setCollapsed] = useState(true)
    const [room, setRoom] = useState<string>(rooms[0][0])
    const [seat, setSeat] = useState(
        Array.isArray(rooms[0][1].seats) ? rooms[0][1].seats[0] : ''
    )
    const [seats, setSeats] = useState<string[]>([])

    useEffect(() => {
        setCollapsed(!isExpanded)
    }, [isExpanded])

    useEffect(() => {
        const seatsArray = Object.values(item.resources[room].seats).map(
            (seat) => seat
        )
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
        <View style={{ flexDirection: 'column' }}>
            <Pressable
                onPress={() => {
                    setCollapsed(!collapsed)
                    onToggle()
                }}
                style={styles.eventContainer}
            >
                <View style={[styles.detailsContainer]}>
                    <Text
                        style={{
                            ...styles.timespanText,
                            color: colors.text,
                        }}
                        numberOfLines={2}
                        textBreakStrategy="highQuality"
                    >
                        {`${formatFriendlyTime(
                            item.from
                        )} - ${formatFriendlyTime(item.to)}`}
                    </Text>
                    {
                        <>
                            <Text
                                style={{
                                    ...styles.leftText1,
                                    color: colors.labelColor,
                                }}
                            >
                                {t('pages.library.available.seatsAvailable', {
                                    available: Object.values(
                                        item.resources
                                    ).reduce(
                                        (acc, room) => acc + room.num_seats,
                                        0
                                    ),
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
                            <Ionicons
                                name={collapsed ? 'chevron-up' : 'chevron-down'}
                                size={28}
                                color={colors.primary}
                            />
                        </View>
                    </>
                }
            </Pressable>
            <Collapsible collapsed={collapsed}>
                <View style={styles.reserveContainer}>
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
                            selected={uniqueRoomNames[Number(room) - 1]}
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
                    <Divider width={'100%'} color={colors.labelTertiaryColor} />

                    <View style={styles.confirmContainer}>
                        <Pressable
                            style={{
                                backgroundColor: colors.labelColor,
                                ...styles.bookButton,
                            }}
                            onPress={() => {
                                void addReservation(
                                    room.toString(),
                                    {
                                        from: item.from,
                                        to: item.to,
                                    },
                                    seats[0]
                                )
                            }}
                        >
                            <Text
                                style={{
                                    ...styles.leftText2,
                                    color: getContrastColor(colors.labelColor),
                                }}
                            >
                                {t('pages.library.available.book')}
                            </Text>
                        </Pressable>
                    </View>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.footerText,
                        }}
                    >
                        {t('pages.library.available.footer')}
                    </Text>
                </View>
            </Collapsible>
        </View>
    )
}

const styles = StyleSheet.create({
    confirmContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    dropdownContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reserveContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        gap: 10,
        margin: 5,
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
        fontSize: 17,
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
        borderRadius: 8,
        justifyContent: 'center',
        width: 200,
        height: 32,
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        alignSelf: 'flex-start',
        marginTop: 6,
        width: '100%',
    },
})

export default LibraryBookingRow
