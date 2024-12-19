import React from 'react'
import { type ColorValue, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

/**
 * Avatar component that displays a circular image or icon with optional shadow and background color.
 * @param size The size of the avatar in pixels. Defaults to 50.
 * @param background The background color of the avatar.
 * @param children The content to display inside the avatar.
 * @returns A JSX element representing the Avatar component.
 */
const Avatar = ({
    size = 50,
    background,
    children,
}: {
    size?: number
    background?: ColorValue
    children: JSX.Element
}): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)

    return <View style={styles.avatar(size, background)}>{children}</View>
}

const stylesheet = createStyleSheet((theme) => ({
    avatar: (size: number, background?: ColorValue) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background ?? theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    }),
}))

export default Avatar
