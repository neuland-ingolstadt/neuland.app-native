import BottomSheet from '@/components/Elements/Layout/BottomSheet'
import {
    BottomSheetRootBackground,
    renderBackdrop,
} from '@/components/Elements/Universal/BottomSheetRootBackground'
import { type Colors } from '@/components/colors'
import '@react-navigation/elements'
import { useTheme } from '@react-navigation/native'
import { Slot } from 'expo-router'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
    initialRouteName: 'index',
}

export default function Layout(): JSX.Element {
    const colors = useTheme().colors as Colors
    if (typeof window === 'undefined') return <Slot />

    return (
        <BottomSheet
            screenOptions={{
                snapPoints: ['55%', '80%'],
                backgroundComponent: () => <BottomSheetRootBackground />,
                handleIndicatorStyle: {
                    backgroundColor: colors.labelSecondaryColor,
                },
                backdropComponent: renderBackdrop,
                enableDynamicSizing: true,
            }}
        />
    )
}
