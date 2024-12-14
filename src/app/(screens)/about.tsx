import FormList from '@/components/Universal/FormList'
import { chevronIcon, linkIcon } from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker'
import { PRIVACY_URL, STATUS_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import i18n from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import { trackEvent } from '@aptabase/react-native'
import * as Application from 'expo-application'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function About(): JSX.Element {
    const router = useRouter()
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation(['settings'])

    const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
    const setAnalyticsAllowed = useFlowStore(
        (state) => state.setAnalyticsAllowed
    )

    const unlockedAppIcons = usePreferencesStore(
        (state) => state.unlockedAppIcons
    )
    const addUnlockedAppIcon = usePreferencesStore(
        (state) => state.addUnlockedAppIcon
    )
    const version = `${Application.nativeApplicationVersion}`
    const versionWithCode = `${version} (${Application.nativeBuildVersion})`
    const [displayVersion, setDisplayVersion] = useState(version)

    const toggleVersion = (): void => {
        setDisplayVersion((prev) =>
            prev === version ? versionWithCode : version
        )
    }

    const sections: FormListSections[] = [
        {
            header: 'App',
            items: [
                {
                    title: 'Version',
                    value: displayVersion,
                    onPress: toggleVersion,
                    selectable: true,
                },
                {
                    title: 'Changelog',
                    icon: chevronIcon,
                    onPress: () => {
                        router.navigate('/changelog')
                    },
                },
                {
                    title: 'System Status',
                    icon: {
                        ios: 'bubble.left.and.exclamationmark.bubble.right',
                        android: 'troubleshoot',
                        web: 'HeartPulse',
                    },
                    onPress: () => {
                        void Linking.openURL(STATUS_URL)
                    },
                },
            ],
        },
        {
            header: t('about.formlist.contact.title'),
            items: [
                {
                    title: t('about.formlist.contact.feedback'),
                    icon: {
                        ios: 'envelope',
                        android: 'mail',
                        web: 'Mail',
                    },
                    onPress: async () =>
                        await Linking.openURL(
                            'mailto:app-feedback@informatik.sexy?subject=Feedback%20Neuland-Next'
                        ),
                },
                {
                    title: 'App Website',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL(
                            `https://next.neuland.app/${i18n.language === 'en' ? 'en/' : ''}`
                        ),
                },
                {
                    title:
                        Platform.OS === 'ios'
                            ? t('about.formlist.contact.rateiOS')
                            : t('about.formlist.contact.rateAndroid'),
                    icon: {
                        ios: 'star',
                        android: 'star',
                        web: 'Star',
                    },
                    onPress: () => {
                        if (Platform.OS === 'android') {
                            void Linking.openURL(
                                'market://details?id=app.neuland&showAllReviews=true'
                            )
                        } else {
                            void Linking.openURL(
                                'itms-apps://apps.apple.com/app/neuland-next/id1617096811?action=write-review'
                            )
                        }
                    },
                },
            ],
        },

        {
            header: t('about.formlist.legal.title'),
            items: [
                {
                    title: t('about.formlist.legal.button'),
                    icon: chevronIcon,
                    onPress: () => {
                        router.navigate('/legal')
                    },
                },
            ],
        },
    ]

    const handlePress = (): void => {
        setPressCount(pressCount + 1)

        if (pressCount === 7) {
            Alert.alert(
                t('about.easterEgg.title'),
                Platform.OS === 'ios'
                    ? t('about.easterEgg.message')
                    : t('about.easterEgg.messageAndroid'),
                [
                    {
                        text: t('about.easterEgg.confirm'),
                        style: 'cancel',
                    },
                ],
                { cancelable: false }
            )
            const isCollected = unlockedAppIcons?.includes('cat')
            if (!isCollected) {
                trackEvent('EasterEgg', { easterEgg: 'aboutLogo' })
                if (Platform.OS === 'ios') addUnlockedAppIcon('cat')
            }

            setPressCount(0)
        }
    }
    const [pressCount, setPressCount] = useState(0)
    const handleWebsitePress = (): void => {
        Linking.openURL('https://neuland-ingolstadt.de/').catch((err) => {
            console.error('Failed to open URL:', err)
        })
    }

    const handleContributorsPress = (): void => {
        const url =
            'https://next.neuland.app/' +
            (i18n.language === 'en' ? 'en/' : '') +
            'about/contributors'
        Linking.openURL(url).catch((err) => {
            console.error('Failed to open URL:', err)
        })
    }
    return (
        <>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Pressable
                            onPress={() => {
                                void Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Medium
                                )
                                handlePress()
                            }}
                        >
                            <View style={styles.logoIcon}>
                                <Image
                                    source={require('@/assets/appIcons/default.png')}
                                    alt="Neuland Next Logo"
                                    style={styles.logoImage}
                                />
                            </View>
                        </Pressable>

                        <View style={styles.logoTextContainer}>
                            <View style={styles.appTitleContainer}>
                                <Text style={styles.header}>
                                    {'Neuland Next'}
                                </Text>
                                <Text style={styles.text}>
                                    {'Native Version'}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.subHeader}>
                                    {t('about.header.developed')}
                                </Text>
                                <Pressable onPress={handleWebsitePress}>
                                    <Text
                                        style={styles.text}
                                        onPress={handleContributorsPress}
                                    >
                                        {'Neuland Ingolstadt e.V.'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
                <SectionView
                    title={t('about.analytics.title')}
                    footer={t('about.analytics.message')}
                    link={{
                        text: t('about.analytics.link'),
                        destination: () => {
                            void Linking.openURL(PRIVACY_URL + '#Analytics')
                        },
                    }}
                >
                    <SingleSectionPicker
                        title={t('about.analytics.toggle')}
                        selectedItem={analyticsAllowed ?? false}
                        action={setAnalyticsAllowed}
                        state={analyticsAllowed ?? false}
                    />
                </SectionView>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    appTitleContainer: {
        marginBottom: 10,
    },
    container: {
        paddingBottom: 20,
        paddingTop: 30,
    },
    contentContainer: {
        paddingBottom: theme.margins.bottomSafeArea,
    },
    formlistContainer: {
        alignSelf: 'center',
        marginTop: 10,
        paddingHorizontal: theme.margins.page,
        width: '100%',
    },
    header: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: 'bold',
    },
    logoContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    logoIcon: {
        backgroundColor: theme.colors.card,
        borderRadius: 9,
        boxShadow: `4 4 10 0 ${theme.colors.labelTertiaryColor}`,
        shadowColor: theme.colors.text,
    },
    logoImage: {
        borderRadius: 9,
        flex: 1,
        height: 100,
        resizeMode: 'contain',
        width: 100,
    },
    logoTextContainer: {
        flexDirection: 'column',
    },
    subHeader: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    text: {
        color: theme.colors.text,
        fontSize: 16,
    },
}))
