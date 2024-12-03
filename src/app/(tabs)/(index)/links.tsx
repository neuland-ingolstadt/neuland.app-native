import FormList from '@/components/Universal/FormList'
import { PreferencesContext } from '@/components/contexts'
import { quicklinks } from '@/data/constants'
import { type FormListSections } from '@/types/components'
import { type MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const LinkScreen = (): JSX.Element => {
    const { t } = useTranslation('common')
    const { addRecentQuicklink } = useContext(PreferencesContext)
    const typedQuicklinks = quicklinks as Quicklink[]

    const linkPress = async (key: string, url: string): Promise<void> => {
        addRecentQuicklink(key)
        router.back()
        trackEvent('Quicklink', { link: key })
        await Linking.openURL(url)
    }
    interface Quicklink {
        key: string
        url: string
        icon: {
            ios: string
            android: MaterialIcon
        }
    }
    function generateSections(links: Quicklink[]): FormListSections[] {
        return [
            {
                items: links.map((link) => ({
                    title:
                        // @ts-expect-error Type cannot be verified
                        t(['pages.quicklinks.links.' + link.key, link.key]),
                    icon: { ...link.icon, androidVariant: 'outlined' },

                    onPress: async () => {
                        await linkPress(link.key, link.url)
                    },
                })),
                footer: t('pages.quicklinks.footer'),
            },
        ]
    }

    const sections = generateSections(typedQuicklinks)

    return (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    {t('pages.quicklinks.title')}
                </Text>
            </View>
            <View style={styles.page}>
                <FormList sections={sections} rowStyle={styles.formlistRow} />
            </View>
        </>
    )
}

const styles = StyleSheet.create((theme) => ({
    formlistRow: { marginVertical: 13.5 },
    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.page,
    },
    headerText: {
        color: theme.colors.text,
        fontSize: 23,
        fontWeight: '600',
        paddingBottom: 10,
        paddingTop: 5,
    },
    page: {
        paddingHorizontal: theme.margins.page,
    },
}))

export default LinkScreen
