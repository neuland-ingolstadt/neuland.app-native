import { type Colors } from '@/components/colors'
import { type LanguageKey } from '@/localization/i18n'
import { type Calendar } from '@/types/data'
import {
    formatFriendlyDateRange,
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const CalendarRow = ({
    event,
    colors,
}: {
    event: Calendar
    colors: Colors
}): JSX.Element => {
    const { t, i18n } = useTranslation('common')

    return (
        <RowEntry
            title={event.name[i18n.language as LanguageKey]}
            colors={colors}
            leftChildren={
                <Text
                    style={{
                        ...styles.leftText,
                        color: colors.labelColor,
                    }}
                    numberOfLines={2}
                >
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
                    <Text
                        style={{
                            ...styles.rightText,
                            color: colors.labelColor,
                        }}
                    >
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

const ExamRow = ({
    event,
    colors,
}: {
    event: any
    colors: Colors
}): JSX.Element => {
    const navigateToPage = (): void => {
        router.push({
            pathname: '(pages)/exam',
            params: { examEntry: JSON.stringify(event) },
        })
    }
    const { t } = useTranslation('common')

    return (
        <RowEntry
            title={event.name}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            ...styles.mainText,
                            color: colors.text,
                        }}
                        numberOfLines={2}
                    >
                        {formatFriendlyDateTime(event.date)}
                    </Text>
                    <Text
                        style={{
                            ...styles.mainText,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {`${t('pages.exam.details.room')}: ${
                            event.room !== undefined ? event.room : 'n/a'
                        }`}
                    </Text>
                    <Text
                        style={{
                            ...styles.mainText,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {`${t('pages.exam.details.seat')}: ${
                            event.seat !== null ? event.seat : 'n/a'
                        }`}
                    </Text>
                </>
            }
            rightChildren={
                <View style={styles.rightContainerExam}>
                    <Text
                        style={{
                            ...styles.rightTextExam,
                            color: colors.labelColor,
                        }}
                    >
                        {formatFriendlyRelativeTime(event.date)}
                    </Text>
                </View>
            }
            onPress={navigateToPage}
            maxTitleWidth={'70%'}
        />
    )
}

const styles = StyleSheet.create({
    rightContainer: { justifyContent: 'flex-end', padding: ROW_PADDING },
    rightContainerExam: { justifyContent: 'flex-end', padding: 5 },
    leftText: {
        fontSize: 13,
    },
    rightTextExam: {
        fontSize: 14,
        fontWeight: '400',
    },
    rightText: {
        fontSize: 14,
        fontWeight: '400',
    },
    mainText: {
        fontSize: 13,
    },
})

export { CalendarRow, ExamRow }
