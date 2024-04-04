import FormList from '@/components/Elements/Universal/FormList'
import { chevronIcon, linkIcon } from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import SingleSectionPicker from '@/components/Elements/Universal/SingleSectionPicker'
import { type Colors } from '@/components/colors'
import { AppIconContext, FlowContext } from '@/components/contexts'
import { type FormListSections } from '@/types/components'
import { IMPRINT_URL, PRIVACY_URL } from '@/utils/app-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
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

import { version } from '../../../package.json'

export default function About(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])
    const { analyticsAllowed, toggleAnalytics } = React.useContext(FlowContext)
    const { addUnlockedAppIcon } = useContext(AppIconContext)
    const sections: FormListSections[] = [
        {
            header: t('about.formlist.legal.title'),
            items: [
                {
                    title: t('about.formlist.legal.privacy'),
                    icon: {
                        ios: 'hand.raised',
                        android: 'lock_open',
                    },
                    onPress: async () => await Linking.openURL(PRIVACY_URL),
                },
                {
                    title: t('about.formlist.legal.imprint'),
                    icon: linkIcon,
                    onPress: async () => await Linking.openURL(IMPRINT_URL),
                },
                {
                    title: t('navigation.licenses', { ns: 'navigation' }),
                    icon: chevronIcon,
                    onPress: () => {
                        router.push('(user)/licenses')
                    },
                },
            ],
        },
        {
            header: t('about.formlist.about.title'),
            items: [
                {
                    title: 'Feedback',
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
                    title: 'Github',
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
                    title: 'Website',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL('https://neuland-ingolstadt.de/'),
                },
            ],
        },
        {
            header: 'App',
            items: [
                {
                    title: 'Version',
                    value: version,
                },
                {
                    title: 'Changelog',
                    icon: chevronIcon,
                    onPress: () => {
                        router.push('(user)/changelog')
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
            if (Platform.OS === 'ios') {
                addUnlockedAppIcon('cat')
            }
            setPressCount(0)
        }
    }
    const [pressCount, setPressCount] = useState(0)
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
                                    Neuland Next
                                </Text>
                                <Text
                                    style={[
                                        { color: colors.text },
                                        styles.text,
                                    ]}
                                >
                                    Native Version
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
                                <Text
                                    style={[
                                        { color: colors.text },
                                        styles.text,
                                    ]}
                                >
                                    Neuland Ingolstadt e.V.
                                </Text>
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
                >
                    <SingleSectionPicker
                        title={t('about.analytics.toggle')}
                        selectedItem={analyticsAllowed ?? false}
                        action={toggleAnalytics}
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
