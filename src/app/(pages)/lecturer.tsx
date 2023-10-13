import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { type NormalizedLecturer } from '@/utils/lecturers-utils'
import { useTheme } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function LecturerDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { lecturerEntry } = useLocalSearchParams<{ lecturerEntry: string }>()
    const lecturer: NormalizedLecturer | undefined =
        lecturerEntry != null ? JSON.parse(lecturerEntry) : undefined

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: 'Name',
                    value: `${lecturer?.vorname ?? ''} ${lecturer?.name ?? ''}`,
                    disabled: true,
                },
                {
                    title: 'Title',
                    value: lecturer?.titel,
                    disabled: true,
                },
                {
                    title: 'Organization',
                    value: lecturer?.organisation,
                    disabled: true,
                },

                {
                    title: 'Function',
                    value: lecturer?.funktion,
                    disabled: true,
                },
            ],
        },
        {
            header: 'Contact',
            items: [
                {
                    title: 'Room',
                    value: lecturer?.room_short,
                    disabled: lecturer?.room_short === '',
                    iconColor: colors.primary,
                    onPress: () => {
                        router.push('(tabs)/map')
                        router.setParams({
                            q: lecturer?.room_short ?? '',
                            h: 'true',
                        })
                    },
                },
                {
                    title: 'E-Mail',
                    value: lecturer?.email,
                    disabled:
                        lecturer?.email === '' ||
                        !(lecturer?.email.includes('@') ?? false),
                    iconColor:
                        lecturer?.email.includes('@') ?? false
                            ? colors.primary
                            : undefined,
                    onPress: () => {
                        void Linking.openURL(`mailto:${lecturer?.email ?? ''}`)
                    },
                },
                {
                    title: 'Phone',
                    value: lecturer?.tel_dienst,
                    disabled: lecturer?.tel_dienst === '',
                    iconColor: colors.primary,
                    onPress: () => {
                        void Linking.openURL(
                            `tel:${
                                lecturer?.tel_dienst?.replace(/\s+/g, '') ?? ''
                            }`
                        )
                    },
                },
                {
                    title: 'Office Hours',
                    value: lecturer?.sprechstunde,
                    disabled: true,
                },
                {
                    title: 'Exam Insigths',
                    value: lecturer?.einsichtnahme,
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
                    {`${[lecturer?.titel, lecturer?.vorname, lecturer?.name]
                        .join(' ')
                        .trim()}`}
                </Text>
            </View>
            <FormList sections={sections} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
