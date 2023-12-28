import { type Colors } from '@/components/colors'
import { RouteParamsContext } from '@/components/provider'
import { type AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import Divider from '../Universal/Divider'

interface FreeRoomsListProps {
    rooms: AvailableRoom[] | null
}

export const FreeRoomsList: React.FC<FreeRoomsListProps> = ({ rooms }) => {
    const colors = useTheme().colors as Colors
    const router = useRouter()
    const { updateRouteParams } = useContext(RouteParamsContext)
    const { t } = useTranslation('common')
    return rooms !== null && rooms.length > 0 ? (
        rooms.map((room, index) => (
            <View key={index}>
                <View style={styles.rowEntry}>
                    <View>
                        <Pressable
                            onPress={() => {
                                router.replace('(tabs)/map')
                                updateRouteParams(room.room)
                            }}
                        >
                            <Text
                                style={[
                                    styles.roomName,
                                    { color: colors.primary },
                                ]}
                            >
                                {room.room}
                            </Text>
                        </Pressable>
                        <Text
                            style={[
                                styles.roomDetails,
                                { color: colors.labelColor },
                            ]}
                            numberOfLines={1}
                        >
                            {/* eslint-disable-next-line
                            @typescript-eslint/restrict-template-expressions */}
                            {`${t('roomTypes.' + room.type, {
                                defaultValue: room.type,
                                ns: 'api',
                                fallbackLng: 'de',
                            })}
                            (${room.capacity} ${t(
                                'pages.rooms.options.seats'
                            )})`}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.roomTime,
                            {
                                color: colors.text,
                            },
                        ]}
                        numberOfLines={2}
                    >
                        {formatFriendlyTime(room.from)} -{' '}
                        {formatFriendlyTime(room.until)}
                    </Text>
                </View>

                {index !== rooms.length - 1 ? (
                    <Divider iosPaddingLeft={16} />
                ) : null}
            </View>
        ))
    ) : (
        <View style={styles.noRoomsFound}>
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
    rowEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 15,
        // technically 15, but balance feels better with 20
        paddingRight: 20,
        paddingVertical: 8,
        gap: 15,
    },
    roomName: {
        fontWeight: '500',
        fontSize: 16,
    },
    roomDetails: {
        fontSize: 13,
    },
    roomTime: {
        fontSize: 15,
    },
    noRoomsFound: {
        paddingVertical: 20,
        gap: 5,
    },
    errorMessage: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
    },
})
