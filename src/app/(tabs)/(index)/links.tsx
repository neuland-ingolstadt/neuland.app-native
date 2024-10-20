import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/components/colors'
import { PreferencesContext } from '@/components/contexts'
import { quicklinks } from '@/data/constants'
import { type FormListSections } from '@/types/components'
import { type MaterialIcon } from '@/types/material-icons'
import { PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'

const LinkScreen = (): JSX.Element => {
    const colors = useTheme().colors as Colors
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
                <Text
                    style={{
                        ...styles.headerText,
                        color: colors.text,
                    }}
                >
                    {t('pages.quicklinks.title')}
                </Text>
            </View>
            <View
                style={{
                    paddingHorizontal: PAGE_PADDING,
                }}
            >
                <FormList sections={sections} rowStyle={styles.formlistRow} />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    formlistRow: { marginVertical: 13.5 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: PAGE_PADDING,
    },
    headerText: {
        fontSize: 23,
        fontWeight: '600',
        paddingTop: 5,
        paddingBottom: 10,
    },
})

export default LinkScreen
