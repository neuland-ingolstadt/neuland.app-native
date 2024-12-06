import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function FoodStack(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: styles.headerBackground,
                headerTitleStyle: styles.headerTextStyle,
                headerTintColor: theme.colors.primary,
                contentStyle: styles.background,
                title: t('navigation.food'),
            }}
        ></Stack>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    background: { backgroundColor: theme.colors.background },
    headerBackground: { backgroundColor: theme.colors.card },
    headerTextStyle: { color: theme.colors.text },
}))
