import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function TimetableStack(): JSX.Element {
    const { t } = useTranslation('navigation')
    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const paddingTop = hasDynamicIsland ? topInset : 0
    const { styles } = useStyles(stylesheet)
    return (
        <View style={{ ...styles.page, paddingTop }}>
            <Stack
                screenOptions={{
                    headerShown: true,
                    title: t('navigation.timetable'),
                    headerStyle: styles.headerBackground,
                    headerTitleStyle: styles.headerTextStyle,
                    headerTintColor: styles.headerTintColor.color,
                    contentStyle: styles.background,
                }}
            ></Stack>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    blurTab: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerTextStyle: { color: theme.colors.text },
    headerTintColor: { color: theme.colors.primary },
    headerBackground: { backgroundColor: theme.colors.card },
    background: { backgroundColor: theme.colors.background },
    page: {
        flex: 1,
        backgroundColor: theme.colors.card,
    },
}))
