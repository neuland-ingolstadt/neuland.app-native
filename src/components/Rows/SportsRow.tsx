import { type UniversitySportsFieldsFragment } from '@/__generated__/gql/graphql'
import useCLParamsStore from '@/hooks/useCLParamsStore'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { sportsCategories } from '@/utils/events-utils'
import { router } from 'expo-router'
import React from 'react'
import { Platform, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import RowEntry from '../Universal/RowEntry'

const SportsRow = ({
    event,
}: {
    event: UniversitySportsFieldsFragment
}): JSX.Element => {
    const { styles, theme } = useStyles(stylesheet)
    const setSelectedSportsEvent = useCLParamsStore(
        (state) => state.setSelectedSportsEvent
    )
    const onPressRow = (): void => {
        setSelectedSportsEvent(event)
        router.navigate('/sportsEvent')
    }
    const dateRange = formatFriendlyTimeRange(event.startTime, event.endTime)
    return (
        <RowEntry
            title={event.title[i18n.language as LanguageKey] ?? ''}
            onPress={onPressRow}
            backgroundColor={theme.colors.card}
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
                            {dateRange}
                        </Text>
                    </View>
                </>
            }
            icon={
                Platform.OS === 'web' ? (
                    <></>
                ) : (
                    <PlatformIcon
                        ios={{
                            name: sportsCategories[event.sportsCategory]
                                .iosIcon,
                            size: 16,
                        }}
                        android={{
                            name: sportsCategories[event.sportsCategory]
                                .androidIcon,
                            size: 22,
                        }}
                        web={{
                            name: 'Dumbbell',
                            size: 22,
                        }}
                        style={styles.toggleIcon}
                    />
                )
            }
            maxTitleWidth={'70%'}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    leftText1: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    leftText2: {
        color: theme.colors.labelColor,
        fontSize: 13,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: theme.margins.rowPadding,
    },
    rightText: {
        color: theme.colors.labelColor,
        fontSize: 14,
        fontWeight: '400',
    },
    toggleIcon: {
        alignSelf: 'center',
        marginRight: 4,
    },
}))

export default SportsRow
