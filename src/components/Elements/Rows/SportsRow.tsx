import { type Colors } from '@/components/colors'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { type UniversitySports } from '@/types/neuland-api'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { sportsCategories } from '@/utils/events-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { Buffer } from 'buffer'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'
import RowEntry from '../Universal/RowEntry'

const SportsRow = ({
    colors,
    event,
}: {
    colors: Colors

    event: UniversitySports
}): JSX.Element => {
    const onPressRow = (): void => {
        const base64Event = Buffer.from(JSON.stringify(event)).toString(
            'base64'
        )
        router.navigate('sportsEvent')
        router.setParams({ sportsEventEntry: base64Event })
    }

    return (
        <RowEntry
            title={event.title[i18n.language as LanguageKey]}
            colors={colors}
            onPress={onPressRow}
            backgroundColor={colors.card}
            leftChildren={
                <>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                        numberOfLines={1}
                    >
                        {event.location}
                    </Text>

                    <Text
                        style={{
                            ...styles.rightText,
                            color: colors.labelColor,
                        }}
                    >
                        {event.campus}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        <Text
                            style={{
                                ...styles.leftText2,
                                color: colors.labelColor,
                            }}
                            numberOfLines={2}
                        >
                            {formatFriendlyTimeRange(
                                event.startTime,
                                event.endTime
                            )}
                        </Text>
                    </View>
                </>
            }
            icon={
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: sportsCategories[event.sportsCategory].iosIcon,
                        size: 16,
                    }}
                    android={{
                        name: sportsCategories[event.sportsCategory]
                            .androidIcon,
                        size: 22,
                    }}
                    style={styles.toggleIcon}
                />
            }
            maxTitleWidth={'70%'}
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
        justifyContent: 'flex-end',
        padding: ROW_PADDING,
    },
    rightText: {
        fontSize: 14,
        fontWeight: '400',
    },
    toggleIcon: {
        marginRight: 4,
        alignSelf: 'center',
    },
})

export default SportsRow
