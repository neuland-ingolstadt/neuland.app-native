import { Ionicons } from '@expo/vector-icons'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Stack, useRouter } from 'expo-router'
import { Button } from 'native-base'
import React from 'react'
import { useColorScheme } from 'react-native'

import { HomeScreen } from '../../screens/home/screen'

const Stack2 = createNativeStackNavigator()

export default function Screen(): JSX.Element {
    const scheme = useColorScheme()
    const router = useRouter()

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
                    name="Home"
                    options={{
                        title: 'Neuland App',
                        headerShown: true,
                        headerLargeTitle: true,
                        headerRight: () => (
                            <Button
                                onPress={() => {
                                    router.push('(user)/settings')
                                }}
                                variant="ghost-sharp"
                            >
                                <Ionicons
                                    name="cog-outline"
                                    size={24}
                                    color={
                                        scheme === 'dark' ? 'white' : 'black'
                                    }
                                />
                            </Button>
                        ),
                    }}
                    component={HomeScreen}
                />
            </Stack2.Navigator>
        </>
    )
}
