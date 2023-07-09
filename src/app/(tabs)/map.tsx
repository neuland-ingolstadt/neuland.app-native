import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { MapScreen } from '../../screens/map/screen'

const Stack2 = createNativeStackNavigator()

export default function Screen(): JSX.Element {
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                    headerBackButtonMenuEnabled: false,
                }}
            />
            <Stack2.Navigator>
                <Stack2.Screen
                    name="Map"
                    options={{
                        title: 'Campus Map',
                        headerShown: true,
                        headerLargeTitle: true,
                        ...Platform.select({
                            ios: {
                                headerTransparent: true,
                                headerBlurEffect: 'systemMaterial',
                            },
                        }),
                        headerSearchBarOptions: {
                            placeholder: 'Search for rooms, buildings, etc.',
                        },
                    }}
                    component={MapScreen}
                />
            </Stack2.Navigator>
        </>
    )
}
