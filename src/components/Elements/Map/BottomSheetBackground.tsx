import { useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

const BottomSheetBackground = (): JSX.Element => {
    const { colors, dark } = useTheme()
    const darkIos = 'rgba(0, 0, 0, 0.47)'
    const lightIos = 'rgba(255, 255, 255, 0.2)'
    return Platform.OS === 'ios' ? (
        <View
            style={[
                styles.bottomSheet,
                {
                    backgroundColor: dark ? darkIos : lightIos,
                },
            ]}
        >
            <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
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

export default BottomSheetBackground
