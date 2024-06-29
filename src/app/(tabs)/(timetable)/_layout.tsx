import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function TimetableStack(): JSX.Element {
    const { t } = useTranslation('navigation')
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                title: t('navigation.timetable'),
            }}
        ></Stack>
    )
}
