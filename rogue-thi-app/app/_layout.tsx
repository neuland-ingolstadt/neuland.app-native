import { Stack } from 'expo-router'
import React from 'react'

import { Provider } from '../provider'

export default function RootLayout(): JSX.Element {
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
                        presentation: 'modal',
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="(food)/detail"
                    options={{
                        title: 'Food Detail',
                    }}
                />
                <Stack.Screen
                    name="(user)/settings"
                    options={{
                        title: 'Settings',
                    }}
                />
                <Stack.Screen
                    name="(user)/profile"
                    options={{
                        title: 'Profile',
                    }}
                />
                <Stack.Screen
                    name="(user)/about"
                    options={{
                        title: 'About',
                    }}
                />
            </Stack>
        </Provider>
    )
}
