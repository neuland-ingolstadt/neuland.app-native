import { RouteParamsContext } from '@/components/contexts'
import { type AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'

interface FreeRoomsListProps {
    rooms: AvailableRoom[] | null
}

export const FreeRoomsList: React.FC<FreeRoomsListProps> = ({ rooms }) => {
    const { styles } = useStyles(stylesheet)
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
                                router.navigate('(tabs)/map')
                                updateRouteParams(room.room)
                            }}
                        >
                            <Text style={styles.roomName}>{room.room}</Text>
                        </Pressable>
                        <Text style={styles.roomDetails} numberOfLines={1}>
                            {/* eslint-disable-next-line
                            @typescript-eslint/restrict-template-expressions */}
                            {`${t('roomTypes.' + room.type, {
                                defaultValue: room.type,
                                ns: 'api',
                                fallbackLng: 'de',
                            })} (${room.capacity} ${t(
                                'pages.rooms.options.seats'
                            )})`}
                        </Text>
                    </View>

                    <Text style={styles.roomTime} numberOfLines={2}>
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
            <Text style={styles.errorMessage}>
                {t('pages.rooms.noRooms.title')}
            </Text>
            <Text style={styles.errorInfo}>
                {t('pages.rooms.noRooms.subtitle')}
            </Text>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    rowEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 15,
    },
    roomName: {
        fontWeight: '500',
        fontSize: 16,
        color: theme.colors.primary,
    },
    roomDetails: {
        fontSize: 13,
        color: theme.colors.labelColor,
    },
    roomTime: {
        fontSize: 15,
        color: theme.colors.text,
    },
    noRoomsFound: {
        paddingVertical: 20,
        gap: 5,
    },
    errorMessage: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.text,
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        color: theme.colors.text,
    },
}))
