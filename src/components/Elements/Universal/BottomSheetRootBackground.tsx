import { useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

const BottomSheetRootBackground = (): JSX.Element => {
    const { colors, dark } = useTheme()
    const darkIos = 'rgba(0, 0, 0, 0.45)'
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
                intensity={dark ? 70 : 50}
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

const styles = StyleSheet.create({
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
})

export default BottomSheetRootBackground
