import { type Colors } from '@/stores/colors'
import { formatFriendlyTime } from '@/utils/date-utils'
import { type AvailableRoom } from '@/utils/room-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import Divider from '../Universal/Divider'

interface FreeRoomsListProps {
    rooms: AvailableRoom[] | null
}

export const FreeRoomsList: React.FC<FreeRoomsListProps> = ({ rooms }) => {
    const colors = useTheme().colors as Colors
    const router = useRouter()
    return rooms !== null && rooms.length > 0 ? (
        rooms.map((room, index) => (
            <View key={index}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: colors.card,
                        padding: 10,
                        marginHorizontal: 10,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            paddingRight: 10,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                router.push('(tabs)/map')
                                router.setParams({
                                    q: room.room,
                                    h: 'true',
                                })
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: '500',
                                    color: colors.primary,
                                    fontSize: 16,
                                }}
                            >
                                {room.room}
                            </Text>
                        </Pressable>
                        <Text
                            style={{
                                fontSize: 13,
                                color: colors.labelColor,
                            }}
                            numberOfLines={2}
                        >
                            {room.type}
                        </Text>
                    </View>

                    <Text
                        style={{
                            fontSize: 15,
                            color: colors.text,
                            width: '40%',
                            textAlign: 'right',
                        }}
                        numberOfLines={2}
                    >
                        {formatFriendlyTime(room.from)} -{' '}
                        {formatFriendlyTime(room.until)}
                    </Text>
                </View>

                {index !== rooms.length - 1 ? <Divider /> : null}
            </View>
        ))
    ) : (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 30,
            }}
        >
            <Text style={[styles.errorMessage, { color: colors.text }]}>
                No free rooms found
            </Text>
            <Text style={[styles.errorInfo, { color: colors.text }]}>
                Try changing the filters
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '92%',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 15,
    },
    centeredView: {},
    sectionHeader: {
        fontSize: 13,

        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    errorMessage: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    dropdownButton: {
        borderRadius: 8,
        width: 90,
        height: 32,
        justifyContent: 'center',
    },
    dropdownStyle: {
        height: 250,
        borderRadius: 8,
    },
})
