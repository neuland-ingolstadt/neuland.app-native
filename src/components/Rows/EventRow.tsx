import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import useCLParamsStore from '@/hooks/useCLParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { CLEvents } from '@/types/neuland-api'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const CLEventRow = ({
    event,
}: {
    event: CampusLifeEventFieldsFragment
}): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const setSelectedClEvent = useCLParamsStore(
        (state) => state.setSelectedClEvent
    )
    const { t, i18n } = useTranslation('common')
    let begin = null
    if (event.startDateTime != null) {
        begin = new Date(event.startDateTime)
    }
    const end = event.endDateTime != null ? new Date(event.endDateTime) : null

    const onPressRow = (): void => {
        setSelectedClEvent(event as CLEvents)
        router.navigate({
            pathname: '/cl-event',
        })
    }
    return (
        <RowEntry
            title={event.titles[i18n.language as LanguageKey] ?? ''}
            onPress={onPressRow}
            leftChildren={
                <>
                    <Text style={styles.leftText1} numberOfLines={2}>
                        {event.host.name}
                    </Text>
                    <Text style={styles.leftText2} numberOfLines={2}>
                        {formatFriendlyDateTimeRange(begin, end)}
                    </Text>
                </>
            }
            rightChildren=<View style={styles.rightContainer}>
                <Text style={styles.rightText}>
                    {begin != null &&
                        (end != null && begin < new Date()
                            ? `${t('dates.ends')} ${formatFriendlyRelativeTime(end)}`
                            : formatFriendlyRelativeTime(begin))}
                </Text>
            </View>
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
}))

export default CLEventRow
