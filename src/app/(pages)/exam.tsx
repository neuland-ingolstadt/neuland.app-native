import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { type Exam } from '@/utils/calendar-utils'
import { formatFriendlyDateTime } from '@/utils/date-utils'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function ExamDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { examEntry } = useLocalSearchParams<{ examEntry: string }>()
    const exam: Exam | undefined =
        examEntry != null ? JSON.parse(examEntry) : undefined

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: 'Date',
                    value: formatFriendlyDateTime(exam?.date),
                    disabled: true,
                },

                {
                    title: 'Room',
                    value: exam?.rooms,
                    disabled: true,
                },
                {
                    title: 'Seat',
                    value: exam?.seat,
                    disabled: true,
                },
                {
                    title: 'Tools',
                    value: exam?.aids?.join(', '),
                    disabled: true,
                },
            ],
        },
        {
            header: 'About',
            items: [
                {
                    title: 'Type',
                    value: exam?.type,
                    disabled: true,
                },
                {
                    title: 'Examiner',
                    value: exam?.examiners?.join(', '),
                    disabled: true,
                },
                {
                    title: 'Registered',
                    value: formatFriendlyDateTime(exam?.enrollment),
                    disabled: true,
                },
                {
                    title: 'Notes',
                    value: exam?.notes,
                    disabled: true,
                },
            ],
        },
    ]

    return (
        <ScrollView>
            <StatusBar style="light" animated={true} hidden={false} />
            <View
                style={[
                    styles.titleContainer,
                    { backgroundColor: colors.card },
                ]}
            >
                <Text
                    style={[styles.titleText, { color: colors.text }]}
                    allowFontScaling={true}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >
                    {exam?.name}
                </Text>
            </View>
            <View style={[styles.formList]}>
                <FormList sections={sections} />
            </View>
            <View style={styles.notesContainer}>
                <Text style={[styles.notesText, { color: colors.labelColor }]}>
                    All information without guarantee. Binding information is
                    only available directly from the THI.
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    formList: {
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    titleContainer: {
        alignSelf: 'center',
        width: '92%',
        marginTop: 20,
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        textAlign: 'center',
    },
    notesContainer: {
        alignSelf: 'center',
        width: '92%',
        marginTop: 20,
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'justify',
        fontSize: 13,
    },
})
