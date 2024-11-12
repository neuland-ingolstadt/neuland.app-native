import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function FoodStack(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')
    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const paddingTop = hasDynamicIsland ? topInset : 0
    return (
        <View
            style={{
                ...styles.page,
                paddingTop,
            }}
        >
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
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    background: { backgroundColor: theme.colors.background },
    headerBackground: { backgroundColor: theme.colors.card },
    headerTextStyle: { color: theme.colors.text },
    page: {
        backgroundColor: theme.colors.card,
        flex: 1,
    },
}))
