import BottomSheet from '@/components/Elements/Layout/BottomSheet'
import BottomSheetRootBackground from '@/components/Elements/Universal/BottomSheetRootBackground'
import { type Colors } from '@/components/colors'
import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import '@react-navigation/elements'
import { useTheme } from '@react-navigation/native'
import { Slot } from 'expo-router'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
    initialRouteName: 'index',
}
const renderBackdrop = (props: BottomSheetBackdropProps): JSX.Element => (
    <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
    />
)

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
                stackBehavior: 'replace',
                enableDynamicSizing: true,
            }}
        />
    )
}
