import FormList from '@/components/Universal/FormList'
import { chevronIcon, linkIcon } from '@/components/Universal/Icon'
import { IMPRINT_URL, PRIVACY_URL } from '@/data/constants'
import type { FormListSections } from '@/types/components'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function About(): React.JSX.Element {
    const router = useRouter()
    const { styles } = useStyles(stylesheet)
    const { t, i18n } = useTranslation(['settings'])

    const sections: FormListSections[] = [
        {
            header: t('about.formlist.legal.title'),
            items: [
                {
                    title: t('legal.formlist.legal.privacy'),
                    icon: linkIcon,
                    onPress: async () =>
                        (await Linking.openURL(PRIVACY_URL)) as Promise<void>,
                },
                {
                    title: t('legal.formlist.legal.imprint'),
                    icon: linkIcon,
                    onPress: async () =>
                        (await Linking.openURL(IMPRINT_URL)) as Promise<void>,
                },
                {
                    title: t('navigation.licenses.title', { ns: 'navigation' }),
                    icon: chevronIcon,
                    onPress: () => {
                        router.navigate('/licenses')
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
                        (await Linking.openURL(
                            'https://neuland-ingolstadt.de/'
                        )) as Promise<void>,
                },
                {
                    title: t('legal.formlist.us.source'),
                    icon: {
                        ios: 'safari',
                        android: 'github',
                        web: 'Github',
                    },

                    onPress: async () =>
                        (await Linking.openURL(
                            'https://github.com/neuland-ingolstadt/neuland.app-native'
                        )) as Promise<void>,
                },
                {
                    title: t('legal.formlist.us.faq'),
                    icon: {
                        ios: 'safari',
                        android: 'link',
                        web: 'Link',
                    },

                    onPress: async () =>
                        (await Linking.openURL(
                            `https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}app/faq`
                        )) as Promise<void>,
                },
            ],
        },
    ]

    return (
        <>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: {
        paddingBottom: theme.margins.bottomSafeArea,
    },
    formlistContainer: {
        alignSelf: 'center',
        marginTop: 10,
        paddingHorizontal: theme.margins.page,
        width: '100%',
    },
}))
