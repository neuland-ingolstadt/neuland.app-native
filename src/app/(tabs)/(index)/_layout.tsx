import { IndexHeaderRight } from '@/components/Elements/Dashboard/HeaderRight'
import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

export default function IndexStack(): JSX.Element {
    return (
        <Stack
            screenOptions={{
                headerShown: Platform.OS === 'android',
                title: 'Neuland Next',
                headerRight: () => <IndexHeaderRight />,
            }}
        ></Stack>
    )
}
