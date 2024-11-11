import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LogoSVG from '../Flow/svgs/logo'
import PlatformIcon from '../Universal/Icon'
import DetailsBody from './DetailsBody'
import DetailsRow from './DetailsRow'
import DetailsSymbol from './DetailsSymbol'
import Separator from './Separator'

interface ShareCardProps {
    event: FriendlyTimetableEntry
}

export default function ShareCard({ event }: ShareCardProps): JSX.Element {
    const { styles } = useStyles(stylesheet)

    const { t } = useTranslation('timetable')

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    return (
        <View style={styles.wrapper}>
            <DetailsRow>
                <DetailsSymbol>
                    <View style={styles.eventColorCircle} />
                </DetailsSymbol>

                <DetailsBody>
                    <Text numberOfLines={2} style={styles.title}>
                        {event.name}
                    </Text>

                    <Text style={styles.shortName}>{event.shortName}</Text>
                </DetailsBody>
            </DetailsRow>

            <Separator />

            <DetailsRow>
                <DetailsSymbol>
                    <PlatformIcon
                        ios={{
                            name: 'clock',
                            size: 21,
                        }}
                        android={{
                            name: 'calendar_month',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <Text style={styles.text1}>
                        {formatFriendlyDate(startDate, {
                            weekday: 'long',
                            relative: false,
                        })}
                    </Text>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.text2}>
                            {formatFriendlyTime(startDate)}
                        </Text>

                        <PlatformIcon
                            ios={{
                                name: 'chevron.forward',
                                size: 12,
                            }}
                            android={{
                                name: 'chevron_right',
                                size: 16,
                            }}
                            style={styles.icon}
                        />

                        <Text style={styles.text2}>
                            {formatFriendlyTime(endDate)}
                        </Text>

                        <Text style={styles.text3}>
                            {`(${moment(endDate).diff(
                                moment(startDate),
                                'minutes'
                            )} ${t('time.minutes')})`}
                        </Text>
                    </View>
                </DetailsBody>
            </DetailsRow>

            <Separator />

            <DetailsRow>
                <DetailsSymbol>
                    <PlatformIcon
                        ios={{
                            name: 'mappin.and.ellipse',
                            size: 21,
                        }}
                        android={{
                            name: 'place',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <View style={styles.roomContainer}>
                        {event.rooms.map((room, i) => (
                            <Text key={i} style={styles.text1}>
                                {room}
                            </Text>
                        ))}
                    </View>
                </DetailsBody>
            </DetailsRow>

            <Separator />

            <DetailsRow>
                <DetailsSymbol>
                    <PlatformIcon
                        ios={{
                            name: 'person',
                            size: 21,
                        }}
                        android={{
                            name: 'person',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <Text style={styles.text1}>{event.lecturer}</Text>
                </DetailsBody>
            </DetailsRow>

            <View style={styles.waterMark}>
                <LogoSVG size={24} />
                <Text style={styles.waterMarkText}>{'Neuland Next'}</Text>
            </View>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    wrapper: {
        aspectRatio: 1,
        height: 350,
        paddingTop: 24,
        paddingRight: 24,
        paddingLeft: 6,
        gap: 4,
        display: 'flex',
        backgroundColor: theme.colors.background,
    },
    eventColorCircle: {
        width: 15,
        aspectRatio: 1,
        borderRadius: 9999,
        backgroundColor: theme.colors.primary,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: theme.colors.text,
    },
    shortName: {
        fontSize: 16,
        color: theme.colors.labelColor,
    },
    text1: {
        fontSize: 18,
        color: theme.colors.text,
    },
    text2: {
        fontSize: 14,
        color: theme.colors.text,
    },
    text3: {
        fontSize: 14,
        color: theme.colors.labelColor,
    },
    detailsContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    roomContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
    },
    waterMark: {
        position: 'absolute',
        bottom: 16,
        right: 24,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    waterMarkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    icon: {
        color: theme.colors.labelColor,
    },
}))
