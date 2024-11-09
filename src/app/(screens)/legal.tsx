import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon, linkIcon } from '@/components/Elements/Universal/Icon'
import { IMPRINT_URL, PRIVACY_URL } from '@/data/constants'
import { type FormListSections } from '@/types/components'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'

export default function About(): JSX.Element {
    const router = useRouter()
    const { t, i18n } = useTranslation(['settings'])

    const sections: FormListSections[] = [
        {
            header: t('about.formlist.legal.title'),
            items: [
                {
                    title: t('legal.formlist.legal.privacy'),
                    icon: linkIcon,
                    onPress: async () => await Linking.openURL(PRIVACY_URL),
                },
                {
                    title: t('legal.formlist.legal.imprint'),
                    icon: linkIcon,
                    onPress: async () => await Linking.openURL(IMPRINT_URL),
                },
                {
                    title: t('navigation.licenses.title', { ns: 'navigation' }),
                    icon: chevronIcon,
                    onPress: () => {
                        router.navigate('licenses')
                    },
                },
            ],
        },
        {
            header: t('legal.formlist.us.title'),
            items: [
                {
                    title: 'Neuland Ingolstadt e.V.',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL('https://neuland-ingolstadt.de/'),
                },
                {
                    title: t('legal.formlist.us.source'),
                    icon: {
                        ios: 'safari',
                        android: 'github',
                    },

                    onPress: async () =>
                        await Linking.openURL(
                            'https://github.com/neuland-ingolstadt/neuland.app-native'
                        ),
                },
                {
                    title: t('legal.formlist.us.faq'),
                    icon: {
                        ios: 'safari',
                        android: 'github',
                    },

                    onPress: async () =>
                        await Linking.openURL(
                            `https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}app/faq`
                        ),
                },
            ],
        },
    ]

    return (
        <>
            <ScrollView
                contentContainerStyle={{ paddingBottom: PAGE_BOTTOM_SAFE_AREA }}
            >
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    formlistContainer: {
        marginTop: 10,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
})
