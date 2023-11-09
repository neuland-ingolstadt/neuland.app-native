import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

import { version } from '../../../package.json'

export default function About(): JSX.Element {
    const PRIVACY_URL: string = process.env.EXPO_PUBLIC_PRIVACY_URL as string
    const IMPRINT_URL: string = process.env.EXPO_PUBLIC_IMPRINT_URL as string
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t } = useTranslation(['settings'])
    const sections: FormListSections[] = [
        {
            header: t('about.formlist.legal.title'),
            items: [
                {
                    title: t('about.formlist.legal.privacy'),
                    icon: 'shield',
                    onPress: async () => await Linking.openURL(PRIVACY_URL),
                },
                {
                    title: t('about.formlist.legal.imprint'),
                    icon: 'information-circle',
                    onPress: async () => await Linking.openURL(IMPRINT_URL),
                },
            ],
        },
        {
            header: t('about.formlist.about.title'),
            items: [
                {
                    title: 'Feedback',
                    icon: 'chatbox-ellipses-outline',
                    onPress: async () =>
                        await Linking.openURL(
                            'mailto:app-feedback@informatik.sexy?subject=Feedback%20Neuland-Next'
                        ),
                },
                {
                    title: 'Github',
                    icon: 'logo-github',
                    onPress: async () =>
                        await Linking.openURL(
                            'https://github.com/neuland-ingolstadt/neuland.app-native'
                        ),
                },
                {
                    title: 'Website',
                    icon: 'globe',
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
                    disabled: true,
                },
                {
                    title: 'Changelog',
                    icon: 'newspaper-outline',
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
            alert('You found the easter egg!')
            setPressCount(0)
        }
    }
    const [pressCount, setPressCount] = useState(0)
    return (
        <>
            <ScrollView>
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
                                    source={require('@/assets/icon.png')}
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
        paddingHorizontal: 16,
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
