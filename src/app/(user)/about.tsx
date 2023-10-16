import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
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
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const sections: FormListSections[] = [
        {
            header: 'Legal',
            items: [
                {
                    title: 'Privacy Policy',
                    icon: 'shield',
                    onPress: () => {
                        router.push('(user)/privacy')
                    },
                },
                {
                    title: 'Terms of Use',
                    icon: 'document-text',
                    onPress: () => {
                        router.push('(user)/terms')
                    },
                },
                {
                    title: 'Imprint',
                    icon: 'information-circle',
                    onPress: () => {
                        router.push('(user)/imprint')
                    },
                },
            ],
        },
        {
            header: 'About us',
            items: [
                {
                    title: 'Feedback',
                    icon: 'chatbox-ellipses-outline',
                    onPress: async () =>
                        await Linking.openURL(
                            'mailto:info@neuland-ingolstadt.de?subject=Feedback%20Neuland-App-Native'
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

                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ marginBottom: 10 }}>
                                <Text
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 'bold',
                                        color: colors.text,
                                    }}
                                >
                                    Neuland App
                                </Text>
                                <Text
                                    style={{ fontSize: 16, color: colors.text }}
                                >
                                    Native Version
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        color: colors.text,
                                    }}
                                >
                                    Developed by
                                </Text>
                                <Text
                                    style={{ fontSize: 16, color: colors.text }}
                                >
                                    Neuland Ingolstadt e.V.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View
                    style={{
                        paddingHorizontal: 16,
                        width: '100%',
                        alignSelf: 'center',
                    }}
                >
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
})
