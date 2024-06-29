import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

export default function FoodStack(): JSX.Element {
    return (
        <Stack
            screenOptions={{
                headerShown: Platform.OS === 'android',
                title: 'Neuland Next',
            }}
        ></Stack>
    )
}
