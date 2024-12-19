import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type LanguageKey } from '@/localization/i18n'
import { type Calendar } from '@/types/data'
import { type Exam } from '@/types/utils'
import {
    formatFriendlyDate,
    formatFriendlyDateRange,
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const CalendarRow = ({ event }: { event: Calendar }): React.JSX.Element => {
    const { t, i18n } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    return (
        <RowEntry
            title={event.name[i18n.language as LanguageKey]}
            leftChildren={
                <Text style={styles.leftText} numberOfLines={2}>
                    {event.hasHours === true
                        ? formatFriendlyDateTimeRange(
                              event.begin,
                              event.end ?? null
                          )
                        : formatFriendlyDateRange(event.begin, event.end)}
                </Text>
            }
            rightChildren={
                <View style={styles.rightContainer}>
                    <Text style={styles.rightText}>
                        {event.begin != null && (
                            <>
                                {event.end != null && event.begin < new Date()
                                    ? `${t(
                                          'dates.ends'
                                      )} ${formatFriendlyRelativeTime(
                                          event.end
                                      )}`
                                    : formatFriendlyRelativeTime(event.begin)}
                            </>
                        )}
                    </Text>
                </View>
            }
            maxTitleWidth={'60%'}
        />
    )
}

const ExamRow = ({ event }: { event: Exam }): React.JSX.Element => {
    const setExam = useRouteParamsStore((state) => state.setSelectedExam)
    const { styles } = useStyles(stylesheet)

    const navigateToPage = (): void => {
        setExam(event)
        router.navigate('/exam')
    }

    const { t } = useTranslation('common')
    const showDetails =
        formatFriendlyDateTime(event.date) != null ||
        event.rooms !== '' ||
        event.seat != null

    return (
        <RowEntry
            title={event.name}
            leftChildren={
                showDetails ? (
                    <>
                        <Text style={styles.mainText1} numberOfLines={2}>
                            {formatFriendlyDateTime(event.date)}
                        </Text>
                        <Text style={styles.mainText2} numberOfLines={2}>
                            {`${t('pages.exam.details.room')}: ${event.rooms ?? 'n/a'}`}
                        </Text>
                        <Text style={styles.mainText2} numberOfLines={2}>
                            {`${t('pages.exam.details.seat')}: ${event.seat ?? 'n/a'}`}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.mainText1} numberOfLines={2}>
                        {`${t('pages.exam.about.registration')}: ${formatFriendlyDate(event.enrollment)}`}
                    </Text>
                )
            }
            rightChildren={
                <View style={styles.rightContainerExam}>
                    <Text style={styles.rightTextExam}>
                        {formatFriendlyRelativeTime(new Date(event.date))}
                    </Text>
                </View>
            }
            onPress={navigateToPage}
            maxTitleWidth={'70%'}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    leftText: {
        color: theme.colors.labelColor,
        fontSize: 13,
    },
    mainText1: {
        color: theme.colors.text,
        fontSize: 13,
    },
    mainText2: {
        color: theme.colors.labelColor,
        fontSize: 13,
    },
    rightContainer: {
        justifyContent: 'flex-end',
        padding: theme.margins.rowPadding,
    },
    rightContainerExam: { justifyContent: 'flex-end', padding: 5 },
    rightText: {
        color: theme.colors.labelColor,
        fontSize: 14,
        fontWeight: '400',
    },
    rightTextExam: {
        color: theme.colors.labelColor,
        fontSize: 14,
        fontWeight: '400',
    },
}))

export { CalendarRow, ExamRow }
