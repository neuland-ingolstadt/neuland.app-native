import { type Colors } from '@/components/colors'
import { type AvailableRoomItem } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import Divider from '../Universal/Divider'
import SectionView from '../Universal/SectionsView'

const BookingFrame = ({
    item,
    children,
}: {
    item: AvailableRoomItem
    children: React.ReactNode
}): JSX.Element => {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')

    const availSeats = Object.values(item.resources).reduce(
        (acc, room) => acc + room.num_seats,
        0
    )
    console.log('availSeats', item)
    return (
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
                            ...styles.rowRight,
                        }}
                    >
                        {`${formatFriendlyDateTimeRange(new Date(item.from), new Date(item.to))}`}
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
                        {t('pages.library.available.available')}
                    </Text>

                    <Text
                        style={{
                            ...styles.leftText2,
                            ...styles.rowRight,
                            color: colors.labelColor,
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
                {children}
            </View>
        </SectionView>
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
    reserveContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

    leftText2: {
        fontSize: 15,
    },
    rowRight: {
        width: '70%',
        textAlign: 'right',
    },
})

export default BookingFrame
