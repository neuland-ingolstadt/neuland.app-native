import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/components/colors'
import { RouteParamsContext } from '@/components/contexts'
import { type FormListSections } from '@/types/components'
import { type NormalizedLecturer } from '@/types/utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function LecturerDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { lecturerEntry } = useLocalSearchParams<{ lecturerEntry: string }>()
    const lecturer: NormalizedLecturer | undefined =
        lecturerEntry != null ? JSON.parse(lecturerEntry) : undefined
    const { t } = useTranslation('common')
    const { updateRouteParams } = useContext(RouteParamsContext)

    const validEmail =
        lecturer?.email === '' || !(lecturer?.email.includes('@') ?? false)

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: 'Name',
                    value: `${lecturer?.vorname ?? ''} ${lecturer?.name ?? ''}`,
                },
                {
                    title: t('pages.lecturer.details.title'),
                    value: lecturer?.titel,
                },
                {
                    title: t('pages.lecturer.details.organization'),
                    value: t(
                        // @ts-expect-error cannot verify the TFunktion type
                        `lecturerOrganizations.${lecturer?.organisation}`,
                        {
                            defaultValue: lecturer?.organisation,
                            ns: 'api',
                            fallbackLng: 'de',
                        }
                    ),
                },

                {
                    title: t('pages.lecturer.details.function'),
                    value: t(
                        // @ts-expect-error cannot verify the TFunktion type
                        `lecturerFunctions.${lecturer?.funktion}`,
                        {
                            defaultValue: lecturer?.funktion,
                            ns: 'api',
                            fallbackLng: 'de',
                        }
                    ),
                },
            ],
        },
        {
            header: t('pages.lecturer.contact.title'),
            items: [
                {
                    title: t('pages.lecturer.contact.room'),
                    value: lecturer?.room_short,
                    disabled: lecturer?.room_short === '',
                    iconColor: colors.primary,
                    onPress: () => {
                        updateRouteParams(lecturer?.room_short ?? '')
                        router.navigate('(tabs)/map')
                    },
                },
                {
                    title: t('pages.lecturer.contact.phone'),
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
                    title: 'E-Mail',
                    value: lecturer?.email,
                    disabled: validEmail,
                    layout: validEmail ? 'column' : 'row',
                    iconColor:
                        lecturer?.email.includes('@') ?? false
                            ? colors.primary
                            : undefined,
                    onPress: () => {
                        void Linking.openURL(`mailto:${lecturer?.email ?? ''}`)
                    },
                },
                {
                    title: t('pages.lecturer.contact.office'),
                    value: lecturer?.sprechstunde,
                    layout:
                        (lecturer?.sprechstunde?.length ?? 0) <= 20
                            ? 'row'
                            : 'column',
                },
                {
                    title: t('pages.lecturer.contact.exam'),
                    value: lecturer?.einsichtnahme,
                    layout:
                        (lecturer?.einsichtnahme?.length ?? 0) <= 20
                            ? 'row'
                            : 'column',
                },
            ],
        },
    ]

    return (
        <ScrollView style={styles.page}>
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
            <View style={styles.formList}>
                <FormList sections={sections} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    formList: {
        width: '100%',
        alignSelf: 'center',
    },
    titleContainer: {
        marginBottom: 20,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        textAlign: 'center',
    },
})
