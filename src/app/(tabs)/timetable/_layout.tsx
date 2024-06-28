import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

export default function TimetableStack(): JSX.Element {
    const { t } = useTranslation('navigation')
    return (
        <Stack
            screenOptions={{
                headerShown: Platform.OS === 'android',
                title: t('navigation.timetable'),
            }}
        >
            <Stack.Screen
                name="timetable"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}
