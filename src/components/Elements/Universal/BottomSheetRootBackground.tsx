import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

export const BottomSheetRootBackground = (): JSX.Element => {
    const darkIos = 'rgba(0, 0, 0, 0.3)'
    const lightIos = 'rgba(255, 255, 255, 0.5)'
    const { styles } = useStyles(stylesheet)
    const dark = UnistylesRuntime.themeName === 'dark'
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
        <View style={styles.bottomSheet} />
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

const stylesheet = createStyleSheet((theme) => ({
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
    },
}))
