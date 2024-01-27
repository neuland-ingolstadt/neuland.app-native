import { type Colors } from '@/components/colors'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

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
    const colors = useTheme().colors as Colors

    const { t } = useTranslation('timetable')

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    return (
        <View
            style={{
                ...styles.wrapper,
                backgroundColor: colors.background,
            }}
        >
            <DetailsRow>
                <DetailsSymbol>
                    <View
                        style={{
                            ...styles.eventColorCircle,
                            backgroundColor: colors.primary,
                        }}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <Text
                        numberOfLines={2}
                        style={{
                            ...styles.title,
                            color: colors.text,
                        }}
                    >
                        {event.name}
                    </Text>

                    <Text
                        style={{
                            ...styles.shortName,
                            color: colors.labelColor,
                        }}
                    >
                        {event.shortName}
                    </Text>
                </DetailsBody>
            </DetailsRow>

            <Separator />

            <DetailsRow>
                <DetailsSymbol>
                    <PlatformIcon
                        color={colors.labelColor}
                        ios={{
                            name: 'clock',
                            size: 21,
                        }}
                        android={{
                            name: 'calendar_month',
                            size: 24,
                        }}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <Text
                        style={{
                            ...styles.text1,
                            color: colors.text,
                        }}
                    >
                        {formatFriendlyDate(startDate, {
                            weekday: 'long',
                            relative: false,
                        })}
                    </Text>

                    <View style={styles.detailsContainer}>
                        <Text
                            style={{
                                ...styles.text2,
                                color: colors.text,
                            }}
                        >
                            {formatFriendlyTime(startDate)}
                        </Text>

                        <PlatformIcon
                            color={colors.labelColor}
                            ios={{
                                name: 'chevron.forward',
                                size: 12,
                            }}
                            android={{
                                name: 'chevron_right',
                                size: 16,
                            }}
                        />

                        <Text
                            style={{
                                ...styles.text2,
                                color: colors.text,
                            }}
                        >
                            {formatFriendlyTime(endDate)}
                        </Text>

                        <Text
                            style={{
                                ...styles.text2,
                                color: colors.labelColor,
                            }}
                        >
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
                        color={colors.labelColor}
                        ios={{
                            name: 'mappin.and.ellipse',
                            size: 21,
                        }}
                        android={{
                            name: 'place',
                            size: 24,
                        }}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <View style={styles.roomContainer}>
                        {event.rooms.map((room, i) => (
                            <Text
                                key={i}
                                style={{
                                    ...styles.text1,
                                    color: colors.text,
                                }}
                            >
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
                        color={colors.labelColor}
                        ios={{
                            name: 'person',
                            size: 21,
                        }}
                        android={{
                            name: 'person',
                            size: 24,
                        }}
                    />
                </DetailsSymbol>

                <DetailsBody>
                    <Text
                        style={{
                            ...styles.text1,
                            color: colors.text,
                        }}
                    >
                        {event.lecturer}
                    </Text>
                </DetailsBody>
            </DetailsRow>

            <View style={styles.waterMark}>
                <LogoSVG size={24} />
                <Text
                    style={{
                        ...styles.waterMarkText,
                        color: colors.text,
                    }}
                >
                    {'Neuland Next'}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        aspectRatio: 1,
        height: 350,
        paddingTop: 24,
        paddingRight: 24,
        paddingLeft: 6,
        gap: 4,
        display: 'flex',
    },
    eventColorCircle: {
        width: 15,
        aspectRatio: 1,
        borderRadius: 9999,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    shortName: {
        fontSize: 16,
    },
    text1: {
        fontSize: 18,
    },
    text2: {
        fontSize: 14,
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
    },
})
