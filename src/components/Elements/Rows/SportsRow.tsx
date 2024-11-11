import i18n, { type LanguageKey } from '@/localization/i18n'
import { type UniversitySports } from '@/types/neuland-api'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { sportsCategories } from '@/utils/events-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { Buffer } from 'buffer/'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import RowEntry from '../Universal/RowEntry'

const SportsRow = ({ event }: { event: UniversitySports }): JSX.Element => {
    const { styles } = useStyles(stylesheet)
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
            onPress={onPressRow}
            backgroundColor={styles.background.backgroundColor}
            leftChildren={
                <>
                    <Text style={styles.leftText1} numberOfLines={1}>
                        {event.location}
                    </Text>

                    <Text style={styles.rightText}>{event.campus}</Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        <Text style={styles.leftText2} numberOfLines={2}>
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

const stylesheet = createStyleSheet((theme) => ({
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
        color: theme.colors.labelColor,
    },
    leftText2: {
        fontSize: 13,
        color: theme.colors.labelColor,
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
    background: {
        backgroundColor: theme.colors.card,
    },
}))

export default SportsRow
