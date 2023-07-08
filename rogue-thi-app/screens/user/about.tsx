import FormList from '@components/FormList'
import { type FormListSections } from '@customTypes/components'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Box, HStack, Image, ScrollView, Text, VStack } from 'native-base'
import React, { useState } from 'react'
import { Linking, Pressable, useColorScheme } from 'react-native'

import { version } from '../../package.json'

export function AboutScreen(): JSX.Element {
    const router = useRouter()
    const scheme = useColorScheme()
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
                <VStack space={4} alignItems="center" paddingTop={10}>
                    <HStack space={4} alignItems="center">
                        <Pressable
                            onPress={() => {
                                void Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Medium
                                )
                                handlePress()
                            }}
                        >
                            <Box shadow={9} rounded={'lg'}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    alt="Neuland Next Logo"
                                    size="xl"
                                    rounded="lg"
                                />
                            </Box>
                        </Pressable>

                        <VStack space={2}>
                            <VStack>
                                <Text fontSize="xl" fontWeight="bold">
                                    Neuland App
                                </Text>
                                <Text fontSize="md">Native Version</Text>
                            </VStack>
                            <VStack>
                                <Text fontSize="md" fontWeight="bold">
                                    Developed by
                                </Text>
                                <Text fontSize="md">
                                    Neuland Ingolstadt e.V.
                                </Text>
                            </VStack>
                        </VStack>
                    </HStack>
                </VStack>

                <FormList sections={sections} scheme={scheme} />
            </ScrollView>
        </>
    )
}
