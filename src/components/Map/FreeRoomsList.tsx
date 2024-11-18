import { type AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { InteractionManager, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'

interface FreeRoomsListProps {
    rooms: AvailableRoom[] | null
}

export const FreeRoomsList: React.FC<FreeRoomsListProps> = ({ rooms }) => {
    const { styles } = useStyles(stylesheet)
    const router = useRouter()
    const { t } = useTranslation('common')

    return rooms !== null && rooms.length > 0 ? (
        rooms.map((room, index) => (
            <View key={index}>
                <View style={styles.rowEntry}>
                    <View>
                        <Pressable
                            onPress={() => {
                                router.dismissAll()
                                void InteractionManager.runAfterInteractions(
                                    () => {
                                        router.navigate({
                                            pathname: '(tabs)/map',
                                            params: { room: room.room },
                                        })
                                    }
                                )
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
    errorInfo: {
        color: theme.colors.text,
        fontSize: 14,
        textAlign: 'center',
    },
    errorMessage: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    noRoomsFound: {
        gap: 5,
        paddingVertical: 20,
    },
    roomDetails: {
        color: theme.colors.labelColor,
        fontSize: 13,
    },
    roomName: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    roomTime: {
        color: theme.colors.text,
        fontSize: 15,
    },
    rowEntry: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
}))
