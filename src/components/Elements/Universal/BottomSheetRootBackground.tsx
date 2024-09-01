import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

export const BottomSheetRootBackground = (): JSX.Element => {
    const { colors, dark } = useTheme()
    console.log(dark)
    const darkIos = 'rgba(0, 0, 0, 0.3)'
    const lightIos = 'rgba(255, 255, 255, 0.5)'
    return Platform.OS === 'ios' ? (
        <View
            style={[
                styles.bottomSheet,
                {
                    backgroundColor: dark ? darkIos : lightIos,
                },
            ]}
        >
            <BlurView
                intensity={dark ? 80 : 50}
                style={StyleSheet.absoluteFillObject}
                tint={dark ? 'dark' : 'light'}
            />
        </View>
    ) : (
        <View
            style={[styles.bottomSheet, { backgroundColor: colors.background }]}
        />
    )
}

export const renderBackdrop = (
    props: BottomSheetBackdropProps
): JSX.Element => (
    <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.3}
    />
)

const styles = StyleSheet.create({
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
})
