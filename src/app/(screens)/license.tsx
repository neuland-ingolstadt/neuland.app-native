import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import { type FormListSections } from '@/types/components'
import { useGlobalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function License(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation(['settings'])

    const { license, version, licenseUrl, repository, name } =
        useGlobalSearchParams<{
            license: string
            version: string
            licenseUrl: string
            repository: string
            name: string
        }>()

    const [licenseText, setLicenseText] = useState('')

    useEffect(() => {
        if (licenseUrl === undefined || licenseUrl === '') {
            return
        }
        fetch(licenseUrl)
            .then(async (res) => await res.text())
            .then((text) => {
                // sometimes the license is not a text file, but the whole repo page
                if (text.includes('<!DOCTYPE html>')) {
                    setLicenseText('')
                } else {
                    setLicenseText(text)
                }
            })
            .catch((error) => {
                console.warn('Failed to fetch license text:', error)
            })
    }, [licenseUrl])

    const sections: FormListSections[] = [
        {
            header: t('menu.formlist.legal.about'),
            items: [
                {
                    title: 'Name',
                    value: name,
                    layout: (name?.length ?? 0) > 25 ? 'column' : 'row',
                },
                {
                    title: 'Version',
                    value: version,
                },
                {
                    title: t('navigation.license', { ns: 'navigation' }),
                    value: license,
                    onPress: async () => {
                        if (licenseUrl !== undefined) {
                            await Linking.openURL(licenseUrl)
                        }
                    },
                    disabled: licenseUrl === '',
                },
                {
                    title: 'Repository',
                    icon: linkIcon,
                    onPress: async () => {
                        if (repository !== undefined) {
                            await Linking.openURL(repository)
                        }
                    },
                    disabled: repository === '',
                },
            ],
        },
    ]
    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>

                {licenseText !== '' && (
                    <SectionView
                        title={t('navigation.license', { ns: 'navigation' })}
                    >
                        <Text style={styles.text}>{licenseText}</Text>
                    </SectionView>
                )}
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        paddingBottom: theme.margins.modalBottomMargin,
    },
    formlistContainer: {
        alignSelf: 'center',
        marginBottom: 16,
        marginTop: 10,
        paddingHorizontal: theme.margins.page,
        width: '100%',
    },
    text: {
        color: theme.colors.text,
        fontSize: 13,
        padding: 16,
    },
}))
