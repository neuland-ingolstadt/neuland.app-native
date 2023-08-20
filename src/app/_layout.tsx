import Provider from '@/stores/provider'
import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Platform, useColorScheme } from 'react-native'

export default function RootLayout(): JSX.Element {
    const router = useRouter()
    const theme = useColorScheme()
    const colorText = theme === 'dark' ? 'white' : 'black' // Use the theme value instead of dark

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
                            title: 'Settings',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(food)/preferences"
                        options={{
                            title: 'Preferences',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(food)/flags"
                        options={{
                            title: 'Flags',
                            headerSearchBarOptions: {
                                placeholder: 'Search flags',
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
                            },
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
                            title: 'Allergens',

                            headerSearchBarOptions: {
                                placeholder: 'Search allergens',
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
                            title: 'Details',
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
                            title: 'Accent Color',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/profile"
                        options={{
                            title: 'Profile',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(user)/about"
                        options={{
                            title: 'About',
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
                        name="(map)/advanced"
                        options={{
                            title: 'Advanced Search',
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name="(pages)/events"
                        options={{
                            title: 'Campus Life Events',
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
                            title: 'Calendar',
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
                            title: 'Exam Details',
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
                            title: 'Lecturers',
                            ...Platform.select({
                                android: {
                                    animation: 'slide_from_right',
                                },
                            }),
                            headerSearchBarOptions: {
                                placeholder: 'Search all lecturers',
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
                            title: 'Lecturer Details',
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
                </Stack>
            </Provider>
        </>
    )
}
