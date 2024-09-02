import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon } from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import SingleSectionPicker from '@/components/Elements/Universal/SingleSectionPicker'
import { type Colors } from '@/components/colors'
import { FlowContext, PreferencesContext } from '@/components/contexts'
import { PRIVACY_URL, STATUS_URL } from '@/data/constants'
import { type FormListSections } from '@/types/components'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import * as Application from 'expo-application'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function About(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])
    const { analyticsAllowed, setAnalyticsAllowed } =
        React.useContext(FlowContext)
    const { unlockedAppIcons, addUnlockedAppIcon } =
        useContext(PreferencesContext)
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
                        router.navigate('changelog')
                    },
                },
                {
                    title: 'System Status',
                    icon: {
                        ios: 'bubble.left.and.exclamationmark.bubble.right',
                        android: 'troubleshoot',
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
                    },
                    onPress: async () =>
                        await Linking.openURL(
                            'mailto:app-feedback@informatik.sexy?subject=Feedback%20Neuland-Next'
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
                        router.navigate('legal')
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

    return (
        <>
            <ScrollView
                contentContainerStyle={{ paddingBottom: PAGE_BOTTOM_SAFE_AREA }}
            >
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
                            <View
                                style={[
                                    styles.logoIcon,
                                    {
                                        shadowColor: colors.text,
                                        backgroundColor: colors.card,
                                    },
                                ]}
                            >
                                <Image
                                    source={require('@/assets/appIcons/default.png')}
                                    alt="Neuland Next Logo"
                                    style={styles.logoImage}
                                />
                            </View>
                        </Pressable>

                        <View style={styles.logoTextContainer}>
                            <View style={styles.appTitleContainer}>
                                <Text
                                    style={[
                                        { color: colors.text },
                                        styles.header,
                                    ]}
                                >
                                    {'Neuland Next'}
                                </Text>
                                <Text
                                    style={[
                                        { color: colors.text },
                                        styles.text,
                                    ]}
                                >
                                    {'Native Version'}
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={[
                                        { color: colors.text },
                                        styles.subHeader,
                                    ]}
                                >
                                    {t('about.header.developed')}
                                </Text>
                                <Pressable onPress={handleWebsitePress}>
                                    <Text
                                        style={[
                                            { color: colors.text },
                                            styles.text,
                                        ]}
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
