import clubs from '@/data/clubs.json'
import { type Colors } from '@/stores/colors'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const CLEventRow = ({
    colors,
    event,
}: {
    colors: Colors

    event: any
}): JSX.Element => {
    const club = clubs.find((club) => club.club === event.organizer)
    const { t } = useTranslation('common')
    return (
        <RowEntry
            title={event.title}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                        numberOfLines={2}
                    >
                        {event.organizer}
                    </Text>
                    <Text
                        style={{
                            ...styles.leftText2,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {formatFriendlyDateTimeRange(event.begin, event.end)}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {club !== undefined && (
                            <View style={styles.clubContainer}>
                                {club.website !== undefined && (
                                    <Ionicons
                                        name="globe"
                                        size={19}
                                        color={colors.labelSecondaryColor}
                                        style={styles.websiteIcon}
                                        onPress={() => {
                                            void Linking.openURL(club.website)
                                        }}
                                    />
                                )}
                                {club.instagram !== undefined && (
                                    <Ionicons
                                        name="logo-instagram"
                                        size={19}
                                        color={colors.labelSecondaryColor}
                                        onPress={() => {
                                            void Linking.openURL(club.instagram)
                                        }}
                                    />
                                )}
                            </View>
                        )}

                        <Text
                            style={{
                                ...styles.rightText,
                                color: colors.labelColor,
                            }}
                        >
                            {event.begin != null && (
                                <>
                                    {event.end != null &&
                                    event.begin < new Date()
                                        ? `${t(
                                              'dates.until'
                                          )} ${formatFriendlyRelativeTime(
                                              event.end
                                          )}`
                                        : formatFriendlyRelativeTime(
                                              event.begin
                                          )}
                                </>
                            )}
                        </Text>
                    </View>
                </>
            }
            maxTitleWidth={'65%'}
        />
    )
}

const styles = StyleSheet.create({
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    leftText2: {
        fontSize: 13,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 5,
    },
    clubContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    websiteIcon: { marginRight: 7 },
    rightText: {
        fontSize: 14,
        fontWeight: '400',
    },
})

export default CLEventRow
