import { type Colors } from '@/components/colors'
import clubs from '@/data/clubs.json'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'
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
                                    <Pressable
                                        onPress={() => {
                                            void Linking.openURL(club.website)
                                        }}
                                        style={styles.websiteIcon}
                                    >
                                        <PlatformIcon
                                            color={colors.labelSecondaryColor}
                                            ios={{
                                                name: 'safari',
                                                size: 16,
                                            }}
                                            android={{
                                                name: 'link',
                                                size: 19,
                                            }}
                                        />
                                    </Pressable>
                                )}
                                {club.instagram !== undefined && (
                                    <Pressable
                                        onPress={() => {
                                            void Linking.openURL(club.instagram)
                                        }}
                                    >
                                        <PlatformIcon
                                            color={colors.labelSecondaryColor}
                                            ios={{
                                                name: 'logo-instagram',
                                                size: 18,
                                                fallback: true,
                                            }}
                                            android={{
                                                name: 'instagram',
                                                size: 19,
                                            }}
                                        />
                                    </Pressable>
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
        padding: ROW_PADDING,
    },
    clubContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    websiteIcon: {
        marginRight: 6,
    },
    rightText: {
        fontSize: 14,
        fontWeight: '400',
    },
})

export default CLEventRow
