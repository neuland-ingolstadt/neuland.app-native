import Provider from '@/stores/provider'
import { Stack, useRouter } from 'expo-router'
import React from 'react'

export default function RootLayout(): JSX.Element {
    const router = useRouter()
    return (
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
                            headerIconColor: 'grey',
                            hideWhenScrolling: false,
                            onChangeText: (event) => {
                                console.log('text', event.nativeEvent.text)
                                router.setParams({
                                    q: event.nativeEvent.text,
                                })
                            },
                        },
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="(food)/allergens"
                    options={{
                        title: 'Allergens',
                        headerSearchBarOptions: {
                            placeholder: 'Search allergens',
                            headerIconColor: 'grey',
                            hideWhenScrolling: false,
                            onChangeText: (event) => {
                                console.log('text', event.nativeEvent.text)
                                router.setParams({
                                    q: event.nativeEvent.text,
                                })
                            },
                        },
                        presentation: 'modal',
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
            </Stack>
        </Provider>
    )
}
