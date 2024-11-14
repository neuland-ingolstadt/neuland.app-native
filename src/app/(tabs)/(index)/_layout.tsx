import BottomSheet from '@/components/Layout/BottomSheet'
import {
    BottomSheetRootBackground,
    renderBackdrop,
} from '@/components/Universal/BottomSheetRootBackground'
import '@react-navigation/elements'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Slot } from 'expo-router'
import React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
    initialRouteName: 'index',
}

export default function Layout(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    if (typeof window === 'undefined') return <Slot />

    return (
        <BottomSheet
            screenOptions={{
                snapPoints: ['55%', '80%'],
                backgroundComponent: () => <BottomSheetRootBackground />,
                handleIndicatorStyle: styles.indicator,
                backdropComponent: renderBackdrop,
                enableDynamicSizing: true,
            }}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    indicator: {
        backgroundColor: theme.colors.labelSecondaryColor,
    },
}))
