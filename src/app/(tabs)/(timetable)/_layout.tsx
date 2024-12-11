import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function TimetableStack(): JSX.Element {
    const { t } = useTranslation('navigation')
    const { styles, theme } = useStyles(stylesheet)
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                title: t('navigation.timetable'),
                headerStyle: styles.headerBackground,
                headerTitleStyle: styles.headerTextStyle,
                headerTintColor: theme.colors.primary,
                contentStyle: styles.background,
            }}
        ></Stack>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    background: { backgroundColor: theme.colors.background },
    headerBackground: { backgroundColor: theme.colors.card },
    headerTextStyle: { color: theme.colors.text },
}))
