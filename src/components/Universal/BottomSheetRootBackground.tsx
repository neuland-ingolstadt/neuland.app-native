import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import type React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

export const BottomSheetRootBackground = (): React.JSX.Element => {
    const darkIos = 'rgba(39, 39, 39, 0.4)'
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
): React.JSX.Element => (
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
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        overflow: 'hidden',
    },
}))
