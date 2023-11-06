import clubs from '@/assets/data/clubs.json'
import { type Colors } from '@/stores/colors'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Text, View } from 'react-native'

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
                            fontSize: 15,
                            color: colors.labelColor,
                            fontWeight: '500',
                            marginBottom: 4,
                        }}
                        numberOfLines={2}
                    >
                        {event.organizer}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
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
                    <View
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: 5,
                        }}
                    >
                        {club !== undefined && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                {club.website !== undefined && (
                                    <Ionicons
                                        name="globe"
                                        size={19}
                                        color={colors.labelSecondaryColor}
                                        style={{ marginRight: 7 }}
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
                                fontSize: 14,
                                fontWeight: '400',
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
        />
    )
}

export default CLEventRow
