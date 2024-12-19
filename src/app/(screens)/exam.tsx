import FormList from '@/components/Universal/FormList'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type FormListSections } from '@/types/components'
import { formatFriendlyDateTime } from '@/utils/date-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function ExamDetail(): React.JSX.Element {
    const { styles } = useStyles(stylesheet)
    const exam = useRouteParamsStore((state) => state.selectedExam)
    const { t } = useTranslation('common')
    const typeSplit =
        exam?.type !== undefined
            ? exam?.type.split('-').slice(-1)[0].trim()
            : ''
    const type =
        typeSplit.length > 1
            ? `${typeSplit[0].toUpperCase()}${typeSplit.slice(1)}`
            : exam?.type
    const examAids = exam?.aids ?? []

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: t('pages.exam.details.date'),
                    value:
                        formatFriendlyDateTime(
                            exam?.date as unknown as string
                        ) ?? undefined,
                },

                {
                    title: t('pages.exam.details.room'),
                    value: exam?.rooms,
                },
                {
                    title: t('pages.exam.details.seat'),
                    value: exam?.seat,
                },
                {
                    title: t('pages.exam.details.tools'),
                    value: (examAids.length > 1
                        ? examAids.map((aid) => {
                              return `- ${aid}`
                          })
                        : examAids
                    ).join('\n'),
                    layout: (exam?.aids?.length ?? 0) <= 1 ? 'row' : 'column',
                },
            ],
        },
        {
            header: t('pages.exam.about.title'),
            items: [
                {
                    title: t('pages.exam.about.type'),
                    value: type,
                },
                {
                    title: t('pages.exam.about.examiner'),
                    value: exam?.examiners?.join(', '),
                },
                {
                    title: t('pages.exam.about.registration'),
                    value:
                        formatFriendlyDateTime(
                            exam?.enrollment as unknown as string
                        ) ?? undefined,
                },
                {
                    title: t('pages.exam.about.notes'),
                    value: exam?.notes,
                },
            ],
        },
    ]

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.container}
        >
            <View style={styles.titleContainer}>
                <Text
                    style={styles.titleText}
                    allowFontScaling={true}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >
                    {exam?.name}
                </Text>
            </View>
            <View style={styles.formList}>
                <FormList sections={sections} />
            </View>
            <View>
                <Text style={styles.notesText}>{t('pages.exam.footer')}</Text>
            </View>
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        gap: 12,
        marginBottom: theme.margins.modalBottomMargin,
    },
    formList: {
        alignSelf: 'center',
        width: '100%',
    },
    notesText: {
        color: theme.colors.labelColor,
        fontSize: 13,
        textAlign: 'left',
    },
    page: {
        padding: theme.margins.page,
    },
    titleContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        paddingHorizontal: 5,
        paddingVertical: 10,
        width: '100%',
    },
    titleText: {
        color: theme.colors.text,
        fontSize: 18,
        textAlign: 'center',
    },
}))
