import i18n from '@/localization/i18n'
import Provider from '@/stores/provider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, useColorScheme } from 'react-native'

export default function RootLayout(): JSX.Element {
    const router = useRouter()
    const theme = useColorScheme()
    const colorText = theme === 'dark' ? 'white' : 'black' // Use the theme value instead of dark
    const { t } = useTranslation('navigation')

    useEffect(() => {
        const loadLanguage = async (): Promise<void> => {
            const savedLanguage = await AsyncStorage.getItem('language')
            if (savedLanguage !== null) {
                await i18n.changeLanguage(savedLanguage)
            }
        }

        void loadLanguage()
    }, [])
    return (
        <>
            <Provider>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="(user)/login"
                        options={{
                            title: 'Login',
                            presentation: 'formSheet',
                            gestureEnabled: false,
                        }}
                    />
                    <Stack.Screen
                        name="(user)/settings"
                        options={{
                            title: t('navigation.settings'),
                            headerBackTitleVisible: false,
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/changelog"
                        options={{
                            title: 'Changelog',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(food)/preferences"
                        options={{
                            title: t('navigation.preferences'),
                            headerBackTitleVisible: false,
                            animation: 'slide_from_right',
                        }}
                    />

                    <Stack.Screen
                        name="(food)/flags"
                        options={{
                            headerShown: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(food)/allergens"
                        options={{
                            headerShown: false,

                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(food)/details"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(timetable)/details"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(timetable)/webView"
                        options={{
                            title: t('navigation.details'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(user)/theme"
                        options={{
                            title: t('navigation.theme'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/profile"
                        options={{
                            title: t('navigation.profile'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/about"
                        options={{
                            title: t('navigation.about'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/dashboard"
                        options={{
                            title: 'Dashboard',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/grades"
                        options={{
                            title: t('navigation.grades'),
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(map)/advanced"
                        options={{
                            title: t('navigation.advancedSearch'),
                            headerBackTitleVisible: false,
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/events"
                        options={{
                            title: 'Campus Life Events',
                            headerBackTitleVisible: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/calendar"
                        options={{
                            title: t('navigation.calendar'),
                            headerBackTitleVisible: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/exam"
                        options={{
                            title: t('navigation.examDetails'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/lecturers"
                        options={{
                            title: t('navigation.lecturers.title'),
                            headerBackTitleVisible: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                            headerSearchBarOptions: {
                                placeholder: t('navigation.lecturers.search'),
                                ...Platform.select({
                                    android: {
                                        headerIconColor: colorText,
                                        textColor: colorText,
                                        hintTextColor: colorText,
                                        tintColor: colorText,
                                    },
                                }),
                                hideWhenScrolling: false,
                                onChangeText: (event) => {
                                    router.setParams({
                                        q: event.nativeEvent.text,
                                    })
                                },
                                shouldShowHintSearchIcon: false,
                            },
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/lecturer"
                        options={{
                            title: t('navigation.lecturer'),
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    presentation: 'modal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/mobility"
                        options={{
                            title: t('navigation.mobility'),
                            headerBackTitleVisible: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/news"
                        options={{
                            title: t('navigation.news'),
                            headerBackTitleVisible: false,
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                                ios: {
                                    // blurry header
                                    headerTranslucent: true,
                                    headerBlurEffect: 'regular',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(flow)/onboarding"
                        options={{
                            headerShown: false,
                            animation: 'none',
                            gestureEnabled: false,
                            ...Platform.select({
                                ios: {
                                    presentation: 'fullScreenModal',
                                },
                            }),
                        }}
                    />
                    <Stack.Screen
                        name="(flow)/whatsnew"
                        options={{
                            headerShown: false,
                            gestureEnabled: false,
                            ...Platform.select({
                                ios: {
                                    presentation: 'formSheet',
                                },
                            }),
                        }}
                    />
                </Stack>
            </Provider>
        </>
    )
}
