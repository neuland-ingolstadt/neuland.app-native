import { useTheme } from '@react-navigation/native'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

const BottomSheetBackground = (): JSX.Element => {
    const { colors } = useTheme()

    return Platform.OS === 'ios' ? (
        // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
        <View style={[styles.bottomSheet, { backgroundColor: 'transparent' }]}>
            <BlurView intensity={87} style={StyleSheet.absoluteFillObject} />
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
