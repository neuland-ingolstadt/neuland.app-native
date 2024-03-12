import FormList from '@/components/Elements/Universal/FormList'
import { linkIcon } from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function License(): JSX.Element {
    const colors = useTheme().colors as Colors
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
        fetch(licenseUrl as string)
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
                    onPress: async () =>
                        await Linking.openURL(licenseUrl as string),
                    disabled: licenseUrl === '',
                },
                {
                    title: 'Repository',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL(repository as string),
                    disabled: repository === '',
                },
            ],
        },
    ]
    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <StatusBar style={getStatusBarStyle()} />
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>

                {licenseText !== '' && (
                    <SectionView
                        title={t('navigation.license', { ns: 'navigation' })}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.text,
                            }}
                        >
                            {licenseText}
                        </Text>
                    </SectionView>
                )}
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    formlistContainer: {
        marginTop: 10,
        marginBottom: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    text: {
        padding: 16,
        fontSize: 13,
    },
    container: {
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
})
