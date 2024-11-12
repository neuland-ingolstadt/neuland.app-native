import { type AvailableRoomItem } from '@/types/thi-api'
import { formatFriendlyDateTimeRange } from '@/utils/date-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import SectionView from '../Universal/SectionsView'

const BookingFrame = ({
    item,
    children,
}: {
    item: AvailableRoomItem
    children: React.ReactNode
}): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    const availSeats = Object.values(item.resources).reduce(
        (acc, room) => acc + room.num_seats,
        0
    )
    return (
        <SectionView footer={t('pages.library.available.footer')}>
            <View style={styles.reserveContainer}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.leftText2}>
                        {`${t('pages.library.timeSlot')}`}
                    </Text>

                    <Text style={styles.rowRight}>
                        {`${formatFriendlyDateTimeRange(new Date(item.from), new Date(item.to))}`}
                    </Text>
                </View>
                <Divider iosPaddingLeft={16} />
                <View style={styles.dropdownContainer}>
                    <Text style={styles.leftText2}>
                        {t('pages.library.available.available')}
                    </Text>

                    <Text style={styles.rowRight}>
                        {t('pages.library.available.seatsAvailable', {
                            available: availSeats,
                            total: Object.values(item.resources).reduce(
                                (acc, room) => acc + room.maxnum_seats,
                                0
                            ),
                        })}
                    </Text>
                </View>
                <Divider iosPaddingLeft={16} />
                {children}
            </View>
        </SectionView>
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
    reserveContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    rowRight: {
        color: theme.colors.labelColor,
        fontSize: 15,
        textAlign: 'right',
        width: '70%',
    },
}))

export default BookingFrame
