import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function FoodStack(): JSX.Element {
    const { t } = useTranslation('navigation')
    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const paddingTop = hasDynamicIsland ? topInset : 0
    const colors = useTheme().colors as Colors
    return (
        <View
            style={{
                ...styles.page,
                paddingTop,
                backgroundColor: colors.card,
            }}
        >
            <Stack
                screenOptions={{
                    headerShown: true,

                    title: t('navigation.food'),
                }}
            ></Stack>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
})
