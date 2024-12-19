import FormList from '@/components/Universal/FormList'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { type FormListSections } from '@/types/components'
import { formatFriendlyDateTime } from '@/utils/date-utils'
import * as Calendar from 'expo-calendar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
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

    async function checkPermissions() {
        const { granted } = await Calendar.getCalendarPermissionsAsync()

        if (!granted) {
            const { status } = await Calendar.requestCalendarPermissionsAsync()
            console.log(status)
            return status === 'granted'
        }
        return granted
    }

    const onPressExport = async () => {
        if (!exam?.date) {
            return
        }
        Alert.alert(
            t('pages.exam.calendar.warning.title'),
            t('pages.exam.calendar.warning.message'),
            [
                {
                    text: t('misc.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('misc.continue'),
                    onPress: async () => {
                        const granted = await checkPermissions()
                        if (!granted) {
                            return false
                        }
                        const duration = Number(type?.match(/\d+/)?.[0] ?? 90)
                        await Calendar.createEventInCalendarAsync({
                            title: t('pages.exam.calendar.exam', {
                                title: exam?.name,
                            }),
                            startDate: new Date(exam?.date),
                            endDate: new Date(
                                new Date(exam?.date).getTime() +
                                    duration * 60 * 1000
                            ),
                            location: exam?.rooms,
                            notes: `${t('pages.exam.about.type')}: ${type}\n${t('pages.exam.details.tools')}: ${exam?.aids?.join(', ')}\n\n${t('pages.exam.calendar.note')}`,
                        })
                    },
                },
            ],
            { cancelable: false }
        )
    }

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
            {exam?.date && Platform.OS !== 'web' && (
                <Pressable style={styles.button} onPress={onPressExport}>
                    <Text style={styles.buttonText}>
                        {t('pages.exam.calendar.add')}
                    </Text>
                </Pressable>
            )}
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    button: {
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        marginBottom: theme.margins.modalBottomMargin,
        marginTop: theme.margins.page,
        padding: 12,
        paddingHorizontal: 24,
    },
    buttonText: {
        color: theme.colors.primary,
        fontSize: 16,
    },
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
