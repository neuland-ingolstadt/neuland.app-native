import FormList from '@/components/Elements/Universal/FormList'
import { linkIcon } from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { PAGE_PADDING } from '@/utils/style-utils'
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

    const { license, version, licenseUrl, repository, licenseName } =
        useGlobalSearchParams<{
            license: string
            version: string
            licenseUrl: string
            repository: string
            licenseName: string
        }>()

    console.log(license, version, licenseUrl, repository, licenseName)
    const [licenseText, setLicenseText] = useState('')

    useEffect(() => {
        fetch(licenseUrl as string)
            .then(async (res) => await res.text())
            .then((text) => {
                // check if its text or html
                if (text.includes('<!DOCTYPE html>')) {
                    setLicenseText('')
                } else {
                    setLicenseText(text)
                }
                console.log(text)
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
                    value: licenseName,
                    layout: (licenseName?.length ?? 0) > 25 ? 'column' : 'row',
                },
                {
                    title: 'Version',
                    value: version,
                },
                {
                    title: t('licenses.formlist.license'),
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
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <StatusBar style={getStatusBarStyle()} />
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>

                {licenseText !== '' && (
                    <SectionView title={t('licenses.formlist.license')}>
                        <Text
                            style={{
                                fontSize: 13,
                                color: colors.text,
                                padding: 16,
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
    container: {
        paddingTop: 30,
        paddingBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    logoTextContainer: {
        flexDirection: 'column',
    },
    appTitleContainer: {
        marginBottom: 10,
    },
    formlistContainer: {
        marginTop: 10,
        maringBottom: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    logoIcon: {
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        borderRadius: 9,
    },
    logoImage: {
        flex: 1,
        width: 100,
        height: 100,
        resizeMode: 'contain',
        borderRadius: 9,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
    },
})
