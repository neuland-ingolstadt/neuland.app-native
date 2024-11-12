import FormList from '@/components/Universal/FormList'
import { RouteParamsContext } from '@/components/contexts'
import { type FormListSections } from '@/types/components'
import { type NormalizedLecturer } from '@/types/utils'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function LecturerDetail(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
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
                    textColor: theme.colors.primary,
                    onPress: () => {
                        updateRouteParams(lecturer?.room_short ?? '')
                        router.navigate('(tabs)/map')
                    },
                },
                {
                    title: t('pages.lecturer.contact.phone'),
                    value: lecturer?.tel_dienst,
                    disabled: lecturer?.tel_dienst === '',
                    textColor: theme.colors.primary,
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
                    textColor:
                        (lecturer?.email.includes('@') ?? false)
                            ? theme.colors.primary
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
            <View style={styles.titleContainer}>
                <Text
                    style={styles.titleText}
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

const stylesheet = createStyleSheet((theme) => ({
    formList: {
        alignSelf: 'center',
        width: '100%',
    },
    page: {
        padding: theme.margins.page,
    },
    titleContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        marginBottom: 20,
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
